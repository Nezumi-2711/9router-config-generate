import { useState, useMemo, useCallback } from 'react';
import type { ToolId, ConnectionConfig, Model } from './types';
import { mockModels } from './data/mockModels';
import { tools, toolList } from './data/tools';
import { Header } from './components/Header';
import { ConnectionForm } from './components/ConnectionForm';
import { ModelList } from './components/ModelList';
import { ToolSelector } from './components/ToolSelector';
import { ConfigPreview } from './components/ConfigPreview';
import { fetchRemoteModels } from './services/modelService';

export function App() {
	const [connection, setConnection] = useState<ConnectionConfig>({
		baseUrl: '',
		apiKey: '',
	});

	const [models, setModels] = useState<Model[]>(mockModels);
	const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
	const [selectedToolId, setSelectedToolId] = useState<ToolId>('copilot');
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoadingModels, setIsLoadingModels] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [isLive, setIsLive] = useState(false);

	const handleFetchModels = useCallback(
		async (overrideConfig?: ConnectionConfig) => {
			const cfg = overrideConfig || connection;
			if (!cfg.baseUrl || !cfg.baseUrl.trim()) {
				setFetchError('Please enter a valid Base URL');
				return;
			}

			setIsLoadingModels(true);
			setFetchError(null);

			try {
				const fetched = await fetchRemoteModels(cfg);
				if (fetched.length > 0) {
					setModels(fetched);
					setIsLive(true);
					// Default select the first 2-3 models if nothing selected or preserve existing matching IDs
					setSelectedModelIds((prev) => {
						const validPrev = prev.filter((id) =>
							fetched.some((m) => m.id === id),
						);
						if (validPrev.length > 0) return validPrev;
						return fetched
							.slice(0, Math.min(3, fetched.length))
							.map((m) => m.id);
					});
				}
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : 'Unknown error';
				setFetchError(message);
			} finally {
				setIsLoadingModels(false);
			}
		},
		[connection],
	);

	const handleToggleModel = (id: string) => {
		setSelectedModelIds((prev) =>
			prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id],
		);
	};

	const handleSelectAll = () => {
		const q = searchQuery.toLowerCase().trim();
		const visibleIds = models
			.filter(
				(m) =>
					!q ||
					m.id.toLowerCase().includes(q) ||
					m.name.toLowerCase().includes(q) ||
					(m.provider && m.provider.toLowerCase().includes(q)) ||
					(m.description && m.description.toLowerCase().includes(q)),
			)
			.map((m) => m.id);

		setSelectedModelIds((prev) =>
			Array.from(new Set([...prev, ...visibleIds])),
		);
	};

	const handleDeselectAll = () => {
		const q = searchQuery.toLowerCase().trim();
		const visibleIds = new Set(
			models
				.filter(
					(m) =>
						!q ||
						m.id.toLowerCase().includes(q) ||
						m.name.toLowerCase().includes(q) ||
						(m.provider && m.provider.toLowerCase().includes(q)) ||
						(m.description && m.description.toLowerCase().includes(q)),
				)
				.map((m) => m.id),
		);

		setSelectedModelIds((prev) => prev.filter((id) => !visibleIds.has(id)));
	};

	const selectedModels = useMemo(() => {
		return models.filter((m) => selectedModelIds.includes(m.id));
	}, [models, selectedModelIds]);

	const activeTool = tools[selectedToolId] || tools.copilot;

	return (
		<div className="min-h-screen flex flex-col bg-(--app-bg) text-(--app-fg)">
			<Header />

			<main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
				<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] gap-6 items-start">
					{/* Left Controls Pane */}
					<div className="flex flex-col gap-6 min-w-0">
						<ConnectionForm
							connection={connection}
							onChange={(newConn) => {
								setConnection(newConn);
								setFetchError(null);
							}}
							onFetchModels={() => handleFetchModels()}
							isLoading={isLoadingModels}
							error={fetchError}
							modelsCount={models.length}
							isLive={isLive}
						/>

						<ModelList
							models={models}
							selectedIds={selectedModelIds}
							searchQuery={searchQuery}
							onSearchChange={setSearchQuery}
							onToggleModel={handleToggleModel}
							onSelectAll={handleSelectAll}
							onDeselectAll={handleDeselectAll}
							isLoading={isLoadingModels}
							isLive={isLive}
						/>

						<ToolSelector
							tools={toolList}
							selectedTool={selectedToolId}
							onSelectTool={setSelectedToolId}
						/>
					</div>

					{/* Right Sticky Preview Pane */}
					<div>
						<ConfigPreview
							tool={activeTool}
							connection={connection}
							selectedModels={selectedModels}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}

export default App;
