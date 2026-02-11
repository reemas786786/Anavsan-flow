
import React, { useState } from 'react';
import SidePanel from '../../components/SidePanel';
import ConfigureGitHubPanel from '../../components/ConfigureGitHubPanel';

const IconExternalLink: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

interface IntegrationsPageProps {
    onDisconnect: (onConfirm: () => void) => void;
}

const IntegrationsPage: React.FC<IntegrationsPageProps> = ({ onDisconnect }) => {
    const [githubState, setGithubState] = useState<{ isConnected: boolean; repoFullName: string | null; filePath: string | null }>({
        isConnected: false,
        repoFullName: null,
        filePath: null,
    });
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const handleSaveConnection = (repoFullName: string, filePath: string | null) => {
        setGithubState({ isConnected: true, repoFullName, filePath });
        setIsPanelOpen(false);
    };

    const handleDisconnect = () => {
        onDisconnect(() => {
            setGithubState({ isConnected: false, repoFullName: null, filePath: null });
        });
    };
    
    const connectedToText = githubState.repoFullName ? `${githubState.repoFullName}${githubState.filePath ? `/${githubState.filePath}` : ''}` : '';

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-text-primary">Integrations</h1>
            
            <div className="max-w-2xl">
                {!githubState.isConnected ? (
                    <div className="bg-white p-8 rounded-2xl shadow-sm flex flex-col">
                        <div className="flex-grow">
                            <h2 className="text-xl font-semibold text-text-strong">Connect GitHub</h2>
                            <p className="mt-2 text-text-secondary">Sync queries, automate workflows, and enhance collaboration.</p>
                            
                            <a href="#" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-link hover:underline">
                                Learn more about Git Integration
                                <IconExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setIsPanelOpen(true)} className="bg-primary text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
                                Connect with GitHub
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col">
                        <div className="flex-grow">
                            <h2 className="text-xl font-semibold text-text-strong">GitHub Connected</h2>
                            <p className="mt-1 text-text-secondary">
                                Connected to: <span className="font-medium text-text-primary">{connectedToText}</span>
                            </p>
                        </div>
                        <div className="mt-4 flex justify-end items-center gap-4">
                            <button onClick={() => setIsPanelOpen(true)} className="font-semibold px-4 py-2 rounded-md border border-border-color bg-surface hover:bg-surface-hover transition-colors shadow-sm">
                                Change
                            </button>
                            <button onClick={handleDisconnect} className="text-status-error font-semibold px-4 py-2 rounded-md hover:bg-status-error/10 transition-colors">
                                Disconnect
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <SidePanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                title="Configure GitHub Integration"
            >
                <ConfigureGitHubPanel
                    onCancel={() => setIsPanelOpen(false)}
                    onSave={handleSaveConnection}
                    connectedRepo={githubState.repoFullName}
                    connectedFilePath={githubState.filePath}
                />
            </SidePanel>
        </div>
    );
};

export default IntegrationsPage;