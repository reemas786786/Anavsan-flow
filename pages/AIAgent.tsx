
import React, { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
// Correct import as per guidelines
import { GoogleGenAI, Chat, Content } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { IconShare, IconDotsVertical, IconChevronDown, IconArrowUp, IconEdit, IconClipboardCopy, IconCheck, IconAIAgent, IconSearch, IconFlag } from '../constants';

// --- TYPES ---
interface Message {
    role: 'user' | 'model';
    text: string;
    timestamp: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
}

// --- ICONS ---
const AnavsanLogo: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="48" height="52" viewBox="0 0 48 52" fill="none">
        <path d="M26.0245 1.10411C26.5035 0.944589 27.0263 0.947640 27.4289 1.26015C27.8353 1.57579 27.8353 1.57579 27.4289 1.26015C26.0245 1.10411ZM23.0063 10.1675C18.5457 17.0145 14.8187 24.1166 11.563 31.4691C13.3624 30.4149 15.3197 29.6376 17.3675 29.1699L18.3344 28.9598C20.4134 28.5266 22.5251 28.2002 24.6202 27.8323C23.4817 22.1099 22.7559 16.2408 23.0063 10.1675Z" fill="url(#paint0_linear_splash)" stroke="url(#paint1_linear_splash)" strokeWidth="0.75"/>
        <defs>
            <linearGradient id="paint0_linear_splash" x1="23.9999" y1="1.54252" x2="23.9999" y2="50.4578" gradientUnits="userSpaceOnUse"><stop stopColor="#6932D5"/><stop offset="1" stopColor="#7163C6"/></linearGradient>
            <linearGradient id="paint1_linear_splash" x1="24" y1="1" x2="24" y2="51" gradientUnits="userSpaceOnUse"><stop stopColor="#6932D5"/><stop offset="1" stopColor="#7163C6"/></linearGradient>
        </defs>
    </svg>
);

const IconThumbUp: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.422 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M6.633 10.5l-1.822 1.822a2.25 2.25 0 00-3.183 3.183l1.414 1.414a2.25 2.25 0 003.183-3.183L6.633 10.5z" />
    </svg>
);

const IconThumbDown: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.862 10.5a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9l-1.822 1.822a2.25 2.25 0 000 3.183l1.414 1.414a2.25 2.25 0 003.183 0l1.822-1.222a2.25 2.25 0 000-3.183l-1.414-1.414a2.25 2.25 0 00-3.183 0z" />
    </svg>
);


