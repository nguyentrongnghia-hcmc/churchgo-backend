
import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useI18n } from '../lib/i18n';
import { ViewName } from '../App';

interface ViewProps {
  setActiveView: (view: ViewName) => void;
}

const HistoryView: React.FC<ViewProps> = ({ setActiveView }) => {
  const { t } = useI18n();
  return (
    <div className="h-full w-full bg-white z-[2000] absolute top-0 left-0">
      <header className="p-4 flex items-center border-b">
        <button 
          onClick={() => setActiveView('map')} 
          className="p-2 mr-4 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to map"
        >
          <FiArrowLeft className="h-6 w-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{t('history.title')}</h1>
      </header>
      <div className="flex items-center justify-center h-[calc(100%-65px)]">
        <p className="text-gray-500 text-lg">{t('history.updating')}</p>
      </div>
    </div>
  );
};

export default HistoryView;