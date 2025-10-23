
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 1. Language Definitions
export interface Language {
  name: string;
  nativeName: string;
  countryCode: string;
}

export const languages: Record<string, Language> = {
  'vi': { name: 'Vietnamese', nativeName: 'Tiếng Việt', countryCode: 'vn' },
  'en': { name: 'English', nativeName: 'English', countryCode: 'gb' },
  'zh': { name: 'Chinese (Simplified)', nativeName: '中文 (简体)', countryCode: 'cn' },
  'ja': { name: 'Japanese', nativeName: '日本語', countryCode: 'jp' },
  'ko': { name: 'Korean', nativeName: '한국어', countryCode: 'kr' },
  'es': { name: 'Spanish', nativeName: 'Español', countryCode: 'es' },
  'fr': { name: 'French', nativeName: 'Français', countryCode: 'fr' },
  'de': { name: 'German', nativeName: 'Deutsch', countryCode: 'de' },
  'ru': { name: 'Russian', nativeName: 'Русский', countryCode: 'ru' },
  'pt': { name: 'Portuguese', nativeName: 'Português', countryCode: 'pt' },
  'it': { name: 'Italian', nativeName: 'Italiano', countryCode: 'it' },
  'nl': { name: 'Dutch', nativeName: 'Nederlands', countryCode: 'nl' },
  'ar': { name: 'Arabic', nativeName: 'العربية', countryCode: 'sa' },
  'hi': { name: 'Hindi', nativeName: 'हिन्दी', countryCode: 'in' },
  'tr': { name: 'Turkish', nativeName: 'Türkçe', countryCode: 'tr' },
  'pl': { name: 'Polish', nativeName: 'Polski', countryCode: 'pl' },
  'sv': { name: 'Swedish', nativeName: 'Svenska', countryCode: 'se' },
  'th': { name: 'Thai', nativeName: 'ไทย', countryCode: 'th' },
  'id': { name: 'Indonesian', nativeName: 'Bahasa Indonesia', countryCode: 'id' },
  'ms': { name: 'Malay', nativeName: 'Bahasa Melayu', countryCode: 'my' },
  'fil': { name: 'Filipino', nativeName: 'Filipino', countryCode: 'ph' },
};

export const supportedLangs = Object.keys(languages);
const defaultLang = 'vi';

