
import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiSave, FiAlertCircle, FiSettings, FiCloud, FiUploadCloud, FiInfo } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useI18n } from '../lib/i18n';
import { User, ViewName } from '../App';
import { useApiStatus } from '../lib/api';

interface ViewProps {
  setActiveView: (view: ViewName) => void;
  user: User | null;
}

// Storage Keys
const API_URL_STORAGE_KEY = 'app-api-url';
const GOOGLE_API_KEY_STORAGE_KEY = 'google-api-key';
const GOOGLE_CLIENT_ID_STORAGE_KEY = 'google-client-id';
const GCS_BUCKET_NAME_KEY = 'gcs-bucket-name';
const GCS_SERVICE_ACCOUNT_KEY = 'gcs-service-account-key';

type ApiStatus = 'connected' | 'not_connected';

const ApiSettingsView: React.FC<ViewProps> = ({ setActiveView, user }) => {
  const { t } = useI18n();
  const apiStatus = useApiStatus();
  
  // App-wide status
  const [appVersion, setAppVersion] = useState('');
  
  // State for Backend API settings
  const [apiUrl, setApiUrl] = useState('');
  const [backendSaveStatus, setBackendSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [backendApiStatus, setBackendApiStatus] = useState<ApiStatus>('not_connected');
  
  // State for Google API settings
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleSaveStatus, setGoogleSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [googleApiStatus, setGoogleApiStatus] = useState<ApiStatus>('not_connected');

  // State for GCS settings
  const [gcsBucketName, setGcsBucketName] = useState('');
  const [gcsServiceAccountKey, setGcsServiceAccountKey] = useState('');
  const [gcsSaveStatus, setGcsSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [gcsStatus, setGcsStatus] = useState<ApiStatus>('not_connected');


  useEffect(() => {
    if (user?.role !== 'superadmin') {
      alert(t('admin.accessDenied'));
      setActiveView('map');
      return;
    }

    // Fetch app version
    fetch('/metadata.json')
      .then(res => res.json())
      .then(data => {
        const name = data.name || ''; // e.g., "ChurchGo 1.1.14"
        const versionMatch = name.match(/(\d+\.\d+\.\d+)/);
        if (versionMatch) {
          setAppVersion(versionMatch[1]);
        }
      })
      .catch(console.error);
      
    // Load Backend API and check status
    const storedUrl = sessionStorage.getItem(API_URL_STORAGE_KEY) || '';
    setApiUrl(storedUrl);
    if (storedUrl) {
      setBackendApiStatus('connected');
    }

    // Load Google API and check status
    const storedGoogleKey = sessionStorage.getItem(GOOGLE_API_KEY_STORAGE_KEY) || '';
    const storedGoogleClientId = sessionStorage.getItem(GOOGLE_CLIENT_ID_STORAGE_KEY) || '';
    setGoogleApiKey(storedGoogleKey);
    setGoogleClientId(storedGoogleClientId);
    if (storedGoogleKey && storedGoogleClientId) {
      setGoogleApiStatus('connected');
    }

    // Load GCS and check status
    const storedGcsBucket = sessionStorage.getItem(GCS_BUCKET_NAME_KEY) || '';
    const storedGcsKey = sessionStorage.getItem(GCS_SERVICE_ACCOUNT_KEY) || '';
    setGcsBucketName(storedGcsBucket);
    setGcsServiceAccountKey(storedGcsKey);
    if (storedGcsBucket && storedGcsKey) {
      setGcsStatus('connected');
    }

  }, [user, setActiveView, t]);
  
  const handleSaveBackend = () => {
    try {
      sessionStorage.setItem(API_URL_STORAGE_KEY, apiUrl);
      setBackendSaveStatus('success');
      if (apiUrl) {
        setBackendApiStatus('connected');
      } else {
        setBackendApiStatus('not_connected');
      }
      // Force a reload to apply the API change app-wide
      window.location.reload();
    } catch (e) {
      console.error("Failed to save API URL to sessionStorage:", e);
      setBackendSaveStatus('error');
      setTimeout(() => setBackendSaveStatus('idle'), 3000);
    }
  };
  
  const handleSaveGcs = () => {
    try {
      sessionStorage.setItem(GCS_BUCKET_NAME_KEY, gcsBucketName);
      sessionStorage.setItem(GCS_SERVICE_ACCOUNT_KEY, gcsServiceAccountKey);
      setGcsSaveStatus('success');
      if (gcsBucketName && gcsServiceAccountKey) {
        setGcsStatus('connected');
      } else {
        setGcsStatus('not_connected');
      }
    } catch (e) {
      console.error("Failed to save GCS settings to sessionStorage:", e);
      setGcsSaveStatus('error');
    } finally {
      setTimeout(() => setGcsSaveStatus('idle'), 3000);
    }
  };
  
  const handleSaveGoogle = () => {
    try {
      sessionStorage.setItem(GOOGLE_API_KEY_STORAGE_KEY, googleApiKey);
      sessionStorage.setItem(GOOGLE_CLIENT_ID_STORAGE_KEY, googleClientId);
      setGoogleSaveStatus('success');
      if (googleApiKey && googleClientId) {
        setGoogleApiStatus('connected');
      } else {
        setGoogleApiStatus('not_connected');
      }
    } catch (e) {
      console.error("Failed to save Google API settings to sessionStorage:", e);
      setGoogleSaveStatus('error');
    } finally {
      setTimeout(() => setGoogleSaveStatus('idle'), 3000);
    }
  };

  if (user?.role !== 'superadmin') return null;

  const StatusBadge: React.FC<{ status: ApiStatus }> = ({ status }) => (
    <span className={`text-xs font-bold py-1 px-3 rounded-full whitespace-nowrap ${status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
      {t('apiSettings.status')}: <span className="font-mono">{status === 'connected' ? t('apiSettings.statusConnected') : t('apiSettings.statusNotConnected')}</span>
    </span>
  );

  const renderApiModeBadge = () => {
    if (apiStatus === 'live') {
      return <span className="font-bold py-1 px-3 rounded-full bg-green-100 text-green-800">{t('apiSettings.apiModeLive')}</span>;
    }
    if (apiStatus === 'fallback') {
      return <span className="font-bold py-1 px-3 rounded-full bg-orange-100 text-orange-800">{t('apiSettings.apiModeFallback')}</span>;
    }
    return <span className="font-bold py-1 px-3 rounded-full bg-yellow-100 text-yellow-800">{t('apiSettings.apiModeMock')}</span>;
  };

  return (
    <div className="h-full w-full bg-gray-50 z-[2000] absolute top-0 left-0 flex flex-col">
      <header className="p-4 flex items-center border-b bg-white flex-shrink-0 sticky top-0">
        <button 
          onClick={() => setActiveView('map')} 
          className="p-2 mr-4 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to map"
        >
          <FiArrowLeft className="h-6 w-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{t('apiSettings.title')}</h1>
      </header>
      
      <main className="flex-grow p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          
           {/* Card 0: Overall Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3 mb-4">
                <FiInfo className="text-gray-500" />
                {t('apiSettings.appStatusTitle')}
            </h2>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600">{t('apiSettings.apiMode')}</span>
                    {renderApiModeBadge()}
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-600">{t('apiSettings.appVersion')}</span>
                    <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                        {appVersion || '...'}
                    </span>
                </div>
            </div>
          </div>


          {/* Card 1: App Backend API Settings */}
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                        <FiCloud className="text-teal-500" />
                        {t('apiSettings.appBackendTitle')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        {t('apiSettings.helpText')}
                    </p>
                </div>
                <StatusBadge status={backendApiStatus} />
            </div>

            <input 
              type="text" 
              id="apiUrl"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder={t('apiSettings.placeholder')}
              className="mt-4 block w-full px-4 py-3 font-mono text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="mt-6 flex items-center justify-between">
              <div className="h-5 text-sm font-semibold">
                {backendSaveStatus === 'success' && <span className="text-green-600 animate-pulse">{t('apiSettings.saveSuccess')}</span>}
                {backendSaveStatus === 'error' && <span className="text-red-600 flex items-center gap-2"><FiAlertCircle/> {t('apiSettings.saveError')}</span>}
              </div>
              <button 
                  onClick={handleSaveBackend} 
                  className="flex items-center gap-2 bg-teal-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                  <FiSave />
                  <span>{t('apiSettings.save')}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Google Cloud Storage Settings */}
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
             <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                  <FiUploadCloud className="text-orange-500" />
                  {t('apiSettings.gcsTitle')}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  {t('apiSettings.gcsDescription')}
                </p>
              </div>
              <StatusBadge status={gcsStatus} />
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="gcsBucketName" className="block text-sm font-medium text-gray-700">{t('apiSettings.gcsBucketName')}</label>
                <input 
                  type="text" 
                  id="gcsBucketName"
                  value={gcsBucketName}
                  onChange={(e) => setGcsBucketName(e.target.value)}
                  placeholder={t('apiSettings.gcsBucketNamePlaceholder')}
                  className="mt-1 block w-full px-4 py-2 font-mono text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label htmlFor="gcsServiceAccountKey" className="block text-sm font-medium text-gray-700">{t('apiSettings.gcsServiceAccountKey')}</label>
                <textarea 
                  id="gcsServiceAccountKey"
                  rows={5}
                  value={gcsServiceAccountKey}
                  onChange={(e) => setGcsServiceAccountKey(e.target.value)}
                  placeholder={t('apiSettings.gcsServiceAccountKeyPlaceholder')}
                  className="mt-1 block w-full px-4 py-2 font-mono text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="h-5 text-sm font-semibold">
                {gcsSaveStatus === 'success' && <span className="text-green-600 animate-pulse">{t('apiSettings.saveSuccess')}</span>}
                {gcsSaveStatus === 'error' && <span className="text-red-600 flex items-center gap-2"><FiAlertCircle/> {t('apiSettings.saveError')}</span>}
              </div>
              <button 
                  onClick={handleSaveGcs} 
                  className="flex items-center gap-2 bg-orange-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                  <FiSave />
                  <span>{t('apiSettings.saveGcsSettings')}</span>
              </button>
            </div>
          </div>

          {/* Card 3: Google API Integration */}
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">
                  <FcGoogle />
                  {t('apiSettings.googleTitle')}
                </h2>
                <p className="text-sm text-gray-500 mt-2">{t('apiSettings.googleDescription')}</p>
              </div>
              <StatusBadge status={googleApiStatus} />
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="googleApiKey" className="block text-sm font-medium text-gray-700">{t('apiSettings.googleApiKey')}</label>
                <input 
                  type="password" 
                  id="googleApiKey"
                  value={googleApiKey}
                  onChange={(e) => setGoogleApiKey(e.target.value)}
                  placeholder={t('apiSettings.googleApiKeyPlaceholder')}
                  className="mt-1 block w-full px-4 py-2 font-mono text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="googleClientId" className="block text-sm font-medium text-gray-700">{t('apiSettings.googleClientId')}</label>
                <input 
                  type="password" 
                  id="googleClientId"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  placeholder={t('apiSettings.googleClientIdPlaceholder')}
                  className="mt-1 block w-full px-4 py-2 font-mono text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

             <div className="mt-6 flex items-center justify-between">
              <div className="h-5 text-sm font-semibold">
                {googleSaveStatus === 'success' && <span className="text-green-600 animate-pulse">{t('apiSettings.saveSuccess')}</span>}
                {googleSaveStatus === 'error' && <span className="text-red-600 flex items-center gap-2"><FiAlertCircle/> {t('apiSettings.saveError')}</span>}
              </div>
              <button 
                  onClick={handleSaveGoogle} 
                  className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              >
                  <FiSave />
                  <span>{t('apiSettings.saveGoogleSettings')}</span>
              </button>
            </div>
            
            <div className={`mt-8 border-t pt-6 transition-opacity duration-500 ${googleApiStatus !== 'connected' ? 'opacity-50' : ''}`}>
               <h3 className="text-base font-bold text-gray-700 flex items-center gap-3">
                 <FiSettings />
                 {t('apiSettings.nextSteps')}
               </h3>
               <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg text-center transition-colors ${googleApiStatus === 'connected' ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer' : 'bg-gray-100 cursor-not-allowed'}`}>
                    <p className="font-semibold text-gray-800">{t('apiSettings.quotas')}</p>
                  </div>
                   <div className={`p-4 rounded-lg text-center transition-colors ${googleApiStatus === 'connected' ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer' : 'bg-gray-100 cursor-not-allowed'}`}>
                    <p className="font-semibold text-gray-800">{t('apiSettings.dataImport')}</p>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiSettingsView;
