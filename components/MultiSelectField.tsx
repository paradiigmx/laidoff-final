import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectFieldProps {
    label: string;
    options: string[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    helperText?: string;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
    label,
    options,
    selectedValues,
    onChange,
    placeholder = 'Select options...',
    helperText
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleOption = (option: string) => {
        if (selectedValues.includes(option)) {
            onChange(selectedValues.filter(v => v !== option));
        } else {
            onChange([...selectedValues, option]);
        }
    };

    const removeChip = (option: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedValues.filter(v => v !== option));
    };

    return (
        <div ref={containerRef} className="relative">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm cursor-pointer focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 min-h-[48px] flex items-center justify-between gap-2"
            >
                <div className="flex-1 flex flex-wrap gap-1.5">
                    {selectedValues.length === 0 ? (
                        <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
                    ) : (
                        selectedValues.map(value => (
                            <span
                                key={value}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold"
                            >
                                {value}
                                <button
                                    type="button"
                                    onClick={(e) => removeChip(value, e)}
                                    className="hover:text-purple-900 dark:hover:text-purple-100 transition-colors"
                                >
                                    ×
                                </button>
                            </span>
                        ))
                    )}
                </div>
                <svg
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-slate-400">No options found</div>
                        ) : (
                            filteredOptions.map(option => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(option);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                                        selectedValues.includes(option) ? 'bg-purple-50 dark:bg-purple-900/30' : ''
                                    }`}
                                >
                                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                        selectedValues.includes(option)
                                            ? 'bg-purple-600 border-purple-600'
                                            : 'border-slate-300 dark:border-slate-600'
                                    }`}>
                                        {selectedValues.includes(option) && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </span>
                                    <span className={`${selectedValues.includes(option) ? 'text-purple-700 dark:text-purple-300 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {option}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
            
            {helperText && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{helperText}</p>
            )}
        </div>
    );
};
