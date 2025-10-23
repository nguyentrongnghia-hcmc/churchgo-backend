
import React from 'react';
import { FiArrowLeft, FiSmartphone, FiUserCheck, FiLogOut } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useI18n } from '../lib/i18n';
import { User, ViewName } from '../App';

interface ViewProps {
  setActiveView: (view: ViewName) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const AccountView: React.FC<ViewProps> = ({ setActiveView, user, setUser }) => {
  const { t } = useI18n();

  const handleAdminLogin = () => {
    setUser({ role: 'superadmin' });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const LoggedOutView = () => (
    <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-teal-100/70 p-6 rounded-full mb-6">
        <FiUserCheck className="h-14 w-14 text-teal-500" />
      </div>
      
      <h2 className="text-3xl font-bold mb-8 text-gray-800">{t('account.header')}</h2>
      
      <div className="w-full max-w-xs space-y-4">
        <button className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50">
          {t('account.login')}
        </button>

        {/* Super Admin Login for Demo */}
        <button 
          onClick={handleAdminLogin}
          className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-red-700 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
          {t('account.loginAsAdmin')}
        </button>
        
        <div className="flex items-center py-2">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">{t('account.or')}</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors">
          <FcGoogle className="h-6 w-6" />
          <span>{t('account.registerGoogle')}</span>
        </button>
        
        <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors">
          <FiSmartphone className="h-5 w-5 text-gray-500" />
          <span>{t('account.registerPhone')}</span>
        </button>
      </div>
    </main>
  );

  const LoggedInView = () => (
     <main className="flex-grow flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-green-100 p-6 rounded-full mb-6">
          <FiUserCheck className="h-14 w-14 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-gray-800">{t('account.welcomeAdmin')}</h2>
        <p className="text-gray-500 mb-8">Super Admin</p>
        <button 
          onClick={handleLogout}
          className="w-full max-w-xs flex items-center justify-center gap-3 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
        >
          <FiLogOut />
          <span>{t('account.logout')}</span>
        </button>
      </main>
  );

  return (
    <div className="h-full w-full bg-white z-[2000] absolute top-0 left-0 flex flex-col">
      <header className="p-4 flex items-center border-b flex-shrink-0">
        <button 
          onClick={() => setActiveView('map')} 
          className="p-2 mr-4 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to map"
        >
          <FiArrowLeft className="h-6 w-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{t('account.title')}</h1>
      </header>
      {user ? <LoggedInView /> : <LoggedOutView />}
    </div>
  );
};

export default AccountView;