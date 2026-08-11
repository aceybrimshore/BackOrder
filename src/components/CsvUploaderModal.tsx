import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Sparkles, Trash2, ArrowRight, Layers, FileText, Wrench } from 'lucide-react';
import { detectCsvType } from '../utils/csvParser';

interface CsvUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType?: 'backorders' | 'workorders';
  onImportCsvs?: (data: { backordersCsv?: string; workordersCsv?: string }) => {
    success: boolean;
    backordersCount?: number;
    workordersCount?: number;
    error?: string;
  };
  onImportCsv?: (csvText: string, targetType: 'backorders' | 'workorders') => boolean;
}

export const CsvUploaderModal: React.FC<CsvUploaderModalProps> = ({
  isOpen,
  onClose,
  targetType: initialTargetType = 'backorders',
  onImportCsvs,
  onImportCsv
}) => {
  // Backorders State
  const [boCsvText, setBoCsvText] = useState('');
  const [boFileName, setBoFileName] = useState('');
  const [boLineCount, setBoLineCount] = useState<number | null>(null);
  const [showBoPaste, setShowBoPaste] = useState(false);

  // Work Orders State
  const [woCsvText, setWoCsvText] = useState('');
  const [woFileName, setWoFileName] = useState('');
  const [woLineCount, setWoLineCount] = useState<number | null>(null);
  const [showWoPaste, setShowWoPaste] = useState(false);

  // General Modal State
  const [error, setError] = useState<string | null>(null);
  const [detectedMessage, setDetectedMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // File Inputs Refs
  const masterInputRef = useRef<HTMLInputElement>(null);
  const boInputRef = useRef<HTMLInputElement>(null);
  const woInputRef = useRef<HTMLInputElement>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setBoCsvText('');
      setBoFileName('');
      setBoLineCount(null);
      setShowBoPaste(false);

      setWoCsvText('');
      setWoFileName('');
      setWoLineCount(null);
      setShowWoPaste(false);

      setError(null);
      setDetectedMessage(null);
      setIsDragging(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Helper to count non-empty CSV data rows
  const getLineCount = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    return Math.max(0, lines.length - 1);
  };

  // Helper to read file as text
  const readFileText = (file: File): Promise<{ name: string; text: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        resolve({ name: file.name, text: (e.target?.result as string) || '' });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Process a list of uploaded/dropped files
  const processFileList = async (files: File[]) => {
    setError(null);
    setDetectedMessage(null);

    const validFiles = files.filter(f => f.name.endsWith('.csv') || f.name.endsWith('.txt'));
    if (validFiles.length === 0) {
      setError('Please upload valid CSV or TXT files.');
      return;
    }

    try {
      const readResults = await Promise.all(validFiles.map(readFileText));

      if (readResults.length === 1) {
        // Single file uploaded - detect type and place into appropriate slot
        const item = readResults[0];
        const detection = detectCsvType(item.text);
        const count = getLineCount(item.text);

        if (detection.type === 'workorders') {
          setWoCsvText(item.text);
          setWoFileName(item.name);
          setWoLineCount(count);
          setDetectedMessage(`Loaded "${item.name}" into Work Orders (~${count} rows)`);
        } else {
          setBoCsvText(item.text);
          setBoFileName(item.name);
          setBoLineCount(count);
          setDetectedMessage(`Loaded "${item.name}" into Backorder Report (~${count} rows)`);
        }
      } else {
        // Multiple files uploaded - analyze each and assign to slots
        let assignedBo = false;
        let assignedWo = false;

        for (const item of readResults) {
          const detection = detectCsvType(item.text);
          const count = getLineCount(item.text);

          if (detection.type === 'workorders' && !assignedWo) {
            setWoCsvText(item.text);
            setWoFileName(item.name);
            setWoLineCount(count);
            assignedWo = true;
          } else if (detection.type === 'backorders' && !assignedBo) {
            setBoCsvText(item.text);
            setBoFileName(item.name);
            setBoLineCount(count);
            assignedBo = true;
          } else if (!assignedBo) {
            setBoCsvText(item.text);
            setBoFileName(item.name);
            setBoLineCount(count);
            assignedBo = true;
          } else if (!assignedWo) {
            setWoCsvText(item.text);
            setWoFileName(item.name);
            setWoLineCount(count);
            assignedWo = true;
          }
        }

        setDetectedMessage(
          `Auto-loaded ${readResults.length} files into Backorders and Work Orders!`
        );
      }
    } catch {
      setError('An error occurred while reading the file(s). Please try again.');
    }
  };

  // Master Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []) as File[];
    if (files.length > 0) {
      processFileList(files);
    }
  };

  // Individual Slot File Handlers
  const handleBoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { name, text } = await readFileText(file);
    setBoCsvText(text);
    setBoFileName(name);
    setBoLineCount(getLineCount(text));
    setError(null);
  };

  const handleWoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { name, text } = await readFileText(file);
    setWoCsvText(text);
    setWoFileName(name);
    setWoLineCount(getLineCount(text));
    setError(null);
  };

  const handleBoTextChange = (text: string) => {
    setBoCsvText(text);
    setBoLineCount(getLineCount(text));
    setError(null);
  };

  const handleWoTextChange = (text: string) => {
    setWoCsvText(text);
    setWoLineCount(getLineCount(text));
    setError(null);
  };

  const clearBo = () => {
    setBoCsvText('');
    setBoFileName('');
    setBoLineCount(null);
    if (boInputRef.current) boInputRef.current.value = '';
  };

  const clearWo = () => {
    setWoCsvText('');
    setWoFileName('');
    setWoLineCount(null);
    if (woInputRef.current) woInputRef.current.value = '';
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const hasBo = boCsvText.trim().length > 0;
    const hasWo = woCsvText.trim().length > 0;

    if (!hasBo && !hasWo) {
      setError('Please select or paste data for at least one report before updating.');
      return;
    }

    if (onImportCsvs) {
      const res = onImportCsvs({
        backordersCsv: hasBo ? boCsvText : undefined,
        workordersCsv: hasWo ? woCsvText : undefined
      });

      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to parse the provided CSV data.');
      }
    } else if (onImportCsv) {
      // Fallback
      if (hasBo) onImportCsv(boCsvText, 'backorders');
      if (hasWo) onImportCsv(woCsvText, 'workorders');
      onClose();
    }
  };

  const hasBoData = boCsvText.trim().length > 0;
  const hasWoData = woCsvText.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-400 text-slate-900">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Import CSV Reports & Datasets
              </h3>
              <p className="text-xs text-slate-300">
                Upload Backorder Report, Work Orders, or update both simultaneously
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Validation Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start space-x-2.5 animate-in fade-in duration-100">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Import Error</span>
                <p className="text-[11px] text-red-700 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Detected Info Pill */}
          {detectedMessage && !error && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center space-x-2 animate-in fade-in duration-100">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold text-[11px]">{detectedMessage}</span>
            </div>
          )}

          {/* Quick Dual-File Drag & Drop Zone */}
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => masterInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/40 ring-4 ring-amber-500/10 scale-[0.995]'
                  : 'border-slate-300 bg-slate-50 hover:border-amber-500 hover:bg-slate-100/60'
              }`}
            >
              <input
                ref={masterInputRef}
                type="file"
                accept=".csv,.txt"
                multiple
                onChange={e => {
                  if (e.target.files) processFileList(Array.from(e.target.files) as File[]);
                }}
                className="hidden"
              />
              <Upload className={`w-6 h-6 mx-auto mb-2 transition-transform ${isDragging ? 'text-amber-600 scale-110' : 'text-slate-400'}`} />
              <span className="text-slate-800 font-bold text-xs block mb-0.5">
                Drop your CSV report file(s) here, or click to select
              </span>
              <span className="text-[11px] text-slate-500">
                You can drop <strong>both</strong> Backorders & Work Orders at the same time (Auto-detects format)
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or Manage Individual Datasets
            </span>
          </div>

          {/* Side-by-Side / Stacked Dataset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CARD 1: BACKORDER REPORT */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                hasBoData
                  ? 'border-amber-400 bg-amber-50/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">1. Backorder Report</h4>
                    <p className="text-[10px] text-slate-500">Customer backorder demands</p>
                  </div>
                </div>

                {hasBoData ? (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Loaded ({boLineCount} rows)</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                )}
              </div>

              {boFileName ? (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-800 block truncate text-[11px]">{boFileName}</span>
                    <span className="text-[10px] text-slate-500">{boLineCount} items ready</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearBo}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200 transition-colors"
                    title="Clear file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <input
                    ref={boInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleBoFileChange}
                    className="hidden"
                    id="bo-file-input"
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="bo-file-input"
                      className="flex-1 py-1.5 px-3 text-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-[11px] cursor-pointer transition-colors"
                    >
                      Choose Backorders File
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowBoPaste(!showBoPaste)}
                      className="py-1.5 px-3 text-[11px] font-medium text-slate-600 hover:text-slate-900 underline"
                    >
                      {showBoPaste ? 'Hide Paste' : 'Paste Text'}
                    </button>
                  </div>
                </div>
              )}

              {/* Collapsible Paste for Backorders */}
              {(showBoPaste || (hasBoData && !boFileName)) && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <textarea
                    rows={4}
                    placeholder="Paste raw Backorders CSV text here..."
                    value={boCsvText}
                    onChange={e => handleBoTextChange(e.target.value)}
                    className="w-full p-2 font-mono text-[10px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            {/* CARD 2: WORK ORDERS */}
            <div
              className={`rounded-xl border p-4 transition-all ${
                hasWoData
                  ? 'border-blue-400 bg-blue-50/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">2. Work Orders</h4>
                    <p className="text-[10px] text-slate-500">Scheduled factory runs</p>
                  </div>
                </div>

                {hasWoData ? (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Loaded ({woLineCount} rows)</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Optional</span>
                )}
              </div>

              {woFileName ? (
                <div className="mt-2 p-2.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-800 block truncate text-[11px]">{woFileName}</span>
                    <span className="text-[10px] text-slate-500">{woLineCount} work orders ready</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearWo}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200 transition-colors"
                    title="Clear file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <input
                    ref={woInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleWoFileChange}
                    className="hidden"
                    id="wo-file-input"
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="wo-file-input"
                      className="flex-1 py-1.5 px-3 text-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-[11px] cursor-pointer transition-colors"
                    >
                      Choose Work Orders File
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowWoPaste(!showWoPaste)}
                      className="py-1.5 px-3 text-[11px] font-medium text-slate-600 hover:text-slate-900 underline"
                    >
                      {showWoPaste ? 'Hide Paste' : 'Paste Text'}
                    </button>
                  </div>
                </div>
              )}

              {/* Collapsible Paste for Work Orders */}
              {(showWoPaste || (hasWoData && !woFileName)) && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <textarea
                    rows={4}
                    placeholder="Paste raw Work Orders CSV text here..."
                    value={woCsvText}
                    onChange={e => handleWoTextChange(e.target.value)}
                    className="w-full p-2 font-mono text-[10px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Import Summary Banner */}
          {(hasBoData || hasWoData) && !error && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-[11px]">
                  {hasBoData && hasWoData
                    ? `Ready to update BOTH reports simultaneously (${boLineCount} Backorders + ${woLineCount} Work Orders)`
                    : hasBoData
                    ? `Ready to update Backorder Report (~${boLineCount} items)`
                    : `Ready to update Work Orders (~${woLineCount} work orders)`}
                </span>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasBoData && !hasWoData}
              className="px-5 py-2.5 rounded-xl text-slate-900 bg-amber-400 hover:bg-amber-300 font-bold disabled:opacity-40 transition-all shadow-2xs cursor-pointer active:scale-[0.98] flex items-center space-x-2"
            >
              <span>
                {hasBoData && hasWoData
                  ? 'Update Both Datasets'
                  : hasBoData
                  ? 'Update Backorders Report'
                  : hasWoData
                  ? 'Update Work Orders'
                  : 'Select or Drop File to Import'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

