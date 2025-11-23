import React, { useRef, useEffect, useState } from 'react';
import { useModal } from '../../../contexts/ModalContext';
import { ModalType } from '../../../types';

interface RichTextEditorProps {
    initialContent: string;
    onChange: (content: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialContent, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const { openModal } = useModal();
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (editorRef.current && !editorRef.current.innerHTML && initialContent) {
            editorRef.current.innerHTML = initialContent;
        }
    }, [initialContent]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const insertImage = () => {
        openModal(ModalType.MEDIA_SELECTOR, {
            onSelect: (media: { imageUrl: string }) => {
                execCommand('insertImage', media.imageUrl);
                // Apply some basic styling to the inserted image
                const images = editorRef.current?.getElementsByTagName('img');
                if (images && images.length > 0) {
                    const lastImg = images[images.length - 1];
                    lastImg.style.maxWidth = '100%';
                    lastImg.style.height = 'auto';
                    lastImg.style.borderRadius = '8px';
                    lastImg.style.margin = '10px 0';
                }
                handleInput();
            }
        });
    };

    return (
        <div className={`border rounded-xl overflow-hidden bg-white dark:bg-slate-900 transition-all ${isFocused ? 'border-primary ring-1 ring-primary/50' : 'border-slate-300 dark:border-slate-700'}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden shadow-sm">
                    <button onClick={() => execCommand('bold')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200" title="Bold"><i className="fas fa-bold"></i></button>
                    <button onClick={() => execCommand('italic')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200" title="Italic"><i className="fas fa-italic"></i></button>
                    <button onClick={() => execCommand('underline')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200" title="Underline"><i className="fas fa-underline"></i></button>
                </div>

                <div className="flex bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden shadow-sm">
                    <button onClick={() => execCommand('formatBlock', 'H2')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-sm" title="Heading">H2</button>
                    <button onClick={() => execCommand('formatBlock', 'H3')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs" title="Subheading">H3</button>
                    <button onClick={() => execCommand('formatBlock', 'P')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs" title="Paragraph">P</button>
                </div>

                <div className="flex bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden shadow-sm">
                    <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200" title="Align Left"><i className="fas fa-align-left"></i></button>
                    <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200" title="Align Center"><i className="fas fa-align-center"></i></button>
                </div>

                <button onClick={insertImage} className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg ml-auto flex items-center gap-2 text-sm font-medium transition-colors">
                    <i className="fas fa-image"></i> <span className="hidden sm:inline">Insert Media</span>
                </button>
            </div>

            {/* Editor Area */}
            <div 
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto outline-none prose dark:prose-invert max-w-none"
            />
        </div>
    );
};

export default RichTextEditor;