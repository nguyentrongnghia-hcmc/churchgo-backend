
import React from 'react';
import { useI18n } from '../lib/i18n';
import { FiSearch } from 'react-icons/fi';

interface MainActionPanelProps {
  onStartSearch: () => void;
  isDetailViewOpen: boolean;
}

const MainActionPanel: React.FC<MainActionPanelProps> = ({ onStartSearch, isDetailViewOpen }) => {
  const { t } = useI18n();

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-[1000] p-4 transition-transform duration-300 ease-in-out ${isDetailViewOpen ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="w-full max-w-md mx-auto">
            <button 
                onClick={onStartSearch}
                className="w-full flex items-center justify-center gap-3 bg-teal-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-300 transition-all duration-200 transform hover:scale-105"
            >
                <FiSearch className="h-6 w-6" />
                <span className="text-lg">{t('mainActionPanel.findChurch')}</span>
            </button>
        </div>
    </div>
  );
};

export default MainActionPanel;