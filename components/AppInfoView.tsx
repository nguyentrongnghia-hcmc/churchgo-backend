
import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { FaChurch } from 'react-icons/fa';
import { useI18n } from '../lib/i18n';
import { ViewName } from '../App';

interface ViewProps {
  setActiveView: (view: ViewName) => void;
}

const AppInfoView: React.FC<ViewProps> = ({ setActiveView }) => {
  const { t } = useI18n();
  const [appName, setAppName] = useState('');
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    fetch('/metadata.json')
      .then(res => res.json())
      .then(data => {
        const name = data.name || ''; // e.g., "ChurchGo 1.1.14"
        const versionMatch = name.match(/(\d+\.\d+\.\d+)/);
        if (versionMatch) {
          setAppVersion(versionMatch[1]);
          setAppName(name.replace(versionMatch[0], '').trim());
        } else {
          setAppName(name);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="h-full w-full bg-white z-[2000] absolute top-0 left-0 flex flex-col">
      <header className="p-4 flex items-center border-b">
        <button
          onClick={() => setActiveView('map')}
          className="p-2 mr-4 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to map"
        >
          <FiArrowLeft className="h-6 w-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{t('appInfo.title')}</h1>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-teal-100/70 p-6 rounded-full mb-6">
            <FaChurch className="h-14 w-14 text-teal-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">{appName}</h2>
        {appVersion && (
          <p className="text-gray-500 mt-2 text-lg">
            {t('appInfo.version', { version: appVersion })}
          </p>
        )}
      </main>
      <footer className="flex-shrink-0 p-4 text-center text-gray-400 text-sm">
        {t('appInfo.copyright')}
      </footer>
    </div>
  );
};

export default AppInfoView;