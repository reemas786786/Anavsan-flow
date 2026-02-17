import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Connections from './pages/Connections';
import Overview from './pages/Overview';
import AccountView from './pages/AccountView';
import UserView from './pages/UserView';
import SidePanel from './components/SidePanel';
import AddAccountFlow from './components/AddAccountFlow';
import SaveQueryFlow from './components/SaveQueryFlow';
import InviteUserFlow from './components/InviteUserFlow';
import EditUserRoleFlow from './components/EditUserRoleFlow';
import ConfirmationModal from './components/ConfirmationModal';
import Modal from './components/Modal';
import Toast from './components/Toast';
import BigScreenView from './components/BigScreenView';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RequestSubmittedPage from './pages/RequestSubmittedPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CheckEmailPage from './pages/CheckEmailPage';
import CreateNewPasswordPage from './pages/CreateNewPasswordPage';
import PasswordResetSuccessPage from './pages/PasswordResetSuccessPage';
import { Page, Account, SQLFile, UserRole, User, UserStatus, DashboardItem, BigScreenWidget, QueryListItem, AssignedQuery, AssignmentPriority, AssignmentStatus, PullRequest, Notification, ActivityLog, BreadcrumbItem, Warehouse, SQLVersion, QueryListFilters, CollaborationEntry, Subscription, SubscriptionPlan, BillingCycle, Recommendation } from './types';
import { sqlFilesData as initialSqlFiles, usersData, dashboardsData as initialDashboardsData, assignedQueriesData as initialAssignedQueries, pullRequestsData, notificationsData as initialNotificationsData, activityLogsData, warehousesData, queryListData, connectionsData, accountApplicationsData, demoUsers } from './data/dummyData';
import { accountNavItems, IconInfo, IconUser, IconLightbulb, IconChevronRight } from './constants';
import SettingsPage from './pages/SettingsPage';
import Dashboards from './pages/Dashboards';
import DashboardEditor from './pages/DashboardEditor';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import Breadcrumb from './components/Breadcrumb';
import AssignQueryFlow from './components/AssignQueryFlow';
import AssignedTasks from './pages/AssignedTasks';
import AssignedQueryDetailView from './pages/AssignedQueryDetailView';
import QueryPreviewContent from './components/QueryPreviewModal';
import NotificationsPage from './pages/NotificationsPage';
import AIQuickAskPanel from './components/AIQuickAskPanel';
import AIAgent from './pages/AIAgent';
import { QueryLibrary } from './pages/QueryLibrary';
import QueryLibraryDetailView from './pages/QueryLibraryDetailView';
import AssignedQueryModalContent from './components/AssignedQueryModalContent';
import IntegrationsPage from './pages/settings/IntegrationsPage';
import Recommendations from './pages/Recommendations';
import BillingHistory from './pages/billing/BillingHistory';
import TeamConsumption from './pages/billing/TeamConsumption';
import ConfigureWorkspaceModal from './components/WelcomeModal';
import ChangePlan from './pages/billing/ChangePlan';
import SendQueryFlow from './components/SendQueryFlow';
import ExtendedTrialSideFlow from './components/ExtendedTrialSideFlow';
import AddSeatsModal from './components/AddSeatsModal';
import SwitchToIndividualModal from './components/SwitchToIndividualModal';
import ConfirmSubscriptionChangeModal from './components/ConfirmSubscriptionChangeModal';
import ConfirmCycleDowngradeModal from './components/ConfirmCycleDowngradeModal';
import ResourceSummary from './pages/CreditExplorer'; 
import Reports from './pages/Reports';

type SidePanelType = 'addAccount' | 'saveQuery' | 'editUser' | 'assignQuery' | 'queryPreview' | 'assignedQueryPreview' | 'updateAssignmentStatus' | 'sendQuery' | 'extendedTrial';
type ModalType = 'addUser' | 'orgSetup' | 'addSeats' | 'switchToIndividual' | 'confirmSubscriptionChange' | 'confirmCycleDowngrade';
type Theme = 'light' | 'dark' | 'gray10' | 'black' | 'system';
export type DisplayMode = 'cost' | 'credits';

