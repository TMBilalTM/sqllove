import { useState, useEffect } from 'react';
import { FaHeart, FaCalendarAlt } from 'react-icons/fa';

export default function RelationshipTimer({ startDate, partnerName }) {
  const [duration, setDuration] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [showDetails, setShowDetails] = useState(false);
  
  // İlişki süresini hesapla
  useEffect(() => {
    if (!startDate) return;
    
    const relationshipStart = new Date(startDate);
    
    // İlişki başlangıç tarihinin geçerli olup olmadığını kontrol et
    if (isNaN(relationshipStart.getTime())) {
      // Varsayılan olarak şimdiden bir ay öncesini kullan
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() - 1);
      relationshipStart = defaultDate;
    }
    
    const timer = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - relationshipStart.getTime();
      
      // Farkı gün, saat, dakika ve saniyeye çevir
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setDuration({ days, hours, minutes, seconds });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startDate]);
  
  // İlişkinin ay sayısını hesapla
  const getMonths = () => {
    if (!startDate) return 0;
    
    const start = new Date(startDate);
    const now = new Date();
    
    let months = (now.getFullYear() - start.getFullYear()) * 12;
    months += now.getMonth() - start.getMonth();
    
    // Eğer bugün ayın başlangıcından daha önceyse 1 ay düş
    if (now.getDate() < start.getDate()) {
      months--;
    }
    
    return months > 0 ? months : 0;
  };
  
  // İnsan tarafından okunabilir formatta ilişki süresini döndür
  const getReadableDuration = () => {
    const months = getMonths();
    
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} yıl${years > 1 ? '' : ''} ${remainingMonths > 0 ? `${remainingMonths} ay` : ''}`;
    } else if (months > 0) {
      return `${months} ay`;
    } else if (duration.days > 0) {
      return `${duration.days} gün`;
    } else {
      return 'Bugün başladı';
    }
  };
  
  // İlişkinin tam tarihini formatlı olarak döndür
  const getFormattedStartDate = () => {
    if (!startDate) return '';
    
    const date = new Date(startDate);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="love-card bg-white dark:bg-gray-800 p-6 text-center hover:shadow-lg transition-all duration-300">
      <div 
        className="cursor-pointer" 
        onClick={() => setShowDetails(prev => !prev)}
      >
        <div className="flex items-center justify-center mb-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <FaHeart className="text-primary text-xl" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">İlişki Süreniz</h3>
        <div className="text-3xl font-bold text-primary mb-1">
          {getReadableDuration()}
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
          <FaCalendarAlt /> 
          <span>{getFormattedStartDate() || 'Tarih belirlenmedi'}</span>
        </div>
        
        {showDetails && (
          <div className="mt-5 grid grid-cols-4 gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold">{duration.days}</div>
              <div className="text-xs text-gray-500">gün</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{duration.hours}</div>
              <div className="text-xs text-gray-500">saat</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{duration.minutes}</div>
              <div className="text-xs text-gray-500">dakika</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{duration.seconds}</div>
              <div className="text-xs text-gray-500">saniye</div>
            </div>
          </div>
        )}
      </div>
      
      {partnerName && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">{partnerName}</span>
            <span className="mx-2 text-primary">❤️</span>
            <span className="text-gray-500 dark:text-gray-400">Siz</span>
          </div>
        </div>
      )}
    </div>
  );
}
