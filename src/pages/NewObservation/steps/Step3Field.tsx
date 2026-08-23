import React from 'react';
import { useDraftStore } from '../../../store/useDraftStore';
import { Input } from '../../../components/ui/Input';
import { Radio } from '../../../components/ui/Radio';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { MapPin } from 'lucide-react';

const ARRIVAL_METHODS = ['GPS', 'Harita', 'Adres tarif edildi', 'Telefonla soruldu', 'Diğer'];

export default function Step3Field() {
  const { currentDraft, updateField, updateOtherField } = useDraftStore();

  if (!currentDraft) return null;

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          updateField('locationCoordinates', { lat, lng });
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            if (data && data.display_name) {
              updateField('location', data.display_name);
            }
          } catch (e) {
            console.error('Adres çözümlenemedi:', e);
          }
        },
        (error) => {
          alert('Konum alınamadı: ' + error.message);
        }
      );
    } else {
      alert('Tarayıcınız konum özelliğini desteklemiyor.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Sahaya Çıkış</h2>
        <p className="text-gray-500">Ekibin olay yerine ulaşım sürecini gözlemleyin.</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 ml-1">Konuma nasıl ulaşıldı?</label>
        <div className="flex flex-wrap gap-2">
          {ARRIVAL_METHODS.map(method => (
            <Radio
              key={method}
              label={method}
              name="arrivalMethod"
              checked={currentDraft.arrivalMethod === method}
              onChange={() => updateField('arrivalMethod', method)}
            />
          ))}
        </div>
        {currentDraft.arrivalMethod === 'Diğer' && (
          <Input
            placeholder="Lütfen belirtin..."
            value={currentDraft.otherFields?.arrivalMethod || ''}
            onChange={(e) => updateOtherField('arrivalMethod', e.target.value)}
          />
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 ml-1">Konum</label>
        <Input
          placeholder="Açık adres veya mekan adı"
          value={currentDraft.location || ''}
          onChange={(e) => updateField('location', e.target.value)}
        />
        <Button 
          variant={currentDraft.locationCoordinates ? "secondary" : "outline"} 
          className="w-full flex justify-center items-center gap-2"
          onClick={handleGetLocation}
        >
          <MapPin size={20} className={currentDraft.locationCoordinates ? "text-green-600" : "text-gray-500"} />
          {currentDraft.locationCoordinates ? 'Konum Kaydedildi (Güncelle)' : 'Mevcut GPS Konumumu Kaydet'}
        </Button>
        {currentDraft.locationCoordinates && (
          <p className="text-xs text-gray-500 text-center">
            {currentDraft.locationCoordinates.lat.toFixed(6)}, {currentDraft.locationCoordinates.lng.toFixed(6)}
          </p>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 ml-1">Ulaşım aşamasında problem yaşandı mı?</label>
          <div className="flex flex-wrap gap-2">
            <Radio
              label="Hayır"
              name="arrivalProblem"
              checked={currentDraft.arrivalProblem === false}
              onChange={() => updateField('arrivalProblem', false)}
            />
            <Radio
              label="Evet"
              name="arrivalProblem"
              checked={currentDraft.arrivalProblem === true}
              onChange={() => updateField('arrivalProblem', true)}
            />
          </div>
        </div>

        {currentDraft.arrivalProblem && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <Textarea
              label="Problem Nedir?"
              placeholder="Örn: Yanlış adres verildi, ekip yolu bulamadı..."
              value={currentDraft.arrivalProblemDescription || ''}
              onChange={(e) => updateField('arrivalProblemDescription', e.target.value)}
            />
            <Input
              label="Tahmini Zaman Kaybı (Dakika)"
              type="number"
              min="0"
              value={currentDraft.arrivalProblemTimeLoss || ''}
              onChange={(e) => updateField('arrivalProblemTimeLoss', parseInt(e.target.value) || 0)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