const SplashScreen: React.FC = () => (
    <div id="splash-loader" style={{ opacity: 1 }}>
        <div className="loader">
            <div className="logo-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="52" viewBox="0 0 48 52" fill="none">
                    <path d="M26.0245 1.10411C26.5035 0.944589 27.0263 0.947640 27.4289 1.26015C27.8353 1.57579 27.8353 1.57579 27.4289 1.26015C26.0245 1.10411ZM23.0063 10.1675C18.5457 17.0145 14.8187 24.1166 11.563 31.4691C13.3624 30.4149 15.3197 29.6376 17.3675 29.1699L18.3344 28.9598C20.4134 28.5266 22.5251 28.2002 24.6202 27.8323C23.4817 22.1099 22.7559 16.2408 23.0063 10.1675Z" fill="url(#paint0_linear_splash)" stroke="url(#paint1_linear_splash)" strokeWidth="0.75"/>
                    <defs>
                        <linearGradient id="paint0_linear_splash" x1="23.9999" y1="1.54252" x2="23.9999" y2="50.4578" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#6932D5"/>
                            <stop offset="1" stop-color="#7163C6"/>
                        </linearGradient>
                        <linearGradient id="paint1_linear_splash" x1="24" y1="1" x2="24" y2="51" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#6932D5"/>
                            <stop offset="1" stop-color="#7163C6"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    </div>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup' | 'request-submitted' | 'forgot-password' | 'check-email' | 'create-password' | 'reset-success'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  
  const [activePage, setActivePage] = useState<Page>('AI data cloud overview');
  const [activeSubPage, setActiveSubPage] = useState<string | undefined>();
  const [resourceSummaryTab, setResourceSummaryTab] = useState<string>('Accounts');
  const [recommendationFilters, setRecommendationFilters] = useState<any>(null);
  
  const [isSidebarOpen, setSidebarOpen] = useState(true); 
  const [sidebarPreference, setSidebarPreference] = useState(true); 
  const [isQuickAskOpen, setIsQuickAskOpen] = useState(false);

  const [subscription, setSubscription] = useState<Subscription>({
      plan: 'Trial',
      status: 'trialing',
      trialEndsAt: '2026-01-29',
      seats: 5
  });

  const [accounts, setAccounts] = useState<Account[]>(connectionsData);
  const [sqlFiles, setSqlFiles] = useState<SQLFile[]>(initialSqlFiles);
  const [users, setUsers] = useState<User[]>(usersData);
  const [dashboards, setDashboards] = useState<DashboardItem[]>(initialDashboardsData);
  const [assignedQueries, setAssignedQueries] = useState<AssignedQuery[]>(initialAssignedQueries);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>(pullRequestsData);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotificationsData);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(activityLogsData);

  const [sidePanel, setSidePanel] = useState<{ type: SidePanelType; data?: any } | null>(null);
  const [modal, setModal] = useState<{ type: ModalType; data?: any } | null>(null);
  const [confirmation, setConfirmation] = useState<{ title: string; message: React.ReactNode; onConfirm: () => void; confirmText?: string; confirmVariant?: 'danger' | 'warning' | 'primary' } | null>(null);
  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardItem | null>(null);
  const [editingDashboard, setEditingDashboard] = useState<DashboardItem | null>(null);
  const [isViewingDashboard, setIsViewingDashboard] = useState(false);

  const [selectedQuery, setSelectedQuery] = useState<QueryListItem | null>(null);
  const [selectedAssignedQuery, setSelectedAssignedQuery] = useState<AssignedQuery | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [analyzingQuery, setAnalyzingQuery] = useState<QueryListItem | null>(null);
  const [navigationSource, setNavigationSource] = useState<string | null>(null);
  const [backNavigationPage, setBackNavigationPage] = useState<Page>('Accounts');
  const [returnContext, setReturnContext] = useState<{ account: Account; page: string; warehouse?: Warehouse | null } | null>(null);
  
  const [selectedPullRequest, setSelectedPullRequest] = useState<PullRequest | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [theme, setTheme] = useState<Theme>('light');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('cost');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [bigScreenWidget, setBigScreenWidget] = useState<BigScreenWidget | null>(null);

  const [accountViewPage, setAccountViewPage] = useState('Account overview');
  
  const handleSetActivePage = (page: Page, subPage?: string, additionalState?: any) => {
    // Save context if we are moving from an account detail view to recommendations
    if (selectedAccount && page === 'Recommendations') {
        setReturnContext({ 
            account: selectedAccount, 
            page: accountViewPage,
            warehouse: selectedWarehouse 
        });
    } else if (page !== 'Recommendations') {
        // Clear return context if navigating elsewhere (except between subpages of recommendations if needed)
        setReturnContext(null);
    }

    setActivePage(page);
    setActiveSubPage(subPage);
    setSelectedAccount(null);
    setSelectedUser(null);
    setSidebarOpen(sidebarPreference);
    setIsViewingDashboard(false);
    setEditingDashboard(null);
    setSelectedDashboard(null);
    setSelectedQuery(null);
    setSelectedAssignedQuery(null);
    setSelectedRecommendation(null); 
    setSelectedPullRequest(null);
    setSelectedWarehouse(null);
    setSelectedApplicationId(null);

    if (page === 'Resource summary' && additionalState?.tab) {
        setResourceSummaryTab(additionalState.tab);
    }

    if (page === 'Recommendations') {
        setRecommendationFilters(additionalState?.filters || null);
    } else {
        setRecommendationFilters(null);
    }
  };

  const handleBackToSource = () => {
    if (returnContext) {
        setSelectedAccount(returnContext.account);
        setAccountViewPage(returnContext.page);
        setSelectedWarehouse(returnContext.warehouse || null);
        setActivePage('Accounts');
        setReturnContext(null);
    } else {
        handleSetActivePage('AI data cloud overview');
    }
  };

  const breadcrumbItems = useMemo(() => {
    const homeItem: BreadcrumbItem = { 
        label: 'Home', 
        onClick: () => handleSetActivePage('AI data cloud overview') 
    };

    if (activePage === 'AI data cloud overview') return [homeItem];

    const items = [homeItem];

    if (selectedAccount) {
        items.push({ 
            label: 'Accounts', 
            onClick: () => { setSelectedAccount(null); handleSetActivePage('Accounts'); } 
        });
        items.push({ 
            label: selectedAccount.name,
            onClick: () => {
                setAccountViewPage('Account overview');
                setSelectedWarehouse(null);
            }
        });

        if (selectedWarehouse) {
            items.push({ 
                label: 'Warehouses', 
                onClick: () => {
                    setAccountViewPage('Warehouses');
                    setSelectedWarehouse(null);
                } 
            });
            items.push({ 
                label: selectedWarehouse.name 
            });
            return items;
        }

        if (accountViewPage === 'Applications') {
            items.push({ 
                label: 'Applications', 
                onClick: () => setSelectedApplicationId(null) 
            });
            if (selectedApplicationId) {
                const app = accountApplicationsData.find(a => a.id === selectedApplicationId || a.name === selectedApplicationId);
                if (app) {
                    items.push({ label: app.name });
                }
            }
        } else if (accountViewPage !== 'Account overview') {
            items.push({ label: accountViewPage });
        }
        return items;
    }

    if (activePage === 'Workspace' || activePage === 'Assigned tasks') {
        items.push({ label: 'Workspace', onClick: () => handleSetActivePage('Workspace', 'Assigned tasks') });
        items.push({ label: 'Assigned tasks', onClick: () => { setSelectedAssignedQuery(null); handleSetActivePage('Workspace', 'Assigned tasks'); } });
        if (selectedAssignedQuery) {
            items.push({ label: `TASK-${selectedAssignedQuery.queryId.substring(0,8).toUpperCase()}` });
        }
        return items;
    }

    items.push({ 
        label: activePage,
        onClick: () => handleSetActivePage(activePage, activeSubPage)
    });

    if (activeSubPage) {
        items.push({ label: activeSubPage });
    }

    if (activePage === 'Recommendations' && selectedRecommendation) {
        items.push({ label: selectedRecommendation.id });
    }

    return items;
  }, [activePage, activeSubPage, selectedAccount, accountViewPage, selectedApplicationId, selectedRecommendation, selectedWarehouse, selectedAssignedQuery]);

  useEffect(() => {
    setTimeout(() => {
      const splash = document.getElementById('splash-loader');
      if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.style.display = 'none';
          setLoading(false);
        }, 300);
      } else {
        setLoading(false);
      }
    }, 500);

    const applyThemeClasses = (effectiveTheme: string) => {
        const root = document.documentElement;
        root.classList.remove('dark', 'theme-gray-10', 'theme-black');
        if (effectiveTheme === 'dark') root.classList.add('dark');
        else if (effectiveTheme === 'gray10') root.classList.add('theme-gray-10');
        else if (effectiveTheme === 'black') root.classList.add('theme-black');
    };

    if (theme === 'system') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const updateTheme = () => applyThemeClasses(mediaQuery.matches ? 'dark' : 'light');
        updateTheme(); 
        mediaQuery.addEventListener('change', updateTheme);
        return () => mediaQuery.removeEventListener('change', updateTheme);
    } else {
        applyThemeClasses(theme);
    }
}, [theme]);
  
  const handleLogout = () => { setIsAuthenticated(false); setAuthView('landing'); };

  const handleLogin = (email: string) => {
      const user = demoUsers[email] || demoUsers['finops@mail.com'];
      setCurrentUser(user);
      setIsAuthenticated(true);
      handleSetActivePage('AI data cloud overview');
  };

  const handleSubscriptionSuccess = (plan: SubscriptionPlan, cycle: BillingCycle) => {
      if (subscription.plan === 'Team' && plan === 'Individual') {
          setSubscription({ ...subscription, isDowngradePending: true, pendingPlan: 'Individual', pendingPlanEffectiveDate: 'Oct 24, 2025' });
      } else {
          setSubscription({ plan, status: 'active', billingCycle: cycle, nextBillingDate: '2026-02-28', seats: plan === 'Team' ? 5 : 1 });
      }
      handleSetActivePage('Billing', 'Your plan');
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({...n, isRead: true})));
  };

  const handleNavigateToWarehouse = (account: Account, warehouse: Warehouse) => {
      setBackNavigationPage(activePage);
      setSelectedAccount(account);
      setSelectedWarehouse(warehouse);
      setSidebarOpen(false); 
      setActivePage('Accounts');
  };

  const handleSelectAccount = (account: Account, initialPage?: string, sourceTab?: string) => {
      if (activePage === 'Resource summary' && sourceTab) {
          setResourceSummaryTab(sourceTab);
      }
      
      setBackNavigationPage(activePage);
      setSelectedAccount(account);
      setSidebarOpen(false); 
      if (initialPage) {
          setAccountViewPage(initialPage);
      } else {
          setAccountViewPage('Account overview');
      }
      setSelectedQuery(null);
      setSelectedPullRequest(null);
      setSelectedWarehouse(null);
      setSelectedApplicationId(null);
  };

  const handleSelectApplication = (appName: string) => {
      setBackNavigationPage(activePage);
      const account = accounts[0];
      setSelectedAccount(account);
      setAccountViewPage('Applications');
      setSelectedApplicationId(appName);
      setSidebarOpen(false);
  };

  const handleAssignQueryTask = (rec: Recommendation) => {
    let assignmentData: any = null;

    if (rec.resourceType === 'Query') {
        assignmentData = queryListData.find(q => q.id === rec.affectedResource);
    } 
    
    if (!assignmentData) {
        assignmentData = {
            id: rec.affectedResource,
            queryText: `Context: ${rec.insightType}\n${rec.message}`,
            warehouse: 'SYSTEM',
            user: 'anavsan_ai',
            duration: '0s',
            costCredits: rec.metrics?.creditsBefore || 0,
            status: 'Success',
            severity: rec.severity === 'High' ? 'High' : 'Medium'
        };
    }

    setSidePanel({ type: 'assignQuery', data: assignmentData });
  };

  const handleOptimizeRecommendation = (rec: Recommendation) => {
    const account = accounts.find(a => a.name === rec.accountName) || accounts[0];
    setSelectedAccount(account);
    setAccountViewPage('Query optimizer');
    
    // Find matching query in dummy data or create a partial object
    const query = queryListData.find(q => q.id === rec.affectedResource);
    if (query) {
        setAnalyzingQuery(query);
    } else {
        // Fallback for demo: load a mock object with the recommendation's SQL
        setAnalyzingQuery({
            id: rec.affectedResource,
            queryText: rec.metrics?.queryText || 'SELECT * FROM TABLE_STUB',
            warehouse: rec.warehouseName || 'SYSTEM',
            costCredits: rec.metrics?.creditsBefore || 0,
            user: rec.userName || 'System'
        } as any);
    }
    setSidebarOpen(false);
  };

  const handleUpdateAssignmentStatus = (id: string, status: AssignmentStatus, comment?: string) => {
      setAssignedQueries(prev => prev.map(aq => {
          if (aq.id === id) {
              const historyEntry: CollaborationEntry = {
                  id: `coll-${Date.now()}`,
                  type: 'system',
                  author: currentUser?.name || 'System',
                  timestamp: new Date().toISOString(),
                  content: `Status updated to ${status.toUpperCase()}`,
                  metadata: { oldStatus: aq.status, newStatus: status }
              };
              
              const updated = { ...aq, status, history: [...aq.history, historyEntry] };
              if (comment) {
                  updated.history.push({
                      id: `comm-${Date.now()}`,
                      type: 'comment',
                      author: currentUser?.name || 'System',
                      timestamp: new Date().toISOString(),
                      content: comment
                  });
              }
              return updated;
          }
          return aq;
      }));

      // Update selected reference
      if (selectedAssignedQuery?.id === id) {
          setSelectedAssignedQuery(prev => prev ? {...prev, status} : null);
      }

      // Notify relevant persona
      if (status === 'Optimized' || status === 'Needs clarification') {
           const targetAssignment = assignedQueries.find(a => a.id === id);
           if (targetAssignment) {
               const newNotification: Notification = {
                    id: `n-up-${Date.now()}`,
                    insightTypeId: 'ASSIGNMENT_UPDATED',
                    insightTopic: 'ASSIGNMENT_UPDATED',
                    message: `Optimization Task ${targetAssignment.queryId.substring(0,8)} is now ${status.toUpperCase()}.`,
                    suggestions: 'Please review the latest update in Assigned Tasks.',
                    timestamp: new Date().toISOString(),
                    warehouseName: targetAssignment.warehouse,
                    isRead: false,
                    severity: 'Info'
               };
               setNotifications(prev => [newNotification, ...prev]);
           }
      }
  };

  const handleUpdateAssignmentPriority = (id: string, priority: AssignmentPriority) => {
      setAssignedQueries(prev => prev.map(aq => {
          if (aq.id === id) {
              const historyEntry: CollaborationEntry = {
                  id: `coll-prio-${Date.now()}`,
                  type: 'system',
                  author: currentUser?.name || 'System',
                  timestamp: new Date().toISOString(),
                  content: `Priority updated to ${priority.toUpperCase()}`,
              };
              return { ...aq, priority, history: [...aq.history, historyEntry] };
          }
          return aq;
      }));
      
      if (selectedAssignedQuery?.id === id) {
          setSelectedAssignedQuery(prev => prev ? {...prev, priority} : null);
      }
  };

  const handleAddAssignmentComment = (id: string, comment: string) => {
      setAssignedQueries(prev => prev.map(aq => {
          if (aq.id === id) {
              const newEntry: CollaborationEntry = {
                  id: `comm-${Date.now()}`,
                  type: 'comment',
                  author: currentUser?.name || 'System',
                  timestamp: new Date().toISOString(),
                  content: comment
              };
              const updated = { ...aq, history: [...aq.history, newEntry] };
              
              // If we're updating the currently selected query view, update it too
              if (selectedAssignedQuery?.id === id) {
                  setSelectedAssignedQuery(updated);
              }
              
              return updated;
          }
          return aq;
      }));
  };

  const renderPage = () => {
    if (editingDashboard) {
        return <DashboardEditor 
            dashboard={editingDashboard} 
            accounts={accounts} 
            onSave={(d) => { setDashboards(prev => [...prev.filter(x => x.id !== d.id), d]); setEditingDashboard(null); }} 
            onCancel={() => setEditingDashboard(null)} 
        />;
    }

    if (selectedAccount) {
      const activeAssignment = assignedQueries.find(aq => aq.queryId === selectedQuery?.id);
      return <AccountView 
        account={selectedAccount} 
        accounts={accounts} 
        onSwitchAccount={setSelectedAccount} 
        onBackToAccounts={() => handleSetActivePage(backNavigationPage, undefined, { tab: resourceSummaryTab })}
        backLabel={`Back to ${backNavigationPage}`}
        sqlFiles={sqlFiles} 
        onSaveQueryClick={() => setSidePanel({type: 'saveQuery'})} 
        onSetBigScreenWidget={setBigScreenWidget} 
        activePage={accountViewPage} 
        onPageChange={setAccountViewPage} 
        onShareQueryClick={(query) => setSidePanel({type: 'assignQuery', data: query})} 
        onPreviewQuery={(query) => setSidePanel({type: 'queryPreview', data: query})} 
        selectedQuery={selectedQuery} 
        setSelectedQuery={setSelectedQuery} 
        analyzingQuery={analyzingQuery} 
        onAnalyzeQuery={(q, s) => { setAnalyzingQuery(q); setNavigationSource(s); setAccountViewPage('Query analyzer'); }} 
        onOptimizeQuery={(q, s) => { setAnalyzingQuery(q); setNavigationSource(s); setAccountViewPage('Query analyzer'); }} 
        onSimulateQuery={(q, s) => { setAnalyzingQuery(q); setNavigationSource(s); setAccountViewPage('Query analyzer'); }} 
        pullRequests={pullRequests} 
        selectedPullRequest={selectedPullRequest} 
        setSelectedPullRequest={setSelectedPullRequest} 
        users={users} 
        navigationSource={navigationSource} 
        selectedWarehouse={selectedWarehouse}
        setSelectedWarehouse={setSelectedWarehouse}
        warehouses={warehousesData}
        currentUser={currentUser}
        assignment={activeAssignment}
        onUpdateAssignmentStatus={handleUpdateAssignmentStatus}
        onAssignToEngineer={(query) => setSidePanel({type: 'assignQuery', data: query})}
        onResolveAssignment={(id) => { setAssignedQueries(prev => prev.filter(q => q.id !== id)); }}
        selectedApplicationId={selectedApplicationId}
        setSelectedApplicationId={setSelectedApplicationId}
        breadcrumbItems={breadcrumbItems}
        onNavigateToRecommendations={(filters) => handleSetActivePage('Recommendations', undefined, { filters })}
      />;
    }
    
    switch (activePage) {
        case 'AI data cloud overview': return <Overview onSelectAccount={handleSelectAccount} onSelectUser={setSelectedUser} accounts={accounts} users={users} onSetBigScreenWidget={setBigScreenWidget} currentUser={currentUser} onNavigate={handleSetActivePage} onAddAccountClick={() => setSidePanel({ type: 'addAccount' })} />;
        case 'Resource summary': return <ResourceSummary initialTab={resourceSummaryTab} onSelectAccount={handleSelectAccount} onSelectApplication={handleSelectApplication} onNavigateToRecommendations={(filters) => handleSetActivePage('Recommendations', undefined, { filters })} />;
        case 'Accounts': return <Connections accounts={accounts} onSelectAccount={handleSelectAccount} onAddAccountClick={() => setSidePanel({ type: 'addAccount' })} onDeleteAccount={(id) => setAccounts(a => a.filter(x => x.id !== id))} />;
        case 'AI agent': return <AIAgent />;
        case 'Recommendations': return <Recommendations accounts={accounts} currentUser={currentUser} initialFilters={recommendationFilters} onNavigateToQuery={(q) => {setSelectedAccount(accounts[0]); setSelectedQuery(q as QueryListItem);}} onNavigateToWarehouse={(wh) => {setSelectedAccount(accounts[0]); setSelectedWarehouse(wh as Warehouse);}} onAssignTask={handleAssignQueryTask} onOptimizeRecommendation={handleOptimizeRecommendation} selectedRecommendation={selectedRecommendation} onSelectRecommendation={setSelectedRecommendation} onBackToSource={handleBackToSource} returnContext={returnContext} />;
        case 'Reports': return <Reports />;
        case 'Workspace':
            if (activeSubPage === 'Assigned tasks') {
                if (selectedAssignedQuery) {
                    return <AssignedQueryDetailView 
                        assignment={selectedAssignedQuery} 
                        onBack={() => setSelectedAssignedQuery(null)} 
                        currentUser={currentUser} 
                        onUpdateStatus={handleUpdateAssignmentStatus}
                        onUpdatePriority={handleUpdateAssignmentPriority}
                        onAddComment={handleAddAssignmentComment}
                        onResolve={(id) => { setAssignedQueries(p => p.filter(x => x.id !== id)); setSelectedAssignedQuery(null); }}
                        onReassign={() => { /* re-open assign panel */ }}
                    />;
                }
                return <AssignedTasks assignedQueries={assignedQueries} currentUser={currentUser} onViewQuery={(id) => {const aq = assignedQueries.find(q => q.queryId === id); if(aq) setSelectedAssignedQuery(aq);}} onResolveQuery={(id) => setAssignedQueries(p => p.filter(x => x.id !== id))} onUpdateStatus={handleUpdateAssignmentStatus} />;
            }
            if (activeSubPage === 'Query vault') return <QueryLibrary sqlFiles={sqlFiles} accounts={accounts} onFileSelect={() => {}} selectedFile={null} onVersionSelect={() => {}} onBack={() => {}} onCompare={() => {}} title="Query vault" />;
            return <Overview onSelectAccount={handleSelectAccount} onSelectUser={setSelectedUser} accounts={accounts} users={users} onSetBigScreenWidget={setBigScreenWidget} currentUser={currentUser} onNavigate={handleSetActivePage} onAddAccountClick={() => setSidePanel({ type: 'addAccount' })} />;
        case 'Assigned tasks':
            if (selectedAssignedQuery) {
                return <AssignedQueryDetailView 
                    assignment={selectedAssignedQuery} 
                    onBack={() => setSelectedAssignedQuery(null)} 
                    currentUser={currentUser} 
                    onUpdateStatus={handleUpdateAssignmentStatus}
                    onUpdatePriority={handleUpdateAssignmentPriority}
                    onAddComment={handleAddAssignmentComment}
                    onResolve={(id) => { setAssignedQueries(p => p.filter(x => x.id !== id)); setSelectedAssignedQuery(null); }}
                    onReassign={() => { /* re-open assign panel */ }}
                />;
            }
            return <AssignedTasks assignedQueries={assignedQueries} currentUser={currentUser} onViewQuery={(id) => {const aq = assignedQueries.find(q => q.queryId === id); if(aq) setSelectedAssignedQuery(aq);}} onResolveQuery={(id) => setAssignedQueries(p => p.filter(x => x.id !== id))} onUpdateStatus={handleUpdateAssignmentStatus} />;
        case 'Billing':
            if (activeSubPage === 'Team consumption') return <TeamConsumption users={users} subscription={subscription} onAddUser={() => setModal({ type: 'addUser' })} onEditUserRole={() => {}} onSuspendUser={() => {}} onActivateUser={() => {}} onRemoveUser={() => {}} onCancelDowngrade={() => {}} />;
            if (activeSubPage === 'Billing history') return <BillingHistory onNavigate={handleSetActivePage} onDownloadInvoice={() => {}} />;
            return <ChangePlan users={users} currentUser={currentUser} onSubscriptionSuccess={handleSubscriptionSuccess} currentPlan={subscription.plan} subscription={subscription} />;
        case 'Activity logs':
        case 'Notifications': 
            return <NotificationsPage 
                notifications={notifications} 
                assignedQueries={assignedQueries} 
                onMarkAllAsRead={handleMarkAllNotificationsAsRead} 
                accounts={accounts} 
                onNavigateToWarehouse={handleNavigateToWarehouse} 
                onNavigateToQuery={(acc, q) => { setSelectedAccount(acc); setSelectedQuery(q); }}
                onMarkNotificationAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n))} 
                onOpenAssignedQueryPreview={(aq) => setSelectedAssignedQuery(aq)} 
                onNavigateToAssignedTasks={() => handleSetActivePage('Assigned tasks')}
            />;
        case 'Integrations': return <IntegrationsPage onDisconnect={(onConfirm) => onConfirm()} />;
        case 'Dashboards': return <Dashboards 
            dashboards={dashboards} 
            onDeleteDashboardClick={(d) => setDashboards(p => p.filter(x => x.id !== d.id))} 
            onAddDashboardClick={() => setEditingDashboard({
                id: `dash-${Date.now()}`,
                title: 'Untitled Dashboard',
                createdOn: new Date().toLocaleDateString(),
                widgets: [],
                dataSourceContext: { type: 'overall' }
            })} 
            onEditDashboardClick={setEditingDashboard} 
            onViewDashboardClick={setSelectedDashboard} 
        />;
        case 'Profile settings': return <ProfileSettingsPage user={currentUser!} initialSection={activeSubPage} onBack={() => handleSetActivePage('AI data cloud overview')} theme={theme} onThemeChange={(newTheme) => setTheme(newTheme as Theme)} />;
        default: return <Overview onSelectAccount={handleSelectAccount} onSelectUser={setSelectedUser} accounts={accounts} users={users} onSetBigScreenWidget={setBigScreenWidget} currentUser={currentUser} onNavigate={handleSetActivePage} onAddAccountClick={() => setSidePanel({ type: 'addAccount' })} />;
    }
  };

  if (!isAuthenticated) {
    switch (authView) {
        case 'login': return <LoginPage onLogin={handleLogin} onSSOLogin={() => handleLogin('finops@mail.com')} onShowSignup={() => setAuthView('signup')} onShowForgotPassword={() => setAuthView('forgot-password')} />;
        case 'signup': return <SignupPage onSignup={() => setAuthView('request-submitted')} onShowLogin={() => setAuthView('login')} />;
        case 'request-submitted': return <RequestSubmittedPage onBackToHomepage={() => setAuthView('login')} />;
        case 'forgot-password': return <ForgotPasswordPage onContinue={() => setAuthView('check-email')} onBackToLogin={() => setAuthView('login')} />;
        case 'check-email': return <CheckEmailPage onContinue={() => setAuthView('create-password')} />;
        case 'create-password': return <CreateNewPasswordPage onContinue={() => setAuthView('reset-success')} />;
        case 'reset-success': return <PasswordResetSuccessPage onGoToSignIn={() => setAuthView('login')} />;
        case 'landing': 
        default: return <LoginPage onLogin={handleLogin} onSSOLogin={() => handleLogin('finops@mail.com')} onShowSignup={() => setAuthView('signup')} onShowForgotPassword={() => setAuthView('forgot-password')} />;
    }
  }

  return (
    <div className={`flex h-full flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      {loading && <SplashScreen />}
      <Header 
        onMenuClick={() => {
            const newState = !isSidebarOpen;
            setSidebarOpen(newState);
            if (!selectedAccount) {
                setSidebarPreference(newState);
            }
        }}
        onLogoClick={() => handleSetActivePage('AI data cloud overview')}
        isSidebarOpen={isSidebarOpen}
        brandLogo={null}
        onOpenProfileSettings={() => handleSetActivePage('Profile settings')}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onClearAllNotifications={() => setNotifications([])}
        onNavigate={handleSetActivePage}
        onOpenQuickAsk={() => setIsQuickAskOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {!selectedAccount && !editingDashboard && (
          <Sidebar 
            activePage={selectedRecommendation ? (null as any) : activePage} 
            setActivePage={handleSetActivePage} 
            isOpen={isSidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            activeSubPage={activeSubPage} 
            userRole={currentUser?.role}
          />
        )}
        
        {selectedAccount && !editingDashboard && (
          <Sidebar 
            activePage={activePage} 
            setActivePage={handleSetActivePage} 
            isOpen={isSidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            activeSubPage={activeSubPage} 
            isOverlayMode={true} 
            userRole={currentUser?.role}
          />
        )}

        {!selectedAccount && !editingDashboard ? (
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <div className="bg-surface shadow-sm flex-shrink-0 z-10 border-b border-border-light">
                    <div className="h-[42px] px-4 flex items-center">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                </div>
                <div className="flex-1 overflow-auto bg-background">
                    {renderPage()}
                </div>
            </main>
        ) : (
            <div className="flex-1 overflow-hidden relative">
                {renderPage()}
            </div>
        )}
      </div>
      <AIQuickAskPanel isOpen={isQuickAskOpen} onClose={() => setIsQuickAskOpen(false)} onOpenAgent={() => { setIsQuickAskOpen(false); handleSetActivePage('AI agent'); }} />
      {sidePanel && (
        <SidePanel isOpen={!!sidePanel} onClose={() => setSidePanel(null)} isFullScreen={sidePanel.type === 'addAccount'} title={sidePanel.type === 'assignQuery' ? 'Assign Optimization Task' : sidePanel.type === 'queryPreview' ? 'Query Preview' : 'Panel'}>
          {sidePanel.type === 'addAccount' && <AddAccountFlow onCancel={() => setSidePanel(null)} onAddAccount={() => {setAccounts(connectionsData); setSidePanel(null);}} />}
          {sidePanel.type === 'assignQuery' && (
            <AssignQueryFlow 
                query={sidePanel.data} 
                users={users} 
                onCancel={() => setSidePanel(null)} 
                onAssign={(details) => {
                    const newAssignment: AssignedQuery = {
                        id: `aq-${Date.now()}`,
                        queryId: sidePanel.data.id,
                        queryText: sidePanel.data.queryText,
                        assignedBy: currentUser?.name || 'Admin',
                        assignedTo: details.assignee,
                        priority: details.priority,
                        status: 'Assigned',
                        message: details.message,
                        assignedOn: new Date().toISOString(),
                        cost: sidePanel.data.costUSD || 0,
                        tokens: sidePanel.data.costTokens || 0,
                        credits: sidePanel.data.costCredits || 0,
                        warehouse: sidePanel.data.warehouse,
                        history: [
                            {
                                id: `coll-start`,
                                type: 'system',
                                author: currentUser?.name || 'Admin',
                                timestamp: new Date().toISOString(),
                                content: 'Assignment initiated'
                            }
                        ]
                    };
                    setAssignedQueries(prev => [newAssignment, ...prev]);
                    
                    // Create Notification for Data Engineer
                    const newNotification: Notification = {
                        id: `n-${Date.now()}`,
                        insightTypeId: 'QUERY_ASSIGNED',
                        insightTopic: 'QUERY_ASSIGNED',
                        message: `New query optimization task assigned by ${currentUser?.name || 'Admin'}.`,
                        suggestions: details.message || 'Please review the query execution plan and optimize partition filtering.',
                        timestamp: new Date().toISOString(),
                        warehouseName: sidePanel.data.warehouse || 'SYSTEM',
                        queryId: sidePanel.data.id,
                        isRead: false,
                        severity: 'Info'
                    };
                    setNotifications(prev => [newNotification, ...prev]);

                    setSidePanel(null);
                    setToastMessage("Optimization task successfully assigned.");
                }} 
            />
          )}
          {sidePanel.type === 'saveQuery' && (
            <SaveQueryFlow 
                files={sqlFiles} 
                onCancel={() => setSidePanel(null)} 
                onSave={(data) => {
                    if (data.saveType === 'new') {
                        const newFile: SQLFile = {
                            id: `file-${Date.now()}`,
                            name: data.fileName,
                            accountId: selectedAccount?.id || '',
                            accountName: selectedAccount?.name || '',
                            createdDate: new Date().toISOString(),
                            versions: [{
                                id: `v1-${Date.now()}`,
                                version: 1,
                                date: new Date().toISOString(),
                                description: data.description,
                                user: currentUser?.name || 'User',
                                tag: data.tag,
                                sql: analyzingQuery?.queryText || ''
                            }]
                        };
                        setSqlFiles(prev => [newFile, ...prev]);
                    } else {
                        setSqlFiles(prev => prev.map(f => {
                            if (f.id === data.fileId) {
                                return {
                                    ...f,
                                    versions: [
                                        ...f.versions,
                                        {
                                            id: `v${f.versions.length + 1}-${Date.now()}`,
                                            version: f.versions.length + 1,
                                            date: new Date().toISOString(),
                                            description: data.description,
                                            user: currentUser?.name || 'User',
                                            tag: data.tag,
                                            sql: analyzingQuery?.queryText || ''
                                        }
                                    ]
                                };
                            }
                            return f;
                        }));
                    }
                    setSidePanel(null);
                    setToastMessage("Query version saved successfully.");
                }}
            />
          )}
          {sidePanel.type === 'queryPreview' && (
            <QueryPreviewContent 
                query={sidePanel.data} 
                onAnalyze={(q) => { setAnalyzingQuery(q); setAccountViewPage('Query analyzer'); setSidePanel(null); }}
                onOptimize={(q) => { setAnalyzingQuery(q); setAccountViewPage('Query optimizer'); setSidePanel(null); }}
                onSimulate={(q) => { setAnalyzingQuery(q); setAccountViewPage('Query simulator'); setSidePanel(null); }}
            />
          )}
          {sidePanel.type === 'updateAssignmentStatus' && (
            <div className="p-8">
                <h3 className="text-lg font-bold mb-4">Update Assignment Status</h3>
                <div className="space-y-4">
                    {(['Assigned', 'In progress', 'Optimized', 'Cannot be optimized', 'Needs clarification'] as AssignmentStatus[]).map(s => (
                        <button 
                            key={s}
                            onClick={() => {
                                handleUpdateAssignmentStatus(sidePanel.data.id, s);
                                setSidePanel(null);
                            }}
                            className="w-full text-left p-4 rounded-xl border border-border-light hover:bg-surface-nested transition-colors flex items-center justify-between group"
                        >
                            <span className="font-medium">{s}</span>
                            <IconChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </div>
          )}
        </SidePanel>
      )}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
};

export default App;