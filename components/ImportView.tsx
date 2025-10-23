
import React, { useState, useRef } from 'react';
import { useI18n } from '../lib/i18n';
import { FiX, FiUploadCloud, FiFileText, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { bulkCreateChurches } from '../lib/api';
import { Church } from '../App';

type ImportStatus = 'idle' | 'importing' | 'success' | 'error';
type ChurchCreationData = Omit<Church, 'id'>;

interface ImportViewProps {
  onClose: () => void;
  onImportSuccess: () => void;
}

const EXAMPLE_JSON = `{
  "name": "Nhà thờ Mẫu",
  "address": "123 Đường Mẫu, Quận Mẫu, TPHCM",
  "diocese": "Tổng giáo phận Mẫu",
  "phone": "0123456789",
  "massTimes": {
    "weekdays": "17:30",
    "saturday": "18:00",
    "sunday": "8:00, 18:00"
  },
  "imageUrl": "https://example.com/image.jpg",
  "announcements": ["Thông báo 1", "Thông báo 2"],
  "lat": 10.123456,
  "lng": 106.123456
}`;

const ImportView: React.FC<ImportViewProps> = ({ onClose, onImportSuccess }) => {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleImport = async () => {
    if (!file) {
        setStatus('error');
        setMessage(t('admin.importErrorNoFile'));
        return;
    }
    setStatus('importing');
    setMessage('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File content is not readable");
        
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error("JSON is not an array");

        const result = await bulkCreateChurches(data as ChurchCreationData[]);
        setStatus('success');
        setMessage(t('admin.importSuccess', { count: result.count }));
      } catch (error: any) {
        setStatus('error');
        if (error instanceof SyntaxError) {
          setMessage(t('admin.importErrorInvalidJson'));
        } else {
          setMessage(t('admin.importError', { error: error.message }));
        }
      }
    };
    reader.onerror = () => {
        setStatus('error');
        setMessage('Failed to read file.');
    }
    reader.readAsText(file);
  };

  const handleClose = () => {
    if (status === 'success') {
      onImportSuccess();
    } else {
      onClose();
    }
  }

  const isActionable = status === 'idle' || status === 'error';

  return (
    <div 
      className="fixed inset-0 bg-black/40 z-[5000] flex items-center justify-center p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h2 id="import-modal-title" className="text-xl font-bold text-gray-800">
            {t('admin.importTitle')}
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50" disabled={status === 'importing'}>
            <FiX className="w-6 h-6 text-gray-600"/>
          </button>
        </header>
        
        <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-gray-600">{t('admin.importInstructions')}</p>
            <pre className="bg-gray-100 text-gray-700 text-xs p-3 rounded-md overflow-x-auto">
                <code>{EXAMPLE_JSON}</code>
            </pre>

            <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">{t('admin.importSelectFile')}</p>
            </div>
            
            {file && (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 p-2 rounded-md">
                    <FiFileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{t('admin.importSelectedFile')} {file.name}</span>
                </div>
            )}

            {status !== 'idle' && (
                <div className={`p-3 rounded-md text-sm flex items-center gap-3 ${
                    status === 'importing' ? 'bg-blue-50 text-blue-800' :
                    status === 'success' ? 'bg-green-50 text-green-800' :
                    'bg-red-50 text-red-800'
                }`}>
                    {status === 'importing' && <FiLoader className="animate-spin h-5 w-5" />}
                    {status === 'success' && <FiCheckCircle className="h-5 w-5" />}
                    {status === 'error' && <FiAlertCircle className="h-5 w-5" />}
                    <span className="font-semibold">{message}</span>
                </div>
            )}
        </main>

        <footer className="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-end">
            {status === 'success' ? (
                 <button onClick={handleClose} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700">
                    Close
                </button>
            ) : (
                <button 
                    onClick={handleImport} 
                    disabled={!file || status === 'importing'}
                    className="px-6 py-2 bg-teal-500 text-white font-bold rounded-lg shadow-md hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {status === 'importing' && <FiLoader className="animate-spin" />}
                    {t(status === 'importing' ? 'admin.importing' : 'admin.importButton')}
                </button>
            )}
        </footer>
      </div>
    </div>
  );
};

export default ImportView;