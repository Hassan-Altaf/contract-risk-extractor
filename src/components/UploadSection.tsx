/**
 * UploadSection — dual-mode input: PDF drag-and-drop or pasted text.
 * Validates file size (20MB) and text length (50 chars minimum).
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Clipboard, X } from 'lucide-react';

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  onTextSubmit: (text: string) => void;
  disabled?: boolean;
}

type InputMode = 'upload' | 'paste';

export function UploadSection({ onFileSelect, onTextSubmit, disabled }: UploadSectionProps) {
  const [mode, setMode] = useState<InputMode>('upload');
  const [pastedText, setPastedText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (mode === 'upload' && selectedFile) {
      onFileSelect(selectedFile);
    } else if (mode === 'paste' && pastedText.trim().length > 50) {
      onTextSubmit(pastedText);
    }
  }, [mode, selectedFile, pastedText, onFileSelect, onTextSubmit]);

  const canSubmit = mode === 'upload'
    ? !!selectedFile
    : pastedText.trim().length > 50;

  return (
    <div className="max-w-2xl mx-auto mt-6 sm:mt-8 px-4 sm:px-0 animate-fade-up animate-delay-2">
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-[0_16px_45px_-24px_rgba(15,23,42,0.35)] overflow-hidden transition-transform duration-300 hover:-translate-y-0.5">
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-colors ${
              mode === 'upload'
                ? 'text-blue-700 dark:text-blue-300 border-b-2 border-blue-600 bg-white dark:bg-slate-900/80'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload PDF
          </button>
          <button
            onClick={() => setMode('paste')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold transition-colors ${
              mode === 'paste'
                ? 'text-blue-700 dark:text-blue-300 border-b-2 border-blue-600 bg-white dark:bg-slate-900/80'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Clipboard className="w-4 h-4" />
            Paste Text
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {mode === 'upload' ? (
            <div>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl min-h-[190px] sm:min-h-[210px] p-5 sm:p-7 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                    : selectedFile
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {selectedFile ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <FileText className="w-9 h-9 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 break-all">{selectedFile.name}</p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3">
                    <Upload className="w-9 h-9 text-slate-400 dark:text-slate-500" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-lg">
                        Drop your contract PDF here
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        or click to browse - up to 20MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your contract or statement of work text here...&#10;&#10;The text should include the full contract clauses for accurate analysis."
                className="w-full h-52 sm:h-56 p-4 border border-slate-300 dark:border-slate-700 rounded-xl resize-none text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-950/50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Minimum 50 characters required.{' '}
                {pastedText.length > 0 && `${pastedText.length} characters entered.`}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || disabled}
            className="w-full mt-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:from-blue-800 hover:via-blue-700 hover:to-indigo-700 disabled:opacity-45 disabled:cursor-not-allowed transition-all shadow-[0_12px_30px_-16px_rgba(37,99,235,0.75)] hover:shadow-[0_16px_35px_-18px_rgba(37,99,235,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          >
            Analyse Contract
          </button>
        </div>
      </div>
    </div>
  );
}
