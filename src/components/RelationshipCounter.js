import { useState, useEffect } from 'react';
import { FaHeart, FaCalendarAlt, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { getRelationshipInfo, updateRelationshipDate } from '../lib/api';

export default function RelationshipCounter({ onUpdate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relationship, setRelationship] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [saving, setSaving] = useState(false);

  // İlişki bilgilerini yükle
  useEffect(() => {
    const loadRelationshipInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getRelationshipInfo();
        
        if (response.success) {
          setRelationship(response.relationship);
          setStartDate(response.relationship.start_date);
        } else {
          setError(response.message || 'İlişki bilgileri alınamadı');
        }
      } catch (err) {
        setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadRelationshipInfo();
  }, []);
  
  // Başlangıç tarihini güncelle
  const handleUpdateDate = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await updateRelationshipDate(startDate);
      
      if (response.success) {
        setRelationship(response.relationship);
        setEditMode(false);
        if (onUpdate) onUpdate(response.relationship);
      } else {
        setError(response.message || 'Tarih güncellenirken bir hata oluştu');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // İlişkinin insan tarafından okunabilir süresini döndür
  const getReadableDuration = () => {
    if (!relationship || !relationship.duration) return '';
    
    const { years, months, days } = relationship.duration;
    
    const parts = [];
    if (years > 0) parts.push(`${years} yıl`);
    if (months > 0) parts.push(`${months} ay`);
    if (days > 0) parts.push(`${days} gün`);
    
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="love-card bg-white dark:bg-gray-800 p-6 text-center">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="love-card bg-white dark:bg-gray-800 p-6 text-center">
        <div className="text-red-500 mb-3">
          <FaTimes className="text-3xl mx-auto" />
        </div>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="love-card bg-white dark:bg-gray-800 p-6 text-center hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-center mb-3 relative">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <FaHeart className="text-primary text-xl" />
        </div>
        
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="absolute right-0 top-0 p-2 text-gray-400 hover:text-primary"
            title="Tarihi düzenle"
            aria-label="Tarihi düzenle"
          >
            <FaEdit />
          </button>
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-2">İlişki Süreniz</h3>
      
      {editMode ? (
        <div>
          <div className="mb-4">
            <label htmlFor="start-date" className="block text-sm mb-1 text-gray-500 dark:text-gray-400">
              İlişki başlangıç tarihiniz:
            </label>
            <div className="input-icon-wrapper">
              <FaCalendarAlt className="input-icon" />
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="love-input with-icon text-center mx-auto max-w-xs pl-10"
                disabled={saving}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleUpdateDate}
              disabled={saving}
              className="btn-love px-4 py-2 flex items-center gap-2"
            >
              {saving ? 'Kaydediliyor...' : <><FaCheck /> Kaydet</>}
            </button>
            
            <button
              onClick={() => {
                setStartDate(relationship.start_date);
                setEditMode(false);
              }}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center gap-2"
            >
              <FaTimes /> İptal
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-primary mb-1">
            {getReadableDuration() || 'Yeni başladı!'}
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mb-2">
            <FaCalendarAlt /> 
            <span>Başlangıç: {relationship?.start_date}</span>
          </div>

          <div className="text-gray-600 dark:text-gray-400 text-sm">
            {relationship?.duration?.total_days > 0 
              ? `Toplam ${relationship.duration.total_days} gün birliktesiniz`
              : 'İlişkiniz yeni başladı!'}
          </div>
        </>
      )}
    </div>
  );
}
