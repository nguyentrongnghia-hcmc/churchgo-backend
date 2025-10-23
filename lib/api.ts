import React, { useState, useEffect } from 'react';
import { Church, MediaItem } from '../App';

const API_URL_STORAGE_KEY = 'app-api-url';

// --- Helper Functions ---

/**
 * Retrieves the base API URL from sessionStorage.
 * @returns The stored URL or an empty string if not found.
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(API_URL_STORAGE_KEY) || '';
  }
  return '';
};

// --- API Status Management ---

type ApiStatus = 'live' | 'mock' | 'fallback';
// FIX: Moved getApiBaseUrl declaration before its usage to fix block-scoped variable error.
let currentApiStatus: ApiStatus = getApiBaseUrl() ? 'live' : 'mock';
const statusListeners = new Set<() => void>();

const setApiStatus = (status: ApiStatus) => {
  if (currentApiStatus !== status) {
    currentApiStatus = status;
    statusListeners.forEach(listener => listener());
  }
};

/**
 * A React hook to subscribe to real-time API status changes.
 * @returns The current API status: 'live', 'mock', or 'fallback'.
 */
export const useApiStatus = (): ApiStatus => {
  const [status, setStatus] = useState(currentApiStatus);
  useEffect(() => {
    const listener = () => setStatus(currentApiStatus);
    statusListeners.add(listener);
    // Initialize status on mount
    listener();
    return () => {
      statusListeners.delete(listener);
    };
  }, []);
  return status;
};

// --- Data Fetching and Caching (for Mock Mode) ---

let allChurchesData: Church[] | null = null;

const loadMockChurchesData = async (): Promise<Church[]> => {
  if (allChurchesData) {
    return allChurchesData;
  }
  try {
    const response = await fetch('/data/churches.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    
    allChurchesData = data.map((church: any) => {
      const { imageUrl, ...rest } = church;
      const media: MediaItem[] = [];
      if (imageUrl) {
        media.push({
          id: `media_${String(church.id)}_1`,
          url: imageUrl,
          type: 'image',
        });
      }
      return {
        ...rest,
        id: String(church.id),
        media,
      };
    });

    return allChurchesData as Church[];
  } catch (error) {
    console.error("Could not load mock church data:", error);
    throw error;
  }
};


// --- API Implementation ---

const API_DELAY_MOCK = 400; // ms

type SortKey = keyof Pick<Church, 'name' | 'address' | 'diocese'>;

interface GetChurchesOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sortConfig?: { key: SortKey; direction: 'ascending' | 'descending' } | null;
}

interface GetChurchesResponse {
  data: Church[];
  total: number;
  totalPages: number;
}

/**
 * Fetches, filters, sorts, and paginates churches.
 * This function dynamically switches between a real backend API and a mock implementation.
 */
export const getChurches = async (options: GetChurchesOptions = {}): Promise<GetChurchesResponse> => {
  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.searchTerm) params.append('searchTerm', options.searchTerm);
    if (options.sortConfig) {
      params.append('sortKey', options.sortConfig.key);
      params.append('sortDirection', options.sortConfig.direction);
    }
    
    try {
      const response = await fetch(`${apiBaseUrl}?${params.toString()}`);
      if (!response.ok) throw new Error(`Real API fetch failed: ${response.statusText}`);
      setApiStatus('live');
      return await response.json();
    } catch (error) {
       console.error("Error fetching from real API, falling back to mock.", error);
       setApiStatus('fallback');
       return getMockChurches(options);
    }
  } else {
    setApiStatus('mock');
    return getMockChurches(options);
  }
};

/**
 * Simulates a server-side API call using local JSON data.
 */