// 2. Translation Strings
const translations = {
  vi: {
    topNav: {
      account: 'Tài khoản',
      settings: 'Cài đặt',
      history: 'Lịch sử',
      manageChurches: 'Quản lý Nhà thờ',
      apiSettings: 'Cài đặt API',
      appInfo: 'Thông tin Ứng dụng',
    },
    account: {
      title: 'Tài khoản',
      header: 'Đăng nhập/Đăng ký',
      login: 'Đăng nhập',
      or: 'hoặc',
      registerGoogle: 'Đăng ký với Google',
      registerPhone: 'Đăng ký với SĐT',
      loginAsAdmin: 'Đăng nhập Super Admin',
      welcomeAdmin: 'Chào mừng Admin!',
      logout: 'Đăng xuất',
    },
    settings: {
      title: 'Cài đặt',
      updating: 'Đang cập nhật',
    },
    history: {
      title: 'Lịch sử',
      updating: 'Đang cập nhật',
    },
    appInfo: {
      title: 'Thông tin Ứng dụng',
      version: 'Phiên bản {version}',
      copyright: '© 2024 ChurchGo. Mọi quyền được bảo lưu.',
    },
    languageSelector: {
      title: 'Ngôn ngữ'
    },
    mainActionPanel: {
      findChurch: 'Tìm Nhà thờ',
    },
    searchContainer: {
      byDistance: 'Khoảng cách',
      byMassTime: 'Giờ lễ',
      byInfo: 'Thông tin',
      searchPlaceholder: 'Nhập tên nhà thờ, địa chỉ...',
      noResults: 'Không tìm thấy nhà thờ phù hợp.',
      showAll: 'Hiện tất cả',
      results: 'Kết quả',
      findingLocation: 'Đang tìm vị trí của bạn...',
      next2Hours: 'Trong 2 giờ',
      today: 'Hôm nay',
      thisEvening: 'Tối nay',
      startSearchPrompt: 'Chọn một tiêu chí để bắt đầu tìm kiếm.',
    },
    churchDetail: {
      getDirections: 'Chỉ đường',
      massTimes: 'Giờ Lễ',
      announcements: 'Thông Báo',
      noAnnouncements: 'Không có thông báo mới.',
      backToResults: 'Quay lại kết quả',
      suggestEdit: 'Đề xuất chỉnh sửa',
      suggestEditNotice: 'Chức năng này đang được phát triển. Cảm ơn bạn đã đóng góp!',
      viewMoreMedia: 'Xem thêm hình ảnh/video',
      imageTitle: 'Hình Ảnh',
      addFacadeImage: 'Thêm ảnh mặt tiền nhà thờ',
      mediaGallery: 'Thư viện Hình ảnh & Video',
      noMedia: 'Chưa có hình ảnh hoặc video nào.',
    },
    map: {
      updatedChurches: 'Đã cập nhật {count} nhà thờ',
    },
    admin: {
      title: 'Quản lý Nhà thờ',
      add: 'Thêm',
      import: 'Nhập dữ liệu',
      edit: 'Sửa',
      delete: 'Xóa',
      loading: 'Đang tải danh sách nhà thờ...',
      accessDenied: 'Truy cập bị từ chối.',
      actionNotice: 'Chức năng đang được phát triển.',
      searchPlaceholder: 'Tìm kiếm theo tên, địa chỉ, giáo phận...',
      total: 'Tổng số',
      page: 'Trang',
      churchName: 'Tên Nhà thờ',
      address: 'Địa chỉ',
      diocese: 'Giáo phận',
      churchDetails: 'Chi tiết Nhà thờ',
      newChurch: 'Thêm Nhà thờ mới',
      save: 'Lưu',
      saving: 'Đang lưu...',
      deleting: 'Đang xóa...',
      confirmDeleteTitle: 'Xác nhận Xóa',
      confirmDeleteMessage: 'Bạn có chắc chắn muốn xóa nhà thờ này không? Hành động này không thể hoàn tác.',
      information: 'Thông tin chung',
      phone: 'Số điện thoại',
      announcements: 'Thông báo (mỗi dòng một thông báo)',
      massTimes: 'Giờ lễ',
      weekdays: 'Ngày thường',
      saturday: 'Thứ Bảy',
      sunday: 'Chúa Nhật',
      location: 'Vị trí trên bản đồ',
      mediaManagement: 'Quản lý Hình ảnh/Video',
      uploadMedia: 'Tải lên',
      enterMediaUrl: 'Nhập URL của hình ảnh hoặc video',
      confirmDeleteMediaTitle: 'Xác nhận Xóa Media',
      confirmDeleteMediaMessage: 'Bạn có chắc muốn xóa mục này không?',
      importTitle: 'Nhập Dữ liệu Nhà thờ',
      importInstructions: 'Tải lên tệp JSON chứa một mảng các đối tượng nhà thờ. Dữ liệu trong tệp phải khớp với cấu trúc sau:',
      importSelectFile: 'Chọn tệp JSON',
      importSelectedFile: 'Tệp đã chọn:',
      importButton: 'Bắt đầu Nhập',
      importing: 'Đang nhập...',
      importSuccess: 'Đã nhập thành công {count} nhà thờ!',
      importError: 'Lỗi: {error}',
      importErrorInvalidJson: 'Định dạng JSON không hợp lệ.',
      importErrorNoFile: 'Vui lòng chọn một tệp.',
      addMedia: 'Thêm Media',
      mediaUrl: 'URL của Media',
      cancel: 'Hủy',
      mediaPreview: 'Xem trước',
      invalidUrl: 'URL không hợp lệ hoặc không phải hình ảnh'
    },
    apiSettings: {
      title: 'Cài đặt Kết nối API',
      label: 'URL Gốc của Backend API',
      placeholder: 'https://service-name-hash.region.run.app',
      helpText: 'Nhập URL của dịch vụ Cloud Run của bạn. Nếu để trống, ứng dụng sẽ dùng dữ liệu giả lập.',
      save: 'Lưu Cài đặt',
      saveSuccess: 'Đã lưu cài đặt!',
      saveError: 'Lưu cài đặt thất bại.',
      appBackendTitle: 'API Backend Ứng dụng',
      gcsTitle: 'Lưu trữ Google Cloud Storage',
      gcsDescription: 'Cấu hình để cho phép Super Admin tải lên hình ảnh/video trực tiếp từ máy tính.',
      gcsBucketName: 'Tên Bucket',
      gcsBucketNamePlaceholder: 'ví dụ: churchgo-media-prod',
      gcsServiceAccountKey: 'Khóa Dịch vụ (Nội dung tệp JSON)',
      gcsServiceAccountKeyPlaceholder: 'Dán toàn bộ nội dung của tệp JSON khóa dịch vụ vào đây',
      saveGcsSettings: 'Lưu Cài đặt Storage',
      googleTitle: 'Tích hợp Google API',
      googleDescription: 'Kết nối với các dịch vụ của Google để đăng ký, nhập dữ liệu và quản lý hạn ngạch.',
      googleApiKey: 'Khóa API của Google (Google API Key)',
      googleApiKeyPlaceholder: 'dán khóa API của bạn vào đây',
      googleClientId: 'ID Khách hàng OAuth 2.0 (Client ID)',
      googleClientIdPlaceholder: 'dán ID khách hàng của bạn vào đây',
      status: 'Trạng thái',
      statusNotConnected: 'Chưa kết nối',
      statusConnected: 'Đã kết nối',
      comingSoon: 'Sắp ra mắt',
      quotas: 'Quản lý Hạn ngạch',
      dataImport: 'Nhập dữ liệu từ Google',
      saveGoogleSettings: 'Lưu Cài đặt Google',
      nextSteps: 'Các bước tiếp theo',
      appStatusTitle: 'Trạng thái Hoạt động',
      appVersion: 'Phiên bản',
      apiMode: 'Nguồn Dữ liệu',
      apiModeLive: 'LIVE API',
      apiModeMock: 'DỮ LIỆU MẪU',
      apiModeFallback: 'DỰ PHÒNG (NGOẠI TUYẾN)'
    },
    api: {
      fallbackWarning: 'Mất kết nối API. Đang hiển thị dữ liệu ngoại tuyến.'
    }
  },
  en: {
    topNav: {
      account: 'Account',
      settings: 'Settings',
      history: 'History',
      manageChurches: 'Manage Churches',
      apiSettings: 'API Settings',
      appInfo: 'App Info',
    },
    account: {
      title: 'Account',
      header: 'Login/Register',
      login: 'Login',
      or: 'or',
      registerGoogle: 'Register with Google',
      registerPhone: 'Register with Phone',
      loginAsAdmin: 'Login as Super Admin',
      welcomeAdmin: 'Welcome Admin!',
      logout: 'Logout',
    },
    settings: {
      title: 'Settings',
      updating: 'Coming soon',
    },
    history: {
      title: 'History',
      updating: 'Coming soon',
    },
    appInfo: {
      title: 'Application Info',
      version: 'Version {version}',
      copyright: '© 2024 ChurchGo. All rights reserved.',
    },
    languageSelector: {
      title: 'Language'
    },
    mainActionPanel: {
      findChurch: 'Find a Church',
    },
    searchContainer: {
      byDistance: 'Distance',
      byMassTime: 'Mass Time',
      byInfo: 'Information',
      searchPlaceholder: 'Enter church name, address...',
      noResults: 'No matching churches found.',
      showAll: 'Show All',
      results: 'Results',
      findingLocation: 'Finding your location...',
      next2Hours: 'Next 2 hours',
      today: 'Today',
      thisEvening: 'This Evening',
      startSearchPrompt: 'Select a criteria to start searching.',
    },
    churchDetail: {
      getDirections: 'Get Directions',
      massTimes: 'Mass Times',
      announcements: 'Announcements',
      noAnnouncements: 'No recent announcements.',
      backToResults: 'Back to results',
      suggestEdit: 'Suggest an Edit',
      suggestEditNotice: 'This feature is under development. Thank you for your contribution!',
      viewMoreMedia: 'View more photos/videos',
      imageTitle: 'Image',
      addFacadeImage: 'Add church facade image',
      mediaGallery: 'Image & Video Gallery',
      noMedia: 'No images or videos available.',
    },
    map: {
      updatedChurches: 'Updated {count} churches',
    },
    admin: {
      title: 'Church Management',
      add: 'Add',
      import: 'Import',
      edit: 'Edit',
      delete: 'Delete',
      loading: 'Loading church list...',
      accessDenied: 'Access Denied.',
      actionNotice: 'Feature is under development.',
      searchPlaceholder: 'Search by name, address, diocese...',
      total: 'Total',
      page: 'Page',
      churchName: 'Church Name',
      address: 'Address',
      diocese: 'Diocese',
      churchDetails: 'Church Details',
      newChurch: 'Add New Church',
      save: 'Save',
      saving: 'Saving...',
      deleting: 'Deleting...',
      confirmDeleteTitle: 'Confirm Deletion',
      confirmDeleteMessage: 'Are you sure you want to delete this church? This action cannot be undone.',
      information: 'General Information',
      phone: 'Phone Number',
      announcements: 'Announcements (one per line)',
      massTimes: 'Mass Times',
      weekdays: 'Weekdays',
      saturday: 'Saturday',
      sunday: 'Sunday',
      location: 'Location on Map',
      mediaManagement: 'Media Management',
      uploadMedia: 'Upload',
      enterMediaUrl: 'Enter the URL for the image or video',
      confirmDeleteMediaTitle: 'Confirm Media Deletion',
      confirmDeleteMediaMessage: 'Are you sure you want to delete this item?',
      importTitle: 'Import Church Data',
      importInstructions: 'Upload a JSON file containing an array of church objects. The data in the file must match the following structure:',
      importSelectFile: 'Select JSON file',
      importSelectedFile: 'Selected file:',
      importButton: 'Start Import',
      importing: 'Importing...',
      importSuccess: 'Successfully imported {count} churches!',
      importError: 'Error: {error}',
      importErrorInvalidJson: 'Invalid JSON format.',
      importErrorNoFile: 'Please select a file.',
      addMedia: 'Add Media',
      mediaUrl: 'Media URL',
      cancel: 'Cancel',
      mediaPreview: 'Preview',
      invalidUrl: 'Invalid URL or not an image'
    },
    apiSettings: {
      title: 'API Connection Settings',
      label: 'Backend API Base URL',
      placeholder: 'https://service-name-hash.region.run.app',
      helpText: 'Enter the URL of your Cloud Run service. If empty, the app will use mock data.',
      save: 'Save Settings',
      saveSuccess: 'Settings saved!',
      saveError: 'Failed to save settings.',
      appBackendTitle: 'Application Backend API',
      gcsTitle: 'Google Cloud Storage',
      gcsDescription: 'Configure to allow Super Admins to upload images/videos directly from their computer.',
      gcsBucketName: 'Bucket Name',
      gcsBucketNamePlaceholder: 'e.g., churchgo-media-prod',
      gcsServiceAccountKey: 'Service Account Key (JSON file content)',
      gcsServiceAccountKeyPlaceholder: 'Paste the entire content of the service account key JSON file here',
      saveGcsSettings: 'Save Storage Settings',
      googleTitle: 'Google API Integration',
      googleDescription: 'Connect to Google services for registration, data import, and quota management.',
      googleApiKey: 'Google API Key',
      googleApiKeyPlaceholder: 'paste your API key here',
      googleClientId: 'OAuth 2.0 Client ID',
      googleClientIdPlaceholder: 'paste your client ID here',
      status: 'Status',
      statusNotConnected: 'Not Connected',
      statusConnected: 'Connected',
      comingSoon: 'Coming Soon',
      quotas: 'Manage Quotas',
      dataImport: 'Import Data from Google',
      saveGoogleSettings: 'Save Google Settings',
      nextSteps: 'Next Steps',
      appStatusTitle: 'Application Status',
      appVersion: 'Version',
      apiMode: 'Data Source',
      apiModeLive: 'LIVE API',
      apiModeMock: 'MOCK DATA',
      apiModeFallback: 'FALLBACK (OFFLINE)'
    },
    api: {
      fallbackWarning: 'API connection lost. Displaying offline data.'
    }
  }
};

