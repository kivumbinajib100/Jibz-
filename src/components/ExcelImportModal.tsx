import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck,
  Table,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Btn, Modal, Badge } from './common/UI';
import {
  parseExcelWorkbook,
  downloadExcelTemplate,
  exportToExcelWorkbook,
} from '../utils/excelCsv';

export type EntityType = 'students' | 'teachers' | 'classes' | 'subjects' | 'fees' | 'grades';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  title: string;
  onImportData: (parsedRows: string[][]) => { successCount: number; errors: string[] };
  onExportData?: () => void;
}

export function ExcelImportModal({
  isOpen,
  onClose,
  entityType,
  title,
  onImportData,
  onExportData,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewSheetName, setPreviewSheetName] = useState<string>('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [allSheetsData, setAllSheetsData] = useState<Record<string, string[][]>>({});
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ successCount: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMsg('Please select a valid Excel workbook (.xlsx, .xls) or CSV file.');
      return;
    }

    setFile(selectedFile);
    setIsLoading(true);
    setErrorMsg(null);
    setImportResult(null);

    try {
      const sheets = await parseExcelWorkbook(selectedFile);
      const names = Object.keys(sheets);
      if (names.length === 0) {
        throw new Error('The uploaded Excel workbook contains no readable sheets.');
      }

      setSheetNames(names);
      setAllSheetsData(sheets);
      const defaultSheet = names[0];
      setPreviewSheetName(defaultSheet);
      setParsedRows(sheets[defaultSheet] || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read the uploaded Excel workbook.');
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSheet = (sheetName: string) => {
    setPreviewSheetName(sheetName);
    setParsedRows(allSheetsData[sheetName] || []);
  };

  const handleConfirmImport = () => {
    if (parsedRows.length < 2) {
      setErrorMsg('The selected sheet does not contain enough data (headers + rows required).');
      return;
    }

    try {
      const result = onImportData(parsedRows);
      setImportResult(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while importing records.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setSheetNames([]);
    setAllSheetsData({});
    setErrorMsg(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const headers = parsedRows[0] || [];
  const rows = parsedRows.slice(1);

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title={`Excel Workbook Import & Export — ${title}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Template & Export Quick Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-indigo-100/60 border border-indigo-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md shadow-indigo-200">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <p className="font-bold text-indigo-950 text-sm">Need an Excel Template or Quick Export?</p>
              <p className="text-xs text-indigo-700">
                Download a pre-structured template or export current database records to Excel.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => downloadExcelTemplate(entityType)}
              className="px-3 py-2 rounded-xl bg-white text-indigo-700 border border-indigo-200 font-bold text-xs hover:bg-indigo-50 shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-1 sm:flex-initial"
            >
              <Download size={14} /> Sample Template
            </button>
            {onExportData && (
              <button
                onClick={onExportData}
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-1 sm:flex-initial"
              >
                <Download size={14} /> Export to Excel
              </button>
            )}
          </div>
        </div>

        {/* Upload Box */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-slate-50/80 rounded-2xl p-8 text-center cursor-pointer transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 flex items-center justify-center mx-auto mb-3 transition-colors">
              <Upload size={28} />
            </div>
            <p className="font-extrabold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
              Click or Drag Excel Workbook (.xlsx, .xls) or CSV here
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports Microsoft Excel spreadsheets with multiple sheets or standard CSV files.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Uploaded File Info Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                  <FileCheck size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-xs truncate">{file.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB • {rows.length} rows detected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Sheet Tabs Selector if workbook has multiple sheets */}
            {sheetNames.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Select Sheet:</span>
                {sheetNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleSelectSheet(name)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      previewSheetName === name
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {name} ({allSheetsData[name]?.length ? allSheetsData[name].length - 1 : 0})
                  </button>
                ))}
              </div>
            )}

            {/* Sheet Preview Table */}
            {parsedRows.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <p className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <Table size={14} className="text-slate-500" /> Workbook Preview ({rows.length} records)
                  </p>
                  <span className="text-[10px] text-slate-500">Header row automatically detected</span>
                </div>

                <div className="max-h-64 overflow-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 sticky top-0 border-b border-slate-200">
                        <th className="p-2 text-slate-400 font-bold w-10 text-center">#</th>
                        {headers.map((h, idx) => (
                          <th key={idx} className="p-2.5 font-extrabold text-slate-700 whitespace-nowrap">
                            {h || `Col ${idx + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/80">
                          <td className="p-2 text-slate-400 text-center font-mono text-[10px]">{rIdx + 1}</td>
                          {headers.map((_, cIdx) => (
                            <td key={cIdx} className="p-2.5 text-slate-700 whitespace-nowrap truncate max-w-[200px]">
                              {row[cIdx] || <span className="text-slate-300 font-italic">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rows.length > 10 && (
                    <div className="p-2 text-center text-[11px] text-slate-500 bg-slate-50 border-t border-slate-100">
                      Showing first 10 rows out of {rows.length} total rows.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-xs font-bold">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success / Result Notification */}
        {importResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Successfully Imported {importResult.successCount} Records!
            </div>
            {importResult.errors.length > 0 && (
              <div className="mt-2 pt-2 border-t border-emerald-200/60 text-emerald-800">
                <p className="font-bold text-[11px] mb-1">Warnings/Skipped rows:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {importResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Btn
            variant="secondary"
            onClick={() => {
              handleReset();
              onClose();
            }}
          >
            {importResult ? 'Close' : 'Cancel'}
          </Btn>
          {file && !importResult && (
            <Btn
              variant="primary"
              onClick={handleConfirmImport}
              disabled={isLoading || rows.length === 0}
            >
              Import {rows.length} Records to System
            </Btn>
          )}
        </div>
      </div>
    </Modal>
  );
}
