
import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Church } from '../App';
import { useI18n } from '../lib/i18n';
import { FiX, FiNavigation, FiEdit, FiChevronUp, FiChevronDown, FiMapPin, FiCamera, FiChevronLeft, FiChevronRight, FiVideo } from 'react-icons/fi';
import { FaRegClock, FaRegListAlt } from "react-icons/fa";

// Leaflet's default icon path issue fix
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;


interface ChurchDetailPanelProps {
  church: Church;
  userPosition: L.LatLng | null;
  onClose: () => void;
}

const InfoField: React.FC<{ label: string, value: string, isTextArea?: boolean }> = ({ label, value, isTextArea = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <div className={`w-full p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 break-words ${isTextArea ? 'min-h-[80px] whitespace-pre-wrap' : ''}`}>
            {value || '-'}
        </div>
    </div>
);

const Section: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">{icon} {title}</h2>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isOpen && <div className="mt-4 space-y-4">{children}</div>}
        </div>
    );
};

const StaticMap: React.FC<{ position: [number, number] }> = ({ position }) => {
    const MapSetter = () => {
        const map = useMap();
        map.setView(position, 15);
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        if (map.tap) map.tap.disable();
        return null;
    };
    return (
         <div className="h-48 w-full rounded-lg overflow-hidden border border-gray-300">
            <MapContainer center={position} zoom={15} className="h-full w-full" zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                <Marker position={position} />
                <MapSetter />
            </MapContainer>
        </div>
    );
};


const ChurchDetailPanel: React.FC<ChurchDetailPanelProps> = ({ church, userPosition, onClose }) => {
  const { t } = useI18n();
  const [imageError, setImageError] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  const hasMedia = church.media && church.media.length > 0;
  const currentMedia = hasMedia ? church.media[currentMediaIndex] : null;

  useEffect(() => {
    setImageError(false);
    setCurrentMediaIndex(0);
  }, [church.id]);

  useEffect(() => {
    setImageError(false);
  }, [currentMediaIndex]);


  const handleGetDirections = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const mapsUrl = isIOS
      ? `http://maps.apple.com/?daddr=${church.lat},${church.lng}&dirflg=d`
      // eslint-disable-next-line max-len
      : `https://www.google.com/maps/dir/?api=1&destination=${church.lat},${church.lng}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };
  
  const handleSuggestAction = () => {
      alert(t('churchDetail.suggestEditNotice'));
  };
  
  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMedia) return;
    setCurrentMediaIndex(prev => (prev === 0 ? church.media.length - 1 : prev - 1));
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMedia) return;
    setCurrentMediaIndex(prev => (prev === church.media.length - 1 ? 0 : prev + 1));
  };


  return (
    <div
      className="fixed inset-0 bg-black/40 z-[4000] flex items-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full bg-gray-50 rounded-t-3xl shadow-2xl animate-slide-up flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-3 flex items-center justify-between border-b bg-white rounded-t-3xl">
          <div className="w-8"></div>
          <h2 className="text-lg font-bold text-gray-800 text-center">{church.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <FiX className="w-5 h-5 text-gray-600"/>
          </button>
        </header>

        <div className="p-3 flex-grow overflow-y-auto space-y-3">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
                 <InfoField label={t('admin.address')} value={church.address} />
                 <InfoField label={t('admin.diocese')} value={church.diocese} />
                 <InfoField label={t('admin.phone')} value={church.phone} />
                 <InfoField label={t('admin.announcements')} value={Array.isArray(church.announcements) ? church.announcements.join('\n') : ''} isTextArea={true} />
            </div>

            <Section title={t('admin.massTimes')} icon={<FaRegClock className="text-teal-600"/>} defaultOpen={true}>
                <InfoField label={t('admin.weekdays')} value={church.massTimes.weekdays} />
                <InfoField label={t('admin.saturday')} value={church.massTimes.saturday} />
                <InfoField label={t('admin.sunday')} value={church.massTimes.sunday} />
            </Section>
            
            <Section title={t('admin.location')} icon={<FiMapPin className="text-teal-600"/>} defaultOpen={true}>
                <div className="flex justify-end">
                    <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                        {church.lat.toFixed(6)}, {church.lng.toFixed(6)}
                    </div>
                </div>
                <StaticMap position={[church.lat, church.lng]} />
            </Section>
            
            <Section title={t('churchDetail.mediaGallery')} icon={<FiCamera className="text-teal-600"/>} defaultOpen={true}>
                <div className="relative group h-48 w-full">
                  {hasMedia && currentMedia ? (
                      <>
                        {currentMedia.type === 'image' && !imageError ? (
                           <img 
                              src={currentMedia.url} 
                              alt={`Hình ảnh ${church.name} ${currentMediaIndex + 1}`} 
                              className="w-full h-full object-cover rounded-xl shadow-md bg-gray-200"
                              onError={() => setImageError(true)}
                              key={currentMedia.id}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 rounded-xl text-gray-500">
                             <FiVideo className="w-10 h-10 mb-2"/>
                             <span>{imageError ? t('admin.invalidUrl') : 'Video'}</span>
                          </div>
                        )}
                        
                        {church.media.length > 1 && (
                            <>
                              <button onClick={handlePrevMedia} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none">
                                <FiChevronLeft />
                              </button>
                              <button onClick={handleNextMedia} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none">
                                <FiChevronRight />
                              </button>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 p-1 rounded-full">
                                {church.media.map((_, index) => (
                                  <div key={index} className={`w-1.5 h-1.5 rounded-full transition-colors ${index === currentMediaIndex ? 'bg-white' : 'bg-white/50'}`} />
                                ))}
                              </div>
                            </>
                        )}
                      </>
                  ) : (
                      <button
                          onClick={handleSuggestAction}
                          className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:border-teal-500 hover:bg-teal-50/50 transition-colors"
                      >
                          <FiCamera className="mx-auto h-8 w-8 mb-2" />
                          <span className="font-semibold">{t('churchDetail.noMedia')}</span>
                      </button>
                  )}
                </div>
            </Section>
        </div>

        <footer className="p-4 bg-white border-t flex-shrink-0 grid grid-cols-2 gap-3">
             <button
                onClick={handleSuggestAction}
                className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors"
            >
                <FiEdit />
                <span>{t('churchDetail.suggestEdit')}</span>
            </button>
             <button
                onClick={handleGetDirections}
                className="w-full flex items-center justify-center gap-2 bg-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:bg-teal-600 transition-transform transform hover:scale-105"
            >
                <FiNavigation />
                <span>{t('churchDetail.getDirections')}</span>
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ChurchDetailPanel;