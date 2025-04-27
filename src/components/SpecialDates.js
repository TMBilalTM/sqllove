import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaBell, FaBellSlash, FaCheck, FaTimes } from 'react-icons/fa';
import { getSpecialDates, addSpecialDate, updateSpecialDate, deleteSpecialDate } from '../lib/api';

export default function SpecialDates() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [specialDates, setSpecialDates] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    reminder_days: 7,
    is_recurring: true,
    notification_enabled: true
  });

  // Özel günleri yükle
  useEffect(() => {
    loadSpecialDates();
  }, []);

  const loadSpecialDates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSpecialDates();
      
      if (response.success) {
        setSpecialDates(response.special_dates || []);
        setUpcomingReminders(response.upcoming_reminders || []);
      } else {
        setError(response.message || 'Özel günler yüklenemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Form verilerini değiştir
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Düzenleme modunu aç
  const handleEdit = (date) => {
    setEditingId(date.id);
    setFormData({
      title: date.title,
      date: date.date,
      description: date.description || '',
      reminder_days: date.reminder_days,
      is_recurring: Boolean(date.is_recurring),
      notification_enabled: Boolean(date.notification_enabled),
      id: date.id
    });
    setShowAddForm(true);
  };

  // Özel gün sil
  const handleDelete = async (id) => {
    if (!window.confirm('Bu özel günü silmek istediğinizden emin misiniz?')) return;
    
    try {
      setError(null);
      const response = await deleteSpecialDate(id);
      
      if (response.success) {
        await loadSpecialDates();
      } else {
        setError(response.message || 'Özel gün silinemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      console.error(err);
    }
  };

  // Form gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (editingId) {
        response = await updateSpecialDate(formData);
      } else {
        response = await addSpecialDate(formData);
      }
      
      if (response.success) {
        setShowAddForm(false);
        setEditingId(null);
        setFormData({
          title: '',
          date: '',
          description: '',
          reminder_days: 7,
          is_recurring: true,
          notification_enabled: true
        });
        await loadSpecialDates();
      } else {
        setError(response.message || 'Özel gün kaydedilemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Bildirim durumunu güncelle
  const toggleNotification = async (date) => {
    try {
      const updatedDate = {
        ...date,
        notification_enabled: !date.notification_enabled
      };
      
      const response = await updateSpecialDate(updatedDate);
      
      if (response.success) {
        await loadSpecialDates();
      } else {
        setError(response.message || 'Bildirim durumu güncellenemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      console.error(err);
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <div className="love-card bg-white dark:bg-gray-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaCalendarAlt className="text-primary" /> Özel Günler
        </h2>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)} 
            className="btn-love px-4 py-2 flex items-center gap-2 text-sm"
          >
            <FaPlus /> Yeni Ekle
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-xl text-sm border-l-4 border-red-500">
          {error}
        </div>
      )}
      
      {/* Yaklaşan hatırlatmalar */}
      {upcomingReminders.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Yaklaşan Hatırlatmalar</h3>
          <div className="space-y-3">
            {upcomingReminders.map(reminder => (
              <div 
                key={`reminder-${reminder.id}`} 
                className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 rounded-r-lg flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{reminder.title}</div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-1">
                    <FaCalendarAlt />{' '}
                    {reminder.days_remaining === 0
                      ? 'Bugün!'
                      : reminder.days_remaining === 1
                      ? 'Yarın!'
                      : `${reminder.days_remaining} gün kaldı`}
                    {' - '}{formatDate(reminder.next_occurrence)}
                  </div>
                </div>
                
                <button
                  onClick={() => toggleNotification(reminder)}
                  className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-600 p-2"
                  title={reminder.notification_enabled ? 'Bildirimi kapat' : 'Bildirimi aç'}
                >
                  {reminder.notification_enabled ? <FaBell /> : <FaBellSlash />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Ekleme/düzenleme formu */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
          <h3 className="text-lg font-medium mb-3">
            {editingId ? 'Özel Gün Düzenle' : 'Yeni Özel Gün Ekle'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Başlık
              </label>
              <div className="input-icon-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="love-input with-icon pl-10 w-full"
                  placeholder="Örn: Doğum Günü, Yıldönümü"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-1">
                Tarih
              </label>
              <div className="input-icon-wrapper">
                <FaCalendarAlt className="input-icon" />
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="love-input with-icon pl-10 w-full"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Açıklama (İsteğe Bağlı)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="love-input w-full"
                rows="3"
                placeholder="Bu özel gün hakkında notlar..."
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="reminder_days" className="block text-sm font-medium mb-1">
                Kaç Gün Önceden Hatırlatılsın?
              </label>
              <input
                id="reminder_days"
                name="reminder_days"
                type="number"
                min="1"
                max="30"
                value={formData.reminder_days}
                onChange={handleChange}
                className="love-input w-full"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="is_recurring"
                name="is_recurring"
                type="checkbox"
                checked={formData.is_recurring}
                onChange={handleChange}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <label htmlFor="is_recurring" className="ml-2 text-sm">
                Her yıl tekrarlansın
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="notification_enabled"
                name="notification_enabled"
                type="checkbox"
                checked={formData.notification_enabled}
                onChange={handleChange}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <label htmlFor="notification_enabled" className="ml-2 text-sm">
                Bildirim gönderilsin
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({
                  title: '',
                  date: '',
                  description: '',
                  reminder_days: 7,
                  is_recurring: true,
                  notification_enabled: true
                });
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              İptal
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-love px-4 py-2"
            >
              {loading ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      )}
      
      {/* Özel günler listesi */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center">
              <div className="bg-gray-200 dark:bg-gray-700 h-12 w-12 rounded-full"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : specialDates.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FaCalendarAlt className="text-3xl mx-auto mb-3 opacity-50" />
          <p>Henüz özel gün eklenmemiş.</p>
          <p className="text-sm">Doğum günleri, yıldönümleri veya diğer önemli günleri ekleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {specialDates.map(date => (
            <div 
              key={date.id} 
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{date.title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <FaCalendarAlt /> {formatDate(date.date)}
                  {date.is_recurring && ' (Her yıl)'}
                </div>
                {date.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {date.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleNotification(date)}
                  className={`p-2 ${
                    date.notification_enabled 
                      ? 'text-primary hover:text-primary-dark' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title={date.notification_enabled ? 'Bildirimi kapat' : 'Bildirimi aç'}
                >
                  {date.notification_enabled ? <FaBell /> : <FaBellSlash />}
                </button>
                
                <button
                  onClick={() => handleEdit(date)}
                  className="p-2 text-blue-500 hover:text-blue-600"
                  title="Düzenle"
                >
                  <FaEdit />
                </button>
                
                <button
                  onClick={() => handleDelete(date.id)}
                  className="p-2 text-red-500 hover:text-red-600"
                  title="Sil"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