// 3. I18n Context and Provider
interface I18nContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getInitialLang = (): string => {
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('app-lang');
    // If a language is saved in local storage, use it.
    if (storedLang && supportedLangs.includes(storedLang)) {
      return storedLang;
    }
  }
  // Otherwise, default to Vietnamese.
  return defaultLang;
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<string>(getInitialLang);

  useEffect(() => {
    localStorage.setItem('app-lang', lang);
  }, [lang]);

  const setLang = (newLang: string) => {
    if (supportedLangs.includes(newLang)) {
      setLangState(newLang);
    }
  };

  const t = useCallback((key: string, params: Record<string, string | number> = {}): string => {
    const keys = key.split('.');
    let result: any = translations[lang as keyof typeof translations] || translations[defaultLang as keyof typeof translations];
    
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations['en' as keyof typeof translations];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        if (typeof fallbackResult !== 'string') return key;
        result = fallbackResult;
        break; // Found fallback, no need to continue loop
      }
    }

    if (typeof result !== 'string') return key;

    // Replace placeholders like {count}
    return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(`{${paramKey}}`, String(paramValue));
    }, result);

  }, [lang]);

  // FIX: Replaced JSX with React.createElement to resolve parsing errors in this .ts file,
  // which was not being treated as a TSX file by the compiler.
  return React.createElement(I18nContext.Provider, { value: { lang, setLang, t } }, children);
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
