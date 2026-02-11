
import React from 'react';

interface BreadcrumbItem {
    label: string;
    onClick?: () => void;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-label="breadcrumb" className="flex items-center space-x-1 text-[11px] font-bold text-text-muted">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <span className="text-border-color font-normal mx-1">/</span>
                    )}
                    {item.onClick && index < items.length - 1 ? (
                        <button 
                            onClick={item.onClick} 
                            className="hover:text-primary transition-colors text-text-muted"
                        >
                            {item.label}
                        </button>
                    ) : (
                        <span 
                            className={index === items.length - 1 ? 'text-text-primary' : ''}
                            aria-current={index === items.length - 1 ? 'page' : undefined}
                        >
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumb;
