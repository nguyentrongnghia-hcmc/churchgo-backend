
import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import { FiWifiOff } from 'react-icons/fi';
import MapComponent from './components/MapComponent';
import TopNav from './components/TopNav';
import Clock from './components/Clock';
import AccountView from './components/AccountView';
import SettingsView from './components/SettingsView';
import HistoryView from './components/HistoryView';
import AdminView from './components/AdminView';
import ChurchDetailView from './components/ChurchDetailView';
import ApiSettingsView from './components/ApiSettingsView';
import ImportView from './components/ImportView';
import MainActionPanel from './components/MainActionPanel';
import SearchContainer from './components/SearchContainer';
import ChurchDetailPanel from './components/ChurchDetailPanel';
import AppInfoView from './components/AppInfoView';
import { I18nProvider, useI18n } from './lib/i18n';
import { createChurch, updateChurch, deleteChurch as apiDeleteChurch, getAllChurches, useApiStatus } from './lib/api';


export type ViewName = 'map' | 'account' | 'settings' | 'history' | 'admin' | 'churchDetail' | 'apiSettings' | 'appInfo';

export interface User {
  role: 'superadmin' | 'user';
}

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
}

export interface Church {
  id: string; // Changed to string to be compatible with Firestore IDs
  name: string;
  address: string;
  diocese: string;
  phone: string;
  massTimes: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  media: MediaItem[];
  announcements: string[];
  lat: number;
  lng: number;
}

const AppContent: React.FC = () => {
  const { t } = useI18n();
  const apiStatus = useApiStatus();
  const [activeView, setActiveView] = useState<ViewName>('map');
  const [isImportViewOpen, setIsImportViewOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [editingChurch, setEditingChurch] = useState<Church | null>(null);
  const [adminViewKey, setAdminViewKey] = useState(Date.now());

  // State for search and map functionality
  const [userPosition, setUserPosition] = useState<L.LatLng | null>(null);
  const [allChurches, setAllChurches] = useState<Church[]>([]);
  const [filteredChurches, setFilteredChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    getAllChurches().then(data => {
      setAllChurches(data);
      setFilteredChurches(data); // Initially, show all churches
    }).catch(err => {
      console.error("Failed to load church data on init:", err);
    });
  }, []);

  const handleSearchResults = (results: Church[]) => {
    setFilteredChurches(results);
    setSelectedChurch(null); // Clear selection when new search is performed
    setIsInitialLoad(false); // Any search action removes the initial state
  };
  
  const handleSelectChurch = (church: Church | null) => {
    // This function handles both selecting a church (from map or search)
    // and deselecting (closing the detail panel).
    // By setting both states, we ensure a reliable transition.
    setSelectedChurch(church);
    setIsSearching(false);
  };

  const handleStartSearch = () => {
    setIsSearching(true);
    setSelectedChurch(null);
  };
  
  const handleEndSearch = () => {
    setIsSearching(false);
    setFilteredChurches(allChurches); // Reset to show all churches
    setSelectedChurch(null);
    setIsInitialLoad(true); // Reset map to initial state
  };
  
  // Handlers for Admin CRUD operations
  const handleEditChurch = (church: Church) => {
    setEditingChurch(church);
    setActiveView('churchDetail');
  };

  const handleAddNewChurch = () => {
    const newChurch: Church = {
      id: 'new',
      name: '',
      address: '',
      diocese: '',
      phone: '',
      massTimes: { weekdays: '', saturday: '', sunday: '' },
      media: [],
      announcements: [],
      lat: userPosition?.lat || 10.8370,
      lng: userPosition?.lng || 106.6654,
    };
    setEditingChurch(newChurch);
    setActiveView('churchDetail');
  };
  
  const handleSaveChurch = async (churchToSave: Church) => {
    try {
      if (churchToSave.id === 'new') {
        const { id, ...churchData } = churchToSave;
        await createChurch(churchData as Omit<Church, 'id'>);
      } else {
        await updateChurch(churchToSave.id, churchToSave);
      }
      setAdminViewKey(Date.now()); // Force re-fetch in AdminView
      setActiveView('admin');
    } catch (error) {
      console.error('Failed to save church:', error);
      alert('Lưu nhà thờ thất bại. Vui lòng thử lại.');
    }
  };

  const handleDeleteChurch = async (churchId: string) => {
    try {
      await apiDeleteChurch(churchId);
      setAdminViewKey(Date.now()); // Force re-fetch in AdminView
      setActiveView('admin');
    } catch (error)
 {
      console.error('Failed to delete church:', error);
      alert('Xoá nhà thờ thất bại. Vui lòng thử lại.');
    }
  };


  const renderView = () => {
    switch (activeView) {
      case 'account':
        return <AccountView setActiveView={setActiveView} user={user} setUser={setUser} />;
      case 'settings':
        return <SettingsView setActiveView={setActiveView} />;
      case 'history':
        return <HistoryView setActiveView={setActiveView} />;
      case 'appInfo':
        return <AppInfoView setActiveView={setActiveView} />;
       case 'apiSettings':
        return <ApiSettingsView setActiveView={setActiveView} user={user} />;
      case 'admin':
        return (
          <>
            <AdminView 
              key={adminViewKey}
              setActiveView={setActiveView} 
              user={user} 
              onEditChurch={handleEditChurch} 
              onAddNewChurch={handleAddNewChurch}
              onImportClick={() => setIsImportViewOpen(true)}
            />
            {isImportViewOpen && (
              <ImportView 
                onClose={() => setIsImportViewOpen(false)} 
                onImportSuccess={() => {
                  setIsImportViewOpen(false);
                  setAdminViewKey(Date.now()); // Refresh admin view
                }}
              />
            )}
          </>
        );
      case 'churchDetail':
        if (!editingChurch) {
          setActiveView('admin');
          return null;
        }
        return <ChurchDetailView 
                  church={editingChurch} 
                  onBack={() => setActiveView('admin')} 
                  onSave={handleSaveChurch}
                  onDelete={handleDeleteChurch}
               />;
      case 'map':
      default:
        return (
          <>
            {apiStatus === 'fallback' && (
              <div 
                className="absolute top-0 left-0 right-0 bg-orange-500 text-white text-sm font-semibold text-center p-1 z-[1001] flex items-center justify-center gap-2"
                role="alert"
              >
                <FiWifiOff />
                <span>{t('api.fallbackWarning')}</span>
              </div>
            )}
            <MapComponent 
              churches={filteredChurches}
              selectedChurch={selectedChurch}
              onSelectChurch={handleSelectChurch}
              userPosition={userPosition}
              onPositionChange={setUserPosition}
              isInitialLoad={isInitialLoad}
            />
            <TopNav setActiveView={setActiveView} user={user} />
            <Clock />
            
            {isSearching ? (
              <SearchContainer
                allChurches={allChurches}
                searchResults={filteredChurches}
                userPosition={userPosition}
                onSearch={handleSearchResults}
                onSelectChurch={handleSelectChurch}
                onClose={handleEndSearch}
              />
            ) : (
              <MainActionPanel 
                onStartSearch={handleStartSearch}
                isDetailViewOpen={!!selectedChurch}
              />
            )}

            {selectedChurch && !isSearching && (
              <ChurchDetailPanel 
                church={selectedChurch}
                userPosition={userPosition}
                onClose={() => handleSelectChurch(null)}
              />
            )}
          </>
        );
    }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-gray-200">
      {renderView()}
    </main>
  );
};

const App: React.FC = () => (
  <I18nProvider>
    <AppContent />
  </I18nProvider>
);

export default App;
