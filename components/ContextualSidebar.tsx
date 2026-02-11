
import React, { useRef, useState, useEffect } from 'react';
import { Account } from '../types';
import { accountNavItems } from '../constants';
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconCheck, IconSearch, IconArrowUp } from '../constants';

const ChevronUpIcon = ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 10L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ChevronDownIcon = ({ className }: { className?: string }) => <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const AccountAvatar: React.FC<{ name: string }> = ({ name }) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return (
        <div className="h-8 w-8 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
            {initials}
        </div>
    );
};

const ContextualNavItem: React.FC<{
    item: typeof accountNavItems[0];
    isSidebarExpanded: boolean;
    activePage: string;
    onPageChange: (page: string) => void;
    openSubMenus: Record<string, boolean>;
    handleSubMenuToggle: (itemName: string) => void;
    selectedApplicationId?: string | null;
    isDeepDrillDown?: boolean;
}> = ({ item, isSidebarExpanded, activePage, onPageChange, openSubMenus, handleSubMenuToggle, selectedApplicationId, isDeepDrillDown }) => {
    const [openFlyout, setOpenFlyout] = useState(false);
    const flyoutTimeoutIdRef = useRef<number | null>(null);

    const handleFlyoutEnter = () => {
        if (flyoutTimeoutIdRef.current) clearTimeout(flyoutTimeoutIdRef.current);
        setOpenFlyout(true);
    };

    const handleFlyoutLeave = () => {
        flyoutTimeoutIdRef.current = window.setTimeout(() => setOpenFlyout(false), 200);
    };

    const hasChildren = item.children.length > 0;
    const isSubMenuOpen = openSubMenus[item.name];
    const isSomeChildActive = !isDeepDrillDown && hasChildren && item.children.some(c => c.name === activePage);

    const isItemActuallyActive = !isDeepDrillDown && (activePage === item.name) && !(item.name === 'Applications' && selectedApplicationId);

    if (isSidebarExpanded) {
        if (!hasChildren) {
            return (
                <li>
                    <button
                        onClick={() => onPageChange(item.name)}
                        className={`w-full flex items-center gap-3 text-left p-2 rounded-lg text-sm transition-colors ${
                            isItemActuallyActive
                            ? 'bg-primary/5 text-primary font-bold'
                            : 'text-text-strong font-medium hover:bg-surface-hover'
                        }`}
                    >
                        <item.icon className={`h-5 w-5 shrink-0 ${isItemActuallyActive ? 'text-primary' : 'text-text-strong'}`} />
                        <span>{item.name}</span>
                    </button>
                </li>
            );
        }

        return (
            <li>
                <button
                    onClick={() => handleSubMenuToggle(item.name)}
                    className={`w-full flex items-center justify-between text-left p-2 rounded-lg hover:bg-surface-hover`}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 shrink-0 ${isSomeChildActive ? 'text-primary' : 'text-text-strong'}`} />
                        <span className={`text-sm font-bold text-text-strong`}>{item.name}</span>
                    </div>
                    {isSubMenuOpen ? <ChevronUpIcon className="h-4 w-4 text-text-secondary" /> : <ChevronDownIcon className="h-4 w-4 text-text-secondary" />}
                </button>
                {isSubMenuOpen && (
                    <ul className="pl-5 mt-1 space-y-0.5 border-l border-border-light ml-4">
                        {item.children.map(child => (
                            <li key={child.name}>
                                <button
                                    onClick={() => onPageChange(child.name)}
                                    className={`w-full text-left flex items-center gap-3 py-1.5 px-3 rounded-lg text-sm transition-colors ${
                                        !isDeepDrillDown && activePage === child.name 
                                        ? 'text-primary font-bold bg-primary/5' 
                                        : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    <child.icon className="h-4 w-4 shrink-0" />
                                    <span>{child.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        );
    } else {
        const isActive = isItemActuallyActive || isSomeChildActive;
        return (
            <li
                onMouseEnter={handleFlyoutEnter}
                onMouseLeave={handleFlyoutLeave}
                className="relative"
            >
                <button
                    onClick={() => onPageChange(hasChildren ? item.children[0].name : item.name)}
                    className={`w-full group relative flex items-center justify-center p-2 rounded-lg text-sm transition-colors ${
                        isActive
                        ? 'bg-primary/5 text-primary'
                        : 'text-text-strong hover:bg-surface-hover'
                    }`}
                >
                    <item.icon className="h-5 w-5 shrink-0" />
                </button>

                {openFlyout && (
                     <div 
                        className="absolute left-full ml-2 top-0 w-60 bg-surface rounded-lg shadow-lg p-2 z-30 border border-border-color"
                        onMouseEnter={handleFlyoutEnter}
                        onMouseLeave={handleFlyoutLeave}
                    >
                        <div className="px-3 py-2 text-sm font-semibold text-text-strong">{item.name}</div>
                        {hasChildren ? (
                             <ul className="space-y-0.5">
                                {item.children.map(child => (
                                    <li key={child.name}>
                                        <button
                                            onClick={() => onPageChange(child.name)}
                                            className={`w-full text-left py-1.5 px-3 rounded-md text-sm transition-colors ${
                                                !isDeepDrillDown && activePage === child.name 
                                                ? 'text-primary font-medium' 
                                                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                                            }`}
                                        >
                                            <span>{child.name}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                )}
            </li>
        );
    }
};

interface ContextualSidebarProps {
    account: Account;
    accounts: Account[];
    onSwitchAccount: (account: Account) => void;
    activePage: string;
    onPageChange: (page: string) => void;
    onBackToAccounts: () => void;
    backLabel?: string;
    selectedApplicationId?: string | null;
    isDeepDrillDown?: boolean;
}

const ContextualSidebar: React.FC<ContextualSidebarProps> = ({ account, accounts, onSwitchAccount, activePage, onPageChange, onBackToAccounts, backLabel = 'Back to accounts', selectedApplicationId, isDeepDrillDown }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
    const accountSwitcherRef = useRef<HTMLDivElement>(null);
    const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (accountSwitcherRef.current && !accountSwitcherRef.current.contains(event.target as Node)) {
                setIsAccountSwitcherOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Find the parent menu that contains the current active page
        const parentToOpen = accountNavItems.find(item => 
            item.children.some(child => child.name === activePage)
        )?.name;
        
        if (parentToOpen) {
            setOpenSubMenus(prev => ({ ...prev, [parentToOpen]: true }));
        }
    }, [account.id, activePage]);

    const handleSubMenuToggle = (itemName: string) => {
        setOpenSubMenus(prev => {
            const isCurrentlyOpen = !!prev[itemName];
            
            if (isCurrentlyOpen) {
                localStorage.removeItem('anavsan_last_open_submenu');
                return { ...prev, [itemName]: false };
            } else {
                localStorage.setItem('anavsan_last_open_submenu', itemName);
                return { ...prev, [itemName]: true };
            }
        });
    };

    return (
        <aside className={`bg-surface flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out border-r border-border-light h-full ${isSidebarExpanded ? 'w-64' : 'w-16'}`}>
            <div className="flex-shrink-0 h-[42px] flex items-center border-b border-border-light overflow-hidden">
                <button
                    onClick={onBackToAccounts}
                    className={`h-full w-full flex items-center gap-2 px-4 text-text-muted hover:text-primary transition-colors font-bold text-[10px] uppercase tracking-widest ${isSidebarExpanded ? '' : 'justify-center'}`}
                >
                    <IconChevronLeft className="h-3.5 w-3.5" />
                    {isSidebarExpanded && <span className="truncate">{backLabel}</span>}
                </button>
            </div>
            
            <div className={`p-4 flex-shrink-0 transition-all ${isSidebarExpanded ? '' : 'flex justify-center'}`}>
                <div 
                    ref={accountSwitcherRef}
                    className="relative w-full"
                >
                    <button
                        onClick={() => setIsAccountSwitcherOpen(prev => !prev)}
                        className={`w-full flex items-center transition-colors group relative ${
                            isSidebarExpanded 
                            ? 'text-left p-1.5 rounded-lg bg-background hover:bg-surface-hover border border-border-light justify-between shadow-sm' 
                            : 'h-10 w-10 rounded-full bg-surface-nested hover:bg-surface-hover justify-center border border-border-light shadow-sm'
                        }`}
                        aria-haspopup="true"
                        aria-expanded={isAccountSwitcherOpen}
                        title={isSidebarExpanded ? "Switch Account" : account.name}
                    >
                        {isSidebarExpanded ? (
                            <>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <AccountAvatar name={account.name} />
                                    <span className="text-xs font-bold text-text-strong truncate">{account.name}</span>
                                </div>
                                <IconChevronDown className={`h-4 w-4 text-text-muted transition-transform ${isAccountSwitcherOpen ? 'rotate-180' : ''}`} />
                            </>
                        ) : (
                            <AccountAvatar name={account.name} />
                        )}
                    </button>
                    {isAccountSwitcherOpen && (
                        <div className={`absolute z-30 mt-2 rounded-xl bg-surface shadow-2xl p-2 border border-border-color ${isSidebarExpanded ? 'w-full' : 'w-64 left-full ml-2 -top-2'}`}>
                            <ul className="max-h-60 overflow-y-auto no-scrollbar">
                                {accounts.map(acc => {
                                    const isActive = acc.id === account.id;
                                    return (
                                        <li key={acc.id}>
                                            <button
                                                onClick={() => { onSwitchAccount(acc); setIsAccountSwitcherOpen(false); }}
                                                className={`w-full text-left flex items-center justify-between gap-2 p-2.5 rounded-lg text-xs font-bold transition-colors ${
                                                    isActive
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <AccountAvatar name={acc.name} />
                                                    <span className="truncate">{acc.name}</span>
                                                </div>
                                                {isActive && <IconCheck className="h-4 w-4 text-primary flex-shrink-0" />}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <nav className={`flex-grow px-3 space-y-1 ${isSidebarExpanded ? 'overflow-y-auto' : ''} no-scrollbar`}>
                <ul className="space-y-1">
                    {accountNavItems.map(item => (
                        <ContextualNavItem
                            key={item.name}
                            item={item}
                            isSidebarExpanded={isSidebarExpanded}
                            activePage={activePage}
                            onPageChange={onPageChange}
                            openSubMenus={openSubMenus}
                            handleSubMenuToggle={handleSubMenuToggle}
                            selectedApplicationId={selectedApplicationId}
                            isDeepDrillDown={isDeepDrillDown}
                        />
                     ))}
                </ul>
            </nav>

            <div className="p-3 mt-auto flex-shrink-0 border-t border-border-light">
                <div className={`flex ${isSidebarExpanded ? 'justify-end' : 'justify-center'}`}>
                    <button
                        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                        className="p-2 rounded-full text-text-muted hover:bg-surface-hover hover:text-primary transition-all focus:outline-none"
                        aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {isSidebarExpanded 
                            ? <IconChevronLeft className="h-5 w-5" /> 
                            : <IconChevronRight className="h-5 w-5" />
                        }
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default ContextualSidebar;
