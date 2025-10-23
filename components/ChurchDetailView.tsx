
import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Added FiAlertCircle and FiX to imports
import { FiArrowLeft, FiSave, FiMapPin, FiTrash2, FiLoader, FiCamera, FiChevronUp, FiChevronDown, FiUpload, FiVideo, FiAlertCircle, FiX } from 'react-icons/fi';
import { FaRegClock } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useI18n } from '../lib/i18n';
import { Church, MediaItem } from '../App';

// Leaflet's default icon path issue fix
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;


interface ViewProps {
  church: Church;
  onBack: () => void;
  onSave: (church: Church) => Promise<void>;
  onDelete: (churchId: string) => Promise<void>;
}

const EditableMap: React.FC<{ position: [number, number], setPosition: (pos: [number, number]) => void }> = ({ position, setPosition }) => {
  const markerRef = useRef<L.Marker>(null);
  
  const DraggableMarker: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(position, 15);
    }, [position, map]);

    const eventHandlers = useMemo(() => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
        }
      },
    }), [setPosition]);

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
      />
    );
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-300">
      <MapContainer center={position} zoom={15} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <DraggableMarker />
      </MapContainer>
    </div>
  );
};


const ChurchDetailView: React.FC<ViewProps> = ({ church, onBack, onSave, onDelete }) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<Church>(church);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [mediaUrlError, setMediaUrlError] = useState(false);
  const isNew = church.id === 'new';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMassTimesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      massTimes: {
        ...prev.massTimes,
        [name]: value
      }
    }));
  };

  const handlePositionChange = (pos: [number, number]) => {
    setFormData(prev => ({ ...prev, lat: pos[0], lng: pos[1] }));
  };
  
  const handleSave = async () => {
    setIsSubmitting(true);
    await onSave(formData);
    // No need to set isSubmitting to false, as the component will unmount on success
  };
  
  const handleDelete = async () => {
    if (window.confirm(t('admin.confirmDeleteMessage'))) {
      setIsSubmitting(true);
      await onDelete(church.id);
    }
  };
  
  const handleOpenMediaModal = () => {
    setNewMediaUrl('');
    setMediaUrlError(false);
    setIsMediaModalOpen(true);
  };

  const handleConfirmAddMedia = () => {
    if (!newMediaUrl || mediaUrlError) return;

    const isVideo = ['.mp4', '.webm', '.ogg', '.mov'].some(ext => newMediaUrl.toLowerCase().includes(ext));
    const newItem: MediaItem = {
        id: `new_${Date.now()}`,
        url: newMediaUrl,
        type: isVideo ? 'video' : 'image'
    };
    setFormData(prev => ({ ...prev, media: [...(prev.media || []), newItem] }));
    setIsMediaModalOpen(false);
  };

  const handleDeleteMedia = (mediaId: string) => {
    if (window.confirm(t('admin.confirmDeleteMediaMessage'))) {
        setFormData(prev => ({
            ...prev,
            media: prev.media.filter(item => item.id !== mediaId)
        }));
    }
  };


  const FormField: React.FC<{ label: string; name: string; value: string; onChange: (e: any) => void; as?: 'textarea' }> = ({ label, name, value, onChange, as = 'input' }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      {as === 'textarea' ? (
        <textarea id={name} name={name} value={value} onChange={onChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" disabled={isSubmitting} />
      ) : (
        <input type="text" id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm" disabled={isSubmitting}/>
      )}
    </div>
  );
  
  const FormSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <button 
          type="button" 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-full flex justify-between items-center text-left"
          aria-expanded={isOpen}
        >
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-3">{icon} {title}</h2>
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {isOpen && (
          <div className="mt-4 space-y-4">
            {children}
          </div>
        )}
      </div>
    );
  };
  
  const MediaItemCard: React.FC<{ item: MediaItem, onDelete: (id: string) => void }> = ({ item, onDelete }) => {
    const [isError, setIsError] = useState(false);
    return (
        <div className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            {item.type === 'image' && !isError ? (
                <img 
                    src={item.url} 
                    alt="Media preview" 
                    className="w-full h-full object-cover" 
                    onError={() => setIsError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center text-gray-500">
                       {isError ? <FiAlertCircle className="w-8 h-8 mx-auto mb-1"/> : <FiVideo className="w-8 h-8 mx-auto mb-1"/>}
                       <span className="text-xs">{isError ? 'Invalid URL' : 'Video'}</span>
                    </div>
                </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                    onClick={() => onDelete(item.id)}
                    className="p-3 bg-red-600/80 text-white rounded-full hover:bg-red-600"
                    aria-label="Delete media"
                >
                    <FiTrash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
  };


  const headerTitle = isNew ? t('admin.newChurch') : `${t('admin.churchDetails')}: ${formData.name}`;

  return (
    <div className="h-full w-full bg-gray-50 z-[2000] absolute top-0 left-0 flex flex-col">
      <header className="p-3 md:p-4 flex items-center justify-between border-b bg-white flex-shrink-0 sticky top-0">
        <div className="flex items-center min-w-0">
          <button onClick={onBack} className="p-2 mr-2 md:mr-4 rounded-full hover:bg-gray-100" aria-label="Back to admin list" disabled={isSubmitting}>
            <FiArrowLeft className="h-6 w-6 text-gray-800" />
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate" title={headerTitle}>{headerTitle}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isNew && (
            <button onClick={handleDelete} disabled={isSubmitting} className="flex items-center gap-2 text-red-600 font-bold py-2 px-3 md:px-4 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <FiTrash2 />
              <span className="hidden md:inline">{isSubmitting ? t('admin.deleting') : t('admin.delete')}</span>
            </button>
          )}
          <button onClick={handleSave} disabled={isSubmitting} className="flex items-center gap-2 bg-teal-500 text-white font-bold py-2 px-3 md:px-4 rounded-lg shadow-md hover:bg-teal-600 disabled:bg-teal-400 disabled:cursor-not-allowed">
            {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSave />}
            <span>{isSubmitting ? t('admin.saving') : t('admin.save')}</span>
          </button>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto p-3">
        <div className="max-w-4xl mx-auto space-y-3">

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
              <FormField label={t('admin.churchName')} name="name" value={formData.name} onChange={handleInputChange} />
              <FormField label={t('admin.address')} name="address" value={formData.address} onChange={handleInputChange} />
              <FormField label={t('admin.diocese')} name="diocese" value={formData.diocese} onChange={handleInputChange} />
              <FormField label={t('admin.phone')} name="phone" value={formData.phone} onChange={handleInputChange} />
              <FormField label={t('admin.announcements')} name="announcements" value={Array.isArray(formData.announcements) ? formData.announcements.join('\n') : ''} onChange={(e) => setFormData(p => ({...p, announcements: e.target.value.split('\n')}))} as="textarea" />
            </div>

            <FormSection title={t('admin.massTimes')} icon={<FaRegClock className="text-teal-600 w-5 h-5"/>} defaultOpen={true}>
                <FormField label={t('admin.weekdays')} name="weekdays" value={formData.massTimes.weekdays} onChange={handleMassTimesChange} />
                <FormField label={t('admin.saturday')} name="saturday" value={formData.massTimes.saturday} onChange={handleMassTimesChange} />
                <FormField label={t('admin.sunday')} name="sunday" value={formData.massTimes.sunday} onChange={handleMassTimesChange} />
            </FormSection>

            <FormSection title={t('admin.location')} icon={<FiMapPin className="text-teal-600"/>} defaultOpen={true}>
                <div className="flex justify-end">
                    <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                        {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                    </div>
                </div>
                <div className="h-[400px]">
                    <EditableMap position={[formData.lat, formData.lng]} setPosition={handlePositionChange} />
                </div>
            </FormSection>

            <FormSection title={t('admin.mediaManagement')} icon={<FiCamera className="text-teal-600"/>} defaultOpen={true}>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {formData.media?.map(item => (
                       <MediaItemCard key={item.id} item={item} onDelete={handleDeleteMedia} />
                    ))}
                    <button
                        type="button"
                        onClick={handleOpenMediaModal}
                        className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:border-teal-500 hover:bg-teal-50/50 transition-colors"
                    >
                        <FiUpload className="mx-auto h-6 w-6 mb-1" />
                        <span className="text-xs font-semibold">{t('admin.uploadMedia')}</span>
                    </button>
                </div>
            </FormSection>

        </div>
      </main>
      
      {isMediaModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4" onClick={() => setIsMediaModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{t('admin.addMedia')}</h3>
              <button onClick={() => setIsMediaModalOpen(false)} className="p-1 rounded-full hover:bg-gray-100"><FiX /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700">{t('admin.mediaUrl')}</label>
                <input
                  type="text"
                  id="mediaUrl"
                  value={newMediaUrl}
                  onChange={(e) => {
                    setNewMediaUrl(e.target.value);
                    setMediaUrlError(false);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"
                />
              </div>
              {newMediaUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.mediaPreview')}</label>
                  <div className="mt-1 w-full aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden border">
                    {!mediaUrlError ? (
                      <img
                        src={newMediaUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={() => setMediaUrlError(true)}
                      />
                    ) : (
                      <span className="text-red-500 text-sm p-4 text-center">{t('admin.invalidUrl')}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
              <button onClick={() => setIsMediaModalOpen(false)} className="px-4 py-2 bg-gray-200 font-semibold text-gray-700 rounded-md hover:bg-gray-300">{t('admin.cancel')}</button>
              <button onClick={handleConfirmAddMedia} className="px-4 py-2 bg-teal-500 text-white font-bold rounded-md hover:bg-teal-600 disabled:bg-gray-300" disabled={!newMediaUrl || mediaUrlError}>{t('admin.add')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChurchDetailView;