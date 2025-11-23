
import React from 'react';
import { FormCheckbox, FormSelect } from '../../common/FormElements';
import { EBookMetadata } from '../../../types';

interface EBookSettingsProps {
    metadata: EBookMetadata;
    onChange: (updates: Partial<EBookMetadata>) => void;
}

const EBookSettings: React.FC<EBookSettingsProps> = ({ metadata, onChange }) => {
    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Rights & Protection</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Configure how users can access this content.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <FormCheckbox 
                            id="drm_enabled"
                            name="drm_enabled"
                            label="Enable DRM Protection"
                            checked={metadata.drm_enabled}
                            onChange={(e) => onChange({ drm_enabled: e.target.checked })}
                            className="bg-transparent p-0 border-0"
                        />
                        <p className="text-xs text-slate-500 mt-2 ml-6">
                            Prevents copy, paste, printing, and right-click context menus in the reader.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <FormCheckbox 
                            id="allow_download"
                            name="allow_download"
                            label="Allow PDF Download"
                            checked={metadata.allow_download}
                            onChange={(e) => onChange({ allow_download: e.target.checked })}
                            className="bg-transparent p-0 border-0"
                        />
                        <p className="text-xs text-slate-500 mt-2 ml-6">
                            If enabled, purchased users can download the raw file. Keep off for view-only access.
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Preview Settings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">How much content can be read before purchase?</p>
                
                <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Free Preview</label>
                    <select 
                        value={metadata.preview_percentage} 
                        onChange={(e) => onChange({ preview_percentage: Number(e.target.value) })}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none bg-white dark:bg-slate-900 dark:text-white"
                    >
                        <option value={0}>No Preview</option>
                        <option value={5}>5%</option>
                        <option value={10}>10% (Standard)</option>
                        <option value={20}>20%</option>
                        <option value={100}>Full Free Access</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default EBookSettings;