// --- CHAT HISTORY SIDEBAR ---
const ChatHistorySidebar: React.FC<{
    chats: ChatSession[];
    activeChatId: string | null;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
}> = ({ chats, activeChatId, onSelectChat, onNewChat }) => {
    return (
        <aside className="w-64 bg-surface text-text-primary p-2 flex flex-col flex-shrink-0 border-r border-border-color">
            <div className="flex items-center justify-between p-2">
                <h3 className="text-base font-semibold text-text-strong">Chats</h3>
                <button onClick={onNewChat} className="p-2 rounded-lg hover:bg-surface-hover" aria-label="New Chat">
                    <IconEdit className="w-5 h-5" />
                </button>
            </div>
            <div className="relative mt-2">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconSearch className="h-4 w-4 text-text-muted" />
                </div>
                <input
                    type="search"
                    placeholder="Search chats..."
                    className="w-full pl-9 pr-3 py-2 bg-surface-nested border border-border-color rounded-lg text-sm focus:ring-1 focus:ring-primary"
                />
            </div>
            <nav className="mt-4 overflow-y-auto flex-1">
                <ul className="space-y-1">
                    {chats.map(chat => (
                        <li key={chat.id}>
                            <button
                                onClick={() => onSelectChat(chat.id)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg truncate transition-colors ${
                                    chat.id === activeChatId ? 'bg-surface-hover text-text-strong font-semibold' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                                }`}
                            >
                                {chat.title}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

// --- RICH MESSAGE COMPONENTS ---
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const highlightedCode = useMemo(() => {
        const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP BY', 'ORDER BY', 'LIMIT', 'AS', 'ON', 'WITH', 'INSERT', 'INTO', 'VALUES'];
        const pattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
        return code.replace(pattern, '<span class="text-primary font-bold">$1</span>');
    }, [code]);

    return (
        <div className="bg-surface-nested rounded-lg my-2 overflow-hidden border border-border-color">
            <div className="flex justify-between items-center px-4 py-1 bg-surface">
                <span className="text-xs font-semibold text-text-muted">{language || 'code'}</span>
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary">
                    {isCopied ? <IconCheck className="w-4 h-4 text-status-success"/> : <IconClipboardCopy className="w-4 h-4" />}
                    {isCopied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto"><code dangerouslySetInnerHTML={{ __html: highlightedCode }} /></pre>
        </div>
    );
};

const FormattedContent: React.FC<{ text: string, onPromptClick: (prompt: string) => void }> = ({ text, onPromptClick }) => {
    const parts = text.split(/(\`\`\`[\s\S]*?\`\`\`|\[.*?\])/g).filter(Boolean);

    return (
        <div className="prose prose-sm max-w-none text-text-primary prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-p:whitespace-pre-wrap">
            {parts.map((part, index) => {
                const codeBlockMatch = part.match(/\`\`\`(\w+)?\n([\s\S]*?)\`\`\`/);
                if (codeBlockMatch) {
                    const language = codeBlockMatch[1] || '';
                    const code = codeBlockMatch[2] || '';
                    
                    if(language === 'chart') {
                        try {
                            const chartData = JSON.parse(code);
                            if(chartData.type === 'bar') {
                                return <div key={index} style={{height: 200}} className="my-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData.data}><XAxis dataKey="name" fontSize={12}/><YAxis fontSize={12}/><Tooltip /><Bar dataKey="value" fill="var(--color-primary)" /></BarChart></ResponsiveContainer></div>
                            }
                        } catch (e) { /* ignore parse error */ }
                    }
                    
                    return <CodeBlock key={index} language={language} code={code} />;
                }
                
                const buttonMatch = part.match(/\[(.*?)\]/);
                if (buttonMatch) {
                    const buttonText = buttonMatch[1];
                    return <button key={index} onClick={() => onPromptClick(buttonText)} className="my-2 bg-primary/10 text-primary font-semibold px-3 py-1 rounded-md text-sm hover:bg-primary/20">{buttonText}</button>
                }

                const boldAndListFormatted = part
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>')
                    .replace(/<\/ul><ul>/g, ''); // merge lists

                return <span key={index} dangerouslySetInnerHTML={{ __html: boldAndListFormatted }} />;
            })}
        </div>
    );
};

const StructuredResponse: React.FC<{ text: string, onPromptClick: (prompt: string) => void }> = ({ text, onPromptClick }) => {
    const sections = text.split('---').map(s => s.trim()).filter(Boolean);
    const introText = sections.length > 1 && !sections[0].startsWith('**') ? sections.shift() : null;

    return (
        <div className="space-y-4">
            {introText && <p className="prose prose-sm max-w-none text-text-primary">{introText}</p>}
            {sections.map((section, index) => (
                <div key={index} className="bg-surface-nested p-4 rounded-lg border border-border-color">
                    <FormattedContent text={section} onPromptClick={onPromptClick} />
                </div>
            ))}
        </div>
    );
};


const ChatMessage: React.FC<{ message: Message, onPromptClick: (prompt: string) => void }> = ({ message, onPromptClick }) => {
    const isModel = message.role === 'model';
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

    return (
        <div className={`flex items-start gap-3 ${!isModel && 'justify-end'}`}>
            {isModel && (
                 <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10"><AnavsanLogo className="w-4 h-4" /></div>
            )}

            <div className={`flex flex-col gap-1 max-w-2xl ${!isModel ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                    {isModel ? (
                        <>
                            <span className="font-semibold text-text-strong">Anavsan AI</span>
                            <span>{message.timestamp}</span>
                        </>
                    ) : (
                        <>
                            <span>{message.timestamp}</span>
                            <span className="font-semibold text-text-strong">You</span>
                        </>
                    )}
                </div>

                <div className={`rounded-2xl p-4 ${isModel ? 'bg-surface border border-border-color' : 'bg-[#EFE9FE]'}`}>
                    {isModel ? (
                        <StructuredResponse text={message.text} onPromptClick={onPromptClick} />
                    ) : (
                        <p className="whitespace-pre-wrap text-text-primary">{message.text}</p>
                    )}
                </div>

                {!isModel && (
                    <div className="mt-1 flex items-center gap-1">
                        <button onClick={() => navigator.clipboard.writeText(message.text)} className="p-1 rounded-md text-text-muted hover:bg-surface-hover hover:text-primary" title="Copy"><IconClipboardCopy className="w-4 h-4" /></button>
                        <button className="p-1 rounded-md text-text-muted hover:bg-surface-hover hover:text-primary" title="Flag"><IconFlag className="w-4 h-4" /></button>
                        <button className="p-1 rounded-md text-text-muted hover:bg-surface-hover hover:text-primary" title="Edit"><IconEdit className="w-4 h-4" /></button>
                    </div>
                )}

                {isModel && (
                     <div className="mt-1 flex items-center gap-1">
                        <button onClick={() => setFeedback('up')} className={`p-1 rounded-md hover:bg-surface-hover ${feedback === 'up' ? 'text-primary' : 'text-text-muted'}`}><IconThumbUp className="w-4 h-4" /></button>
                        <button onClick={() => setFeedback('down')} className={`p-1 rounded-md hover:bg-surface-hover ${feedback === 'down' ? 'text-primary' : 'text-text-muted'}`}><IconThumbDown className="w-4 h-4" /></button>
                        <button onClick={() => navigator.clipboard.writeText(message.text)} className="p-1 rounded-md text-text-muted hover:bg-surface-hover hover:text-primary"><IconClipboardCopy className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- INITIAL PROMPTS VIEW ---
const initialPrompts = [
    { title: 'Summarize top 5 most expensive queries', category: 'Cost Analysis' },
    { title: 'Suggest ways to reduce storage costs', category: 'Cost Optimization' },
    { title: 'Why is my COMPUTE_WH cost so high?', category: 'Troubleshooting' },
    { title: 'Find inefficient join patterns in recent queries', category: 'Performance' },
    { title: 'Show me a chart of warehouse costs', category: 'Visualization' }
];

const InitialPrompts: React.FC<{ onPromptClick: (prompt: string) => void }> = ({ onPromptClick }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <IconAIAgent className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-text-strong">How can I help you today?</h2>
        <div className="max-w-3xl mx-auto mt-8 grid grid-cols-2 gap-4">
            {initialPrompts.map(p => (
                <button key={p.title} onClick={() => onPromptClick(p.title)} className="p-4 bg-surface rounded-lg text-left hover:bg-surface-hover border border-border-color">
                    <p className="font-semibold text-text-primary">{p.title}</p>
                    <p className="text-sm text-text-secondary">{p.category}</p>
                </button>
            ))}
        </div>
    </div>
);


// --- MAIN COMPONENT ---
const AIAgent: React.FC = () => {
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initialize with a single new chat on mount
    useEffect(() => {
        handleNewChat();
    }, []);

    // Scroll to bottom effect
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chats, isLoading, activeChatId]);
    
    // Auto-resize textarea effect
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleNewChat = () => {
        const newChat: ChatSession = {
            id: `chat-${Date.now()}`,
            title: 'New Chat',
            messages: [{ 
                role: 'model', 
                text: 'Hello! I am Anavsan AI. How can I help you analyze your data cloud today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})
            }],
        };
        setChats(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
    };
    
    const submitPrompt = (prompt: string) => {
        setInput(prompt);
        // We need to wait for the state to update, so we use a small timeout before submitting the form
        setTimeout(() => {
            textareaRef.current?.form?.requestSubmit();
        }, 0);
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const messageText = input.trim();
        if (!messageText || isLoading || !activeChatId) return;

        const activeChat = chats.find(c => c.id === activeChatId);
        if(!activeChat) return;

        const userMessage: Message = { 
            role: 'user', 
            text: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})
        };
        
        // Update chat title if it's a new chat
        const isNewChat = activeChat.messages.length <= 1;
        const newTitle = isNewChat ? (messageText.length > 30 ? `${messageText.substring(0, 27)}...` : messageText) : activeChat.title;

        setChats(prev => prev.map(c => c.id === activeChatId ? {...c, title: newTitle, messages: [...c.messages, userMessage]} : c));
        setInput('');
        setIsLoading(true);
        setError(null);
        
        try {
            // ALWAYS initialize GoogleGenAI with named apiKey parameter from process.env.API_KEY
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Prepare history, excluding the initial welcome message
            const history = activeChat.messages.slice(1).map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            } as Content));

            const chatInstance = ai.chats.create({ 
                // Updated to gemini-3-flash-preview as per task type recommendations
                model: 'gemini-3-flash-preview', 
                history,
                config: {
                    systemInstruction: "You are Anavsan AI, an expert assistant for data cloud analysis. When providing multi-part answers, such as analyzing multiple queries, separate each distinct analysis with '---' on its own line."
                }
            });
            
            // Fixed sendMessage parameter to accept a plain message string as per guidelines
            const response = await chatInstance.sendMessage({ message: messageText });
            let responseText = response.text;

            // Mock chart response for demo
            if(messageText.toLowerCase().includes('chart of warehouse costs')) {
                responseText += '\n\n```chart\n{"type":"bar","data":[{"name":"Compute","value":850},{"name":"Transform","value":250},{"name":"BI","value":125},{"name":"Finance","value":1200}]}\n```';
            }
            
            setChats(prev => prev.map(c => c.id === activeChatId ? {...c, messages: [...c.messages, {
                role: 'model',
                text: responseText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})
            }]} : c));

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            const errorText = `Sorry, I encountered an error: ${errorMessage}`;
             setChats(prev => prev.map(c => c.id === activeChatId ? {...c, messages: [...c.messages, {
                role: 'model',
                text: errorText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})
            }]} : c));
            setError('There was an issue communicating with the AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const activeChat = chats.find(c => c.id === activeChatId);

    return (
        <div className="flex h-full bg-background text-text-primary">
            <ChatHistorySidebar chats={chats} activeChatId={activeChatId} onSelectChat={setActiveChatId} onNewChat={handleNewChat} />

            <main className="flex-1 flex flex-col bg-surface">
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-border-color">
                    <div className="flex items-center gap-2">
                         <h2 className="text-lg font-semibold">Anavsan AI</h2>
                        <IconChevronDown className="w-5 h-5 text-text-muted" />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover"><IconShare className="w-5 h-5"/></button>
                        <button className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover"><IconDotsVertical className="w-5 h-5"/></button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {activeChat && activeChat.messages.length > 1 ? (
                        <div className="max-w-3xl mx-auto space-y-8">
                            {activeChat.messages.map((msg, index) => (
                                <ChatMessage key={index} message={msg} onPromptClick={submitPrompt} />
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><AnavsanLogo className="w-4 h-4" /></div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs text-text-muted">
                                            <span className="font-semibold text-text-strong">Anavsan AI</span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <span className="h-2 w-2 bg-text-muted rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                                            <span className="h-2 w-2 bg-text-muted rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
                                            <span className="h-2 w-2 bg-text-muted rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <InitialPrompts onPromptClick={submitPrompt} />
                    )}
                </div>

                <div className="p-4 flex-shrink-0 bg-gradient-to-t from-surface to-surface/0">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSendMessage} className="relative bg-surface p-2 rounded-2xl border border-border-color shadow-sm">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                placeholder="Ask anything..."
                                className="w-full bg-transparent border-none rounded-2xl py-2 pl-4 pr-12 text-sm focus:ring-0 resize-none max-h-48 overflow-y-auto"
                                disabled={isLoading}
                                rows={1}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white disabled:bg-surface-hover disabled:text-text-muted disabled:cursor-not-allowed"
                                aria-label="Send message"
                            >
                                <IconArrowUp className="w-5 h-5" />
                            </button>
                        </form>
                         <p className="text-xs text-center text-text-muted mt-2">Anavsan AI can make mistakes. Consider checking important information.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AIAgent;
