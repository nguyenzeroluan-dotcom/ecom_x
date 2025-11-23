
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const FormInput: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon, 
  rightElement, 
  containerClassName = '', 
  className = '',
  ...props 
}) => {
  return (
    <div className={containerClassName}>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <div className="relative">
        {icon && (
          <i className={`fas ${icon} absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400`}></i>
        )}
        <input
          className={`w-full border border-slate-300 dark:border-slate-600 rounded-lg py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-slate-900 dark:text-white transition-shadow ${icon ? 'pl-10 pr-3' : 'px-3'} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  headerAction?: React.ReactNode;
}

export const FormTextArea: React.FC<TextAreaProps> = ({ label, headerAction, className = '', ...props }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
        {headerAction}
      </div>
      <textarea
        className={`w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none resize-none dark:bg-slate-900 dark:text-white ${className}`}
        {...props}
      />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: string[];
  customOptionLabel?: string;
}

export const FormSelect: React.FC<SelectProps> = ({ label, options, customOptionLabel, className = '', children, ...props }) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <select
        className={`w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white dark:bg-slate-900 dark:text-white ${className}`}
        {...props}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        {customOptionLabel && <option value="NEW_CUSTOM" className="font-bold text-primary">{customOptionLabel}</option>}
        {children}
      </select>
    </div>
  );
};

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormCheckbox: React.FC<CheckboxProps> = ({ label, className = '', ...props }) => {
  return (
    <div className={`flex items-center gap-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-600 ${className}`}>
      <input
        type="checkbox"
        className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
        {...props}
      />
      <label htmlFor={props.id} className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
        {label}
      </label>
    </div>
  );
};
