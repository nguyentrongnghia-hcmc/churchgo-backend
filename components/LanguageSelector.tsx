
import React, { useState } from 'react';
import { useI18n, languages } from '../lib/i18n';

const LanguageSelector: React.FC = () => {
  const { lang, setLang, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages[lang];

  const handleLanguageSelect = (langCode: string) => {
    setLang(langCode);
    setIsOpen(false);
  };

  const highlightColor = '#8d1c1c';

  return (
    <>
      <div className="absolute top-6 right-6 z-[1000]">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="Select language"
        >
          <img 
            src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/7.2.1/flags/4x3/${currentLang.countryCode}.svg`}
            alt={`${currentLang.name} flag`}
            className="w-6 rounded-sm"
          />
          <span className="font-semibold text-gray-800">{lang.toUpperCase()}</span>
        </button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[5000] flex items-end"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-modal-title"
        >
          <div 
            className="w-full max-w-lg rounded-t-3xl pt-2 pb-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#F9F6F2' }}
          >
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto my-2"></div>
            
            <h2 
              id="language-modal-title" 
              className="text-center text-xl font-bold mb-4"
              style={{ color: highlightColor }}
            >
              {t('languageSelector.title')}
            </h2>
            
            <ul className="px-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(languages).map(([code, langDetails], index, arr) => (
                <li key={code} className={index < arr.length - 1 ? 'border-b border-gray-200' : ''}>
                  <button
                    onClick={() => handleLanguageSelect(code)}
                    className="w-full flex items-center justify-between gap-3 py-4 text-lg text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors duration-150"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/7.2.1/flags/4x3/${langDetails.countryCode}.svg`}
                        alt={`${langDetails.name} flag`}
                        className="w-8 rounded"
                      />
                      <span>{langDetails.nativeName}</span>
                    </div>
                    {lang === code && (
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: highlightColor }}></div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default LanguageSelector;