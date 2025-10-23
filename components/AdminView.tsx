
import React, { useState, useEffect, useCallback } from 'react';
import { FiArrowLeft, FiPlus, FiSearch, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiArrowUp, FiArrowDown, FiUpload } from 'react-icons/fi';
import { useI18n } from '../lib/i18n';
import { User, Church, ViewName } from '../App';
import { getChurches, useApiStatus } from '../lib/api';

type SortKey = keyof Pick<Church, 'name' | 'address' | 'diocese'>;

interface ViewProps {
  setActiveView: (view: ViewName) => void;
  user: User | null;
  onEditChurch: (church: Church) => void;
  onAddNewChurch: () => void;
  onImportClick: () => void;
}

const ITEMS_PER_PAGE = 12;

const AdminView: React.FC<ViewProps> = ({ setActiveView, user, onEditChurch, onAddNewChurch, onImportClick }) => {
  const { t } = useI18n();
  const apiStatus = useApiStatus();
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalChurches, setTotalChurches] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

  const fetchChurches = useCallback(async () => {
    if (user?.role !== 'superadmin') return;
    setIsLoading(true);
    try {
      const response = await getChurches({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        searchTerm,
        sortConfig,
      });
      setChurches(response.data);
      setTotalPages(response.totalPages);
      setTotalChurches(response.total);
    } catch (err) {
      console.error("Failed to load church data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, sortConfig, user?.role]);

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      alert(t('admin.accessDenied'));
      setActiveView('map');
      return;
    }
    fetchChurches();
  }, [user, setActiveView, t, fetchChurches]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setCurrentPage(1); // Reset to first page on sort
    setSortConfig({ key, direction });
  };
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  if (user?.role !== 'superadmin') return null;

  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (!sortConfig || sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'ascending' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />;
  };

  const renderApiStatusBadge = () => {
    if (apiStatus === 'live') {
      return <span className="text-xs font-bold py-1 px-2 rounded-full bg-green-100 text-green-800">{t('apiSettings.apiModeLive')}</span>;
    }
    if (apiStatus === 'fallback') {
      return <span className="text-xs font-bold py-1 px-2 rounded-full bg-orange-100 text-orange-800">{t('apiSettings.apiModeFallback')}</span>;
    }
    return <span className="text-xs font-bold py-1 px-2 rounded-full bg-yellow-100 text-yellow-800">{t('apiSettings.apiModeMock')}</span>;
  };

  return (
    <div className="h-full w-full bg-gray-50 z-[2000] absolute top-0 left-0 flex flex-col">
      <header className="p-3 md:p-4 flex items-center justify-between border-b bg-white flex-shrink-0 sticky top-0">
        <div className="flex items-center">
          <button onClick={() => setActiveView('map')} className="p-2 mr-2 md:mr-4 rounded-full hover:bg-gray-100" aria-label="Back to map">
            <FiArrowLeft className="h-6 w-6 text-gray-800" />
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-gray-800">{t('admin.title')}</h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={onImportClick} className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 font-bold py-2 px-3 md:px-4 rounded-lg shadow-sm hover:bg-gray-50">
                <FiUpload />
                <span className="hidden md:inline">{t('admin.import')}</span>
            </button>
            <button onClick={onAddNewChurch} className="flex items-center gap-2 bg-teal-500 text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-md hover:bg-teal-600">
                <FiPlus />
                <span className="hidden md:inline">{t('admin.add')}</span>
            </button>
        </div>
      </header>

      <main className="flex-grow p-3 md:p-4 overflow-y-auto">
        <div className="mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="relative flex-grow">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder={t('admin.searchPlaceholder')} 
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-4 justify-end">
              {renderApiStatusBadge()}
              <div className="text-right text-gray-600 font-semibold flex-shrink-0">
                {t('admin.total')}: {totalChurches}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 mt-8">{t('admin.loading')}</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-3 font-semibold text-gray-600 cursor-pointer" onClick={() => requestSort('name')}>{t('admin.churchName')} <SortIndicator columnKey="name" /></th>
                    <th className="p-3 font-semibold text-gray-600 cursor-pointer" onClick={() => requestSort('address')}>{t('admin.address')} <SortIndicator columnKey="address" /></th>
                    <th className="p-3 font-semibold text-gray-600 cursor-pointer" onClick={() => requestSort('diocese')}>{t('admin.diocese')} <SortIndicator columnKey="diocese" /></th>
                  </tr>
                </thead>
                <tbody>
                  {churches.map((church, index) => (
                    <tr key={church.id} className={`border-b border-gray-200 hover:bg-teal-50/50 cursor-pointer ${index === churches.length - 1 ? 'border-b-0' : ''}`} onClick={() => onEditChurch(church)}>
                      <td className="p-3 font-medium text-gray-800">{church.name}</td>
                      <td className="p-3 text-gray-600">{church.address}</td>
                      <td className="p-3 text-gray-600">{church.diocese}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {churches.map(church => (
                <div key={church.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200" onClick={() => onEditChurch(church)}>
                  <h3 className="font-bold text-gray-800 text-base">{church.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{church.address}</p>
                  <p className="text-sm text-gray-500 mt-1"><span className="font-semibold">{t('admin.diocese')}:</span> {church.diocese}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {!isLoading && totalPages > 1 && (
        <footer className="p-3 flex-shrink-0 bg-white border-t sticky bottom-0 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {t('admin.page')} {currentPage} / {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><FiChevronsLeft /></button>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><FiChevronLeft /></button>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><FiChevronRight /></button>
            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><FiChevronsRight /></button>
          </div>
        </footer>
      )}
    </div>
  );
};

export default AdminView;
