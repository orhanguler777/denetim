import React, { useRef, useState } from 'react';
import { useDraftStore } from '../../../store/useDraftStore';
import { Radio } from '../../../components/ui/Radio';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Textarea } from '../../../components/ui/Textarea';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { db } from '../../../db/db';

const SAVED_LOCATIONS = ['Telefon', 'WhatsApp', 'Sistem', 'Galeri', 'Diğer'];
const YES_NO_UNKNOWN = ['Evet', 'Hayır', 'Bilmiyorum'];
const OTHER_EVIDENCE = ['Belge', 'Video', 'Ses kaydı', 'Tanık bilgisi', 'Diğer'];

export default function Step5Evidence() {
  const { currentDraft, updateField, updateOtherField } = useDraftStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoAdded, setPhotoAdded] = useState(false);

  if (!currentDraft) return null;

  const handleEvidenceToggle = (item: string) => {
    const current = currentDraft.otherEvidence || [];
    if (current.includes(item)) {
      updateField('otherEvidence', current.filter(i => i !== item));
    } else {
      updateField('otherEvidence', [...current, item]);
    }
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // In a real scenario, you'd save this to IndexedDB Photos table as base64 or blob.
      // For this demo, we just increment the count and simulate saving.
      const currentCount = currentDraft.photoCount || 0;
      updateField('photoCount', currentCount + 1);
      updateField('hasPhotos', true);
      setPhotoAdded(true);
      setTimeout(() => setPhotoAdded(false), 3000);

      // Store to DB (Demo)
      await db.photos.add({
        id: crypto.randomUUID(),
        observationId: currentDraft.id,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Fotoğraf ve Kanıt</h2>
        <p className="text-gray-500">Saha denetiminde toplanan görsel ve fiziksel kanıtları kaydedin.</p>
      </div>

      <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-6 text-center space-y-4">
        <div className="text-blue-800 font-medium">Saha uygulamasından fotoğraf çekimi testi:</div>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={fileInputRef}
          onChange={handlePhotoCapture}
        />
        <div className="flex gap-4 justify-center">
          <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600">
            <Camera size={24} className="mr-2" />
            Kamera
          </Button>
        </div>
        {photoAdded && <p className="text-green-600 font-bold animate-pulse">Fotoğraf başarıyla eklendi!</p>}
        <p className="text-xs text-blue-600/70">
          Not: Gerçek kişisel verileri çekmeyiniz. Fotoğraflar cihazda kalır.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900 ml-1">Fotoğraf çekildi mi?</label>
        <div className="flex flex-wrap gap-2">
          <Radio
            label="Hayır"
            name="hasPhotos"
            checked={currentDraft.hasPhotos === false}
            onChange={() => updateField('hasPhotos', false)}
          />
          <Radio
            label="Evet"
            name="hasPhotos"
            checked={currentDraft.hasPhotos === true}
            onChange={() => updateField('hasPhotos', true)}
          />
        </div>
      </div>

      {currentDraft.hasPhotos && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <Input
            label="Fotoğraf Sayısı"
            type="number"
            min="1"
            value={currentDraft.photoCount || ''}
            onChange={(e) => updateField('photoCount', parseInt(e.target.value) || 0)}
          />

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">Fotoğraflar nereye kaydediliyor?</label>
            <div className="flex flex-wrap gap-2">
              {SAVED_LOCATIONS.map(loc => (
                <Radio
                  key={loc}
                  label={loc}
                  name="photosWhereSaved"
                  checked={currentDraft.photosWhereSaved === loc}
                  onChange={() => updateField('photosWhereSaved', loc)}
                />
              ))}
            </div>
            {currentDraft.photosWhereSaved === 'Diğer' && (
              <Input
                placeholder="Lütfen belirtin..."
                value={currentDraft.otherFields?.photosWhereSaved || ''}
                onChange={(e) => updateOtherField('photosWhereSaved', e.target.value)}
              />
            )}
          </div>

          <Textarea
            label="Fotoğraf hangi işlemle eşleştiriliyor?"
            placeholder="Örn: Tutanak numarası ile sisteme yükleniyor..."
            value={currentDraft.photoProcessMatching || ''}
            onChange={(e) => updateField('photoProcessMatching', e.target.value)}
          />

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">Fotoğrafta tarih / saat / konum önemli mi?</label>
            <div className="flex flex-wrap gap-2">
              {YES_NO_UNKNOWN.map(ans => (
                <Radio
                  key={ans}
                  label={ans}
                  name="photoLocationImportant"
                  checked={currentDraft.photoLocationImportant === ans}
                  onChange={() => updateField('photoLocationImportant', ans)}
                  className="px-2 py-3 justify-center text-center text-base"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 ml-1">Diğer Kanıtlar</label>
        <div className="flex flex-wrap gap-2">
          {OTHER_EVIDENCE.map(item => (
            <Checkbox
              key={item}
              label={item}
              checked={(currentDraft.otherEvidence || []).includes(item)}
              onChange={() => handleEvidenceToggle(item)}
            />
          ))}
        </div>
        {(currentDraft.otherEvidence || []).includes('Diğer') && (
          <Input
            placeholder="Lütfen belirtin..."
            value={currentDraft.otherFields?.otherEvidence || ''}
            onChange={(e) => updateOtherField('otherEvidence', e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