const getMockChurches = async (options: GetChurchesOptions = {}): Promise<GetChurchesResponse> => {
  const { 
    page = 1, 
    limit = 12, 
    searchTerm = '', 
    sortConfig = { key: 'name', direction: 'ascending' } 
  } = options;

  await new Promise(resolve => setTimeout(resolve, API_DELAY_MOCK));
  
  const allChurches = await loadMockChurchesData();
  let churches: Church[] = [...allChurches];

  if (searchTerm) {
    const lowercasedTerm = searchTerm.toLowerCase();
    churches = churches.filter(church =>
      church.name.toLowerCase().includes(lowercasedTerm) ||
      church.address.toLowerCase().includes(lowercasedTerm) ||
      church.diocese.toLowerCase().includes(lowercasedTerm)
    );
  }

  if (sortConfig) {
    churches.sort((a, b) => {
      const valA = a[sortConfig.key] || '';
      const valB = b[sortConfig.key] || '';
      if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }
  
  const totalItems = churches.length;
  const paginatedData = churches.slice((page - 1) * limit, page * limit);

  return {
    data: paginatedData,
    total: totalItems,
    totalPages: Math.ceil(totalItems / limit),
  };
};

/**
 * Fetches all churches, e.g., for the map view.
 * Switches between live and mock API.
 */
export const getAllChurches = async (): Promise<Church[]> => {
    const apiBaseUrl = getApiBaseUrl();

    if(apiBaseUrl) {
       try {
        const response = await fetch(`${apiBaseUrl}/all`);
        if (!response.ok) throw new Error(`Real API fetch failed for all churches: ${response.statusText}`);
        setApiStatus('live');
        return await response.json();
      } catch (error) {
        console.error("Error fetching all churches from real API, falling back to mock.", error);
        setApiStatus('fallback');
        return getAllMockChurches();
      }
    } else {
      setApiStatus('mock');
      return getAllMockChurches();
    }
};

/**
 * Simulates fetching all churches from local JSON.
 */
const getAllMockChurches = async (): Promise<Church[]> => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY_MOCK));
  const allChurches = await loadMockChurchesData();
  return [...allChurches];
}

// --- CRUD Operations ---

type ChurchCreationData = Omit<Church, 'id'>;

const handleApiError = (error: unknown, operation: string) => {
  console.error(`API Error on ${operation}:`, error);
  setApiStatus('fallback');
  throw error; // Re-throw the error for the UI to handle
};

export const createChurch = async (churchData: ChurchCreationData): Promise<Church> => {
    const apiBaseUrl = getApiBaseUrl();
    if (apiBaseUrl) {
        try {
            const response = await fetch(apiBaseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(churchData),
            });
            if (!response.ok) throw new Error('Failed to create church via API');
            setApiStatus('live');
            return response.json();
        } catch (error) {
            handleApiError(error, 'createChurch');
        }
    }
    // Mock mode
    setApiStatus('mock');
    await new Promise(resolve => setTimeout(resolve, API_DELAY_MOCK));
    const newChurch = { ...churchData, id: `mock_${Date.now()}` };
    allChurchesData = [newChurch, ...(allChurchesData || [])];
    return newChurch;
};

export const updateChurch = async (id: string, churchData: Church): Promise<Church> => {
    const apiBaseUrl = getApiBaseUrl();
    if (apiBaseUrl) {
        try {
            const response = await fetch(`${apiBaseUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(churchData),
            });
            if (!response.ok) throw new Error('Failed to update church via API');
            setApiStatus('live');
            return response.json();
        } catch (error) {
            handleApiError(error, 'updateChurch');
        }
    }
    // Mock mode
    setApiStatus('mock');
    await new Promise(resolve => setTimeout(resolve, API_DELAY_MOCK));
    allChurchesData = (allChurchesData || []).map(c => c.id === id ? churchData : c);
    return churchData;
};

export const deleteChurch = async (id: string): Promise<void> => {
    const apiBaseUrl = getApiBaseUrl();
    if (apiBaseUrl) {
        try {
            const response = await fetch(`${apiBaseUrl}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete church via API');
            setApiStatus('live');
        } catch (error) {
            handleApiError(error, 'deleteChurch');
        }
    } else {
        // Mock mode
        setApiStatus('mock');
        await new Promise(resolve => setTimeout(resolve, API_DELAY_MOCK));
        allChurchesData = (allChurchesData || []).filter(c => c.id !== id);
    }
};

export const bulkCreateChurches = async (churches: ChurchCreationData[]): Promise<{ count: number }> => {
    const apiBaseUrl = getApiBaseUrl();
    if (apiBaseUrl) {
        try {
            const response = await fetch(`${apiBaseUrl}/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(churches),
            });
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Failed to bulk create churches via API: ${response.statusText} - ${errorBody}`);
            }
            setApiStatus('live');
            return response.json();
        } catch (error) {
            handleApiError(error, 'bulkCreateChurches');
        }
    }
    // Mock mode
    setApiStatus('mock');
    await new Promise(resolve => setTimeout(resolve, API_DELAY_MOCK * 2));
    const newChurches = churches.map(c => ({ ...c, id: `mock_${Date.now()}_${Math.random()}` }));
    allChurchesData = [...newChurches, ...(allChurchesData || [])];
    return { count: churches.length };
};