import React, { useState, useRef, useEffect } from 'react';
import { IconAdjustments, IconCheck } from '../constants';

interface ColumnSelectorProps {
    columns: { key: string; label: string; }[];
    visibleColumns: string[];
    onVisibleColumnsChange: (visible: string[]) => void;
    defaultColumns?: string[];
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({ columns, visibleColumns, onVisibleColumnsChange, defaultColumns = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleColumn = (columnKey: string) => {
        if (defaultColumns.includes(columnKey)) return;

        const newVisibleColumns = visibleColumns.includes(columnKey)
            ? visibleColumns.filter(key => key !== columnKey)
            : [...visibleColumns, columnKey];
        onVisibleColumnsChange(newVisibleColumns);
    };

    return (
        <div className="relative group" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center p-2 rounded-md text-black hover:bg-button-secondary-bg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary transition-colors"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label="Select columns"
            >
                <IconAdjustments className="h-5 w-5" />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-surface rounded-lg shadow-lg z-20 border border-border-color">
                    <ul className="py-1 max-h-60 overflow-y-auto" role="listbox">
                        {columns.map(column => {
                            const isVisible = visibleColumns.includes(column.key);
                            const isDefault = defaultColumns.includes(column.key);
                            return (
                                <li key={column.key}>
                                    <button
                                        onClick={() => handleToggleColumn(column.key)}
                                        className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm transition-colors ${isDefault ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-hover'}`}
                                        role="option"
                                        aria-selected={isVisible}
                                        disabled={isDefault}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isVisible ? 'bg-primary border-primary' : 'border-text-muted'}`}>
                                            {isVisible && <IconCheck className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={`truncate ${isVisible ? 'font-semibold text-text-primary' : 'text-text-primary'}`}>
                                            {column.label}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ColumnSelector;