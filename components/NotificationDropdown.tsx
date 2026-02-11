import React from 'react';
import { IconClose, IconBell, IconExclamationTriangle, IconList, IconClock, IconBolt } from '../constants';
import { Notification, NotificationType } from '../types';

// Fix: Added missing NotificationType properties (QUERY_ASSIGNED, ASSIGNMENT_UPDATED) to Record mapping
const typeToColorMap: Record<NotificationType, { bg: string; text: string }> = {
    performance: { bg: 'bg-status-warning-light', text: 'text-status-warning' },
    latency: { bg: 'bg-status-warning-light', text: 'text-status-warning' },
    storage: { bg: 'bg-status-info-light', text: 'text-status-info' },
    query: { bg: 'bg-status-info-light', text: 'text-status-info' },
    load: { bg: 'bg-status-error-light', text: 'text-status-error' },
    TABLE_SCAN: { bg: 'bg-status-warning-light', text: 'text-status-warning-dark' },
    JOIN_INEFFICIENCY: { bg: 'bg-status-warning-light', text: 'text-status-warning-dark' },
    WAREHOUSE_IDLE: { bg: 'bg-status-info-light', text: 'text-status-info-dark' },
    COST_SPIKE: { bg: 'bg-status-error-light', text: 'text-status-error-dark' },
    QUERY_ASSIGNED: { bg: 'bg-primary/10', text: 'text-primary' },
    ASSIGNMENT_UPDATED: { bg: 'bg-primary/10', text: 'text-primary' },
};

const NotificationIcon: React.FC<{ type: NotificationType, className?: string }> = ({ type, className }) => {
    switch(type) {
        case 'performance':
        case 'TABLE_SCAN':
        case 'JOIN_INEFFICIENCY':
        case 'WAREHOUSE_IDLE':
        // Fix: Added cases for assignment-related notifications
        case 'QUERY_ASSIGNED':
        case 'ASSIGNMENT_UPDATED':
            return <IconBell className={className} />;
        case 'latency':
            return <IconExclamationTriangle className={className} />;
        case 'storage':
            return <IconList className={className} />;
        case 'query':
            return <IconClock className={className} />;
        case 'load':
        case 'COST_SPIKE':
            return <IconBolt className={className} />;
        default:
            return <IconBell className={className} />;
    }
}

interface NotificationItemProps {
    notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    const colors = typeToColorMap[notification.insightTopic] || { bg: 'bg-status-info-light', text: 'text-status-info' };
    
    const formattedTimestamp = new Date(notification.timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });

    return (
        <li className={`hover:bg-surface-hover`}>
            <a href="#" className="flex gap-4 p-4">
                <div className="flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full ${colors.bg} flex items-center justify-center`}>
                        <NotificationIcon type={notification.insightTopic} className={`w-5 h-5 ${colors.text}`} />
                    </div>
                </div>
                <div className="flex-grow overflow-hidden">
                    <p className={`text-sm truncate ${!notification.isRead ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                        {notification.message}
                    </p>
                    <p className="text-xs text-text-muted mt-1">{formattedTimestamp}</p>
                </div>
                {!notification.isRead && (
                    <div className="flex-shrink-0 self-center">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                    </div>
                )}
            </a>
        </li>
    );
};

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAllAsRead: () => void;
    onViewAll: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose, notifications, onMarkAllAsRead, onViewAll }) => {
    if (!isOpen) {
        return null;
    }

    const sortedNotifications = [...notifications]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

    return (
        <div className="origin-top-right absolute right-0 top-full mt-2 w-96 rounded-lg shadow-lg bg-surface ring-1 ring-black ring-opacity-5 z-50 flex flex-col max-h-[calc(100vh-80px)]">
            <header className="p-4 flex items-center justify-between border-b border-border-color flex-shrink-0">
                <h3 className="text-lg font-semibold text-text-strong">Notifications</h3>
                <div className="flex items-center gap-4">
                    <button onClick={onMarkAllAsRead} className="text-sm font-medium text-link hover:underline">
                        Mark all as read
                    </button>
                    <button onClick={onClose} className="p-1 rounded-full text-text-secondary hover:bg-surface-hover">
                        <IconClose className="w-5 h-5" />
                    </button>
                </div>
            </header>
            
            <div className="overflow-y-auto flex-grow">
                {notifications.length > 0 ? (
                    <ul className="divide-y divide-border-light">
                        {sortedNotifications.map(n => <NotificationItem key={n.id} notification={n} />)}
                    </ul>
                ) : (
                    <div className="p-8 text-center text-text-secondary">
                        <p>No new notifications</p>
                    </div>
                )}
            </div>
            
            <footer className="p-4 border-t border-border-color flex-shrink-0">
                <button onClick={onViewAll} className="w-full bg-button-secondary-bg text-primary font-semibold py-2.5 px-4 rounded-lg hover:bg-button-secondary-bg-hover transition-colors">
                    View all notifications
                </button>
            </footer>
        </div>
    );
};

export default NotificationDropdown;