
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { Church } from '../App';
import { useI18n } from '../lib/i18n';
import { FiMap, FiClock, FiSearch, FiInfo, FiX } from 'react-icons/fi';
import { FaChurch } from 'react-icons/fa';

type SearchTab = 'distance' | 'time' | 'text';

interface SearchContainerProps {
  allChurches: Church[];
  searchResults: Church[];
  userPosition: L.LatLng | null;
  onSearch: (results: Church[]) => void;
  onSelectChurch: (church: Church) => void;
  onClose: () => void;
}

const SearchContainer: React.FC<SearchContainerProps> = ({ allChurches, searchResults, userPosition, onSearch, onSelectChurch, onClose }) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<SearchTab>('distance');
  const [textSearch, setTextSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleDistanceSearch = (radiusKm: number | null) => {
    if (radiusKm === null) {
      onSearch(allChurches);
      setHasSearched(true);
      return;
    }
    if (!userPosition) {
      alert(t('searchContainer.findingLocation'));
      return;
    }
    const radiusMeters = radiusKm * 1000;
    const nearby = allChurches.filter(church => {
      const churchLatLng = L.latLng(church.lat, church.lng);
      return userPosition.distanceTo(churchLatLng) <= radiusMeters;
    });
    onSearch(nearby);
    setHasSearched(true);
  };
  
  const parseMassTimes = (timeStr: string, date: Date): Date[] => {
    if (!timeStr) return [];
    return timeStr.split(',').map(t => {
      const [h, m] = t.trim().split(':').map(Number);
      if (isNaN(h) || isNaN(m)) return null;
      const d = new Date(date);
      d.setHours(h, m, 0, 0);
      return d;
    }).filter((d): d is Date => d !== null);
  };

  const handleTimeSearch = (hoursFromNow: number) => {
    const now = new Date();
    const limitDate = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
    
    const results = allChurches.map(church => {
      let upcomingMasses: Date[] = [];
      for (let i = 0; i < 2; i++) { // Check today and tomorrow
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        const dayOfWeek = checkDate.getDay();
        
        let timeStr = '';
        if (dayOfWeek === 0) timeStr = church.massTimes.sunday;
        else if (dayOfWeek === 6) timeStr = church.massTimes.saturday;
        else timeStr = church.massTimes.weekdays;
        
        const massesOnDate = parseMassTimes(timeStr, checkDate);
        upcomingMasses.push(...massesOnDate.filter(m => m > now && m <= limitDate));
      }
      
      const nextMass = upcomingMasses.sort((a, b) => a.getTime() - b.getTime())[0];
      return { ...church, nextMass };
    }).filter(c => c.nextMass)
      .sort((a, b) => a.nextMass!.getTime() - b.nextMass!.getTime());

    onSearch(results);
    setHasSearched(true);
  };
  
  const debounce = (func: Function, delay: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: any) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const performTextSearch = (term: string) => {
      setHasSearched(true);
      if (!term) {
        onSearch(allChurches);
        return;
      }
      const lowercasedTerm = term.toLowerCase();
      const filtered = allChurches.filter(church =>
        church.name.toLowerCase().includes(lowercasedTerm) ||
        church.address.toLowerCase().includes(lowercasedTerm) ||
        church.diocese.toLowerCase().includes(lowercasedTerm)
      );
      onSearch(filtered);
  };
  
  const debouncedTextSearch = useCallback(debounce(performTextSearch, 300), [allChurches, onSearch]);

  useEffect(() => {
    if(activeTab === 'text') {
      debouncedTextSearch(textSearch);
    }
  }, [textSearch, activeTab, debouncedTextSearch]);

  const sortedResults = useMemo(() => {
    if (!userPosition) return searchResults;
    return [...searchResults].sort((a, b) => {
      const distA = userPosition.distanceTo(L.latLng(a.lat, a.lng));
      const distB = userPosition.distanceTo(L.latLng(b.lat, b.lng));
      return distA - distB;
    });
  }, [searchResults, userPosition]);

  const switchTab = (tab: SearchTab) => {
    setActiveTab(tab);
    setHasSearched(tab === 'text'); // For text search, start showing results immediately
    onSearch(allChurches); // Reset search results
    setTextSearch('');
  };

  return (
    <div
      className="fixed inset-0 bg-gray-50 z-[2000] flex flex-col animate-slide-up"
      role="dialog"
      aria-modal="true"
    >
      <header className="p-3 flex items-center justify-between border-b bg-white flex-shrink-0 sticky top-0">
        <h1 className="text-xl font-semibold text-gray-800">{t('mainActionPanel.findChurch')}</h1>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
          <FiX className="w-6 h-6 text-gray-800" />
        </button>
      </header>

      <div className="p-3 bg-white border-b flex-shrink-0">
        <div className="flex justify-around border-b">
          <TabButton icon={<FiMap />} label={t('searchContainer.byDistance')} isActive={activeTab === 'distance'} onClick={() => switchTab('distance')} />
          <TabButton icon={<FiClock />} label={t('searchContainer.byMassTime')} isActive={activeTab === 'time'} onClick={() => switchTab('time')} />
          <TabButton icon={<FiSearch />} label={t('searchContainer.byInfo')} isActive={activeTab === 'text'} onClick={() => switchTab('text')} />
        </div>
        
        <div className="pt-3">
          {activeTab === 'distance' && <DistanceSearch onSearch={handleDistanceSearch} t={t} />}
          {activeTab === 'time' && <TimeSearch onSearch={handleTimeSearch} t={t} />}
          {activeTab === 'text' && <TextSearch value={textSearch} onChange={setTextSearch} t={t} />}
        </div>
      </div>
      
      <div className="flex-grow p-3 overflow-y-auto">
        {hasSearched ? (
          <>
            <h3 className="font-bold text-gray-700 px-1 mb-2">{t('searchContainer.results')} ({sortedResults.length})</h3>
            {sortedResults.length > 0 ? (
              <ul className="space-y-2">
                {sortedResults.map(church => (
                  <ResultItem key={church.id} church={church} userPosition={userPosition} onClick={() => onSelectChurch(church)} />
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 pt-16 flex flex-col items-center">
                <FiSearch className="w-12 h-12 text-gray-300 mb-4" />
                <p className="font-semibold">{t('searchContainer.noResults')}</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400 pt-16 flex flex-col items-center">
            <FiSearch className="w-12 h-12 text-gray-300 mb-4" />
            <p>{t('searchContainer.startSearchPrompt')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-teal-600' : 'text-gray-500 hover:text-gray-800'}`}>
    {icon}
    <span className={`text-xs font-semibold ${isActive && 'font-bold'}`}>{label}</span>
    {isActive && <div className="w-10 h-1 bg-teal-600 rounded-full"></div>}
  </button>
);

const DistanceSearch: React.FC<{onSearch: (r: number | null) => void, t: Function}> = ({ onSearch, t }) => (
    <div className="grid grid-cols-5 gap-2">
        <button onClick={() => onSearch(1)} className="bg-teal-100 text-teal-800 text-xs font-bold py-2 px-1 rounded-lg hover:bg-teal-200 transition-colors">&lt; 1 km</button>
        <button onClick={() => onSearch(3)} className="bg-teal-100 text-teal-800 text-xs font-bold py-2 px-1 rounded-lg hover:bg-teal-200 transition-colors">&lt; 3 km</button>
        <button onClick={() => onSearch(5)} className="bg-teal-100 text-teal-800 text-xs font-bold py-2 px-1 rounded-lg hover:bg-teal-200 transition-colors">&lt; 5 km</button>
        <button onClick={() => onSearch(10)} className="bg-teal-100 text-teal-800 text-xs font-bold py-2 px-1 rounded-lg hover:bg-teal-200 transition-colors">&lt; 10 km</button>
        <button onClick={() => onSearch(null)} className="bg-gray-200 text-gray-800 text-xs font-bold py-2 px-1 rounded-lg hover:bg-gray-300 transition-colors">{t('searchContainer.showAll')}</button>
    </div>
);

const TimeSearch: React.FC<{onSearch: (h: number) => void, t: Function}> = ({ onSearch, t }) => (
    <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onSearch(2)} className="bg-teal-100 text-teal-800 text-xs font-bold py-2 px-1 rounded-lg hover:bg-teal-200 transition-colors">{t('searchContainer.next2Hours')}</button>
        <button onClick={() => onSearch(12)} className="bg-teal-100 text-teal-800 text-xs font-bold py-2 px-1 rounded-lg hover:bg-teal-200 transition-colors">{t('searchContainer.today')}</button>
        <button onClick={() => onSearch(24)} className="bg-teal-100 text-teal-800 text-xs font-bold py-2 px-1 rounded-lg hover:bg-teal-200 transition-colors">{t('searchContainer.thisEvening')}</button>
    </div>
);

const TextSearch: React.FC<{value: string, onChange: (v: string) => void, t: Function}> = ({ value, onChange, t }) => (
    <div className="relative">
      <FiInfo className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('searchContainer.searchPlaceholder')}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
      />
    </div>
);

const ResultItem: React.FC<{ church: Church, userPosition: L.LatLng | null, onClick: () => void }> = ({ church, userPosition, onClick }) => {
    const distance = userPosition ? (userPosition.distanceTo(L.latLng(church.lat, church.lng))/1000).toFixed(1) + ' km' : '';
    return (
        <li onClick={onClick} className="flex items-center gap-3 p-2 bg-white hover:bg-teal-50 rounded-lg cursor-pointer border border-gray-200 shadow-sm">
            <div className="bg-gray-200 p-3 rounded-lg">
                <FaChurch className="text-gray-600 w-5 h-5" />
            </div>
            <div className="flex-grow min-w-0">
                <p className="font-bold text-gray-800 truncate">{church.name}</p>
                <p className="text-sm text-gray-500 truncate">{church.address}</p>
            </div>
            <span className="text-sm font-semibold text-teal-700 flex-shrink-0">{distance}</span>
        </li>
    );
};


export default SearchContainer;