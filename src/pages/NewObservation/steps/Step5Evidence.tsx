import React, { useRef, useState, useEffect } from 'react';
import { useDraftStore } from '../../../store/useDraftStore';
import { Radio } from '../../../components/ui/Radio';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Textarea } from '../../../components/ui/Textarea';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Camera, Trash2, X, ZoomIn } from 'lucide-react';
import { db } from '../../../db/db';
import type { Photo } from '../../../types';

const SAVED_LOCATIONS = ['Telefon', 'WhatsApp', 'Sistem', 'Galeri', 'Diğer'];
const YES_NO_UNKNOWN = ['Evet', 'Hayır', 'Bilmiyorum'];
const OTHER_EVIDENCE = ['Belge', 'Video', 'Ses kaydı', 'Tanık bilgisi', 'Diğer'];

export default function Step5Evidence() {
  const { currentDraft, updateField, updateOtherField } = useDraftStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  if (!currentDraft) return null;

  // Load existing photos for this observation
  useEffect(() => {
    if (currentDraft?.id) {
      db.photos.where('observationId').equals(currentDraft.id).toArray().then(setPhotos);
    }
  }, [currentDraft?.id]);

  const handleEvidenceToggle = (item: string) => {
    const current = currentDraft.otherEvidence || [];
    if (current.includes(item)) {
      updateField('otherEvidence', current.filter(i => i !== item));
    } else {
      updateField('otherEvidence', [...current, item]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await fileToBase64(file);

        const newPhoto: Photo = {
          id: crypto.randomUUID(),
          observationId: currentDraft.id,
          timestamp: new Date().toISOString(),
          fileData: base64,
        };

        await db.photos.add(newPhoto);
        setPhotos(prev => [...prev, newPhoto]);
      }

      const newCount = (currentDraft.photoCount || 0) + files.length;
      updateField('photoCount', newCount);
      updateField('hasPhotos', true);

      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    await db.photos.delete(photoId);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    const newCount = Math.max((currentDraft.photoCount || 1) - 1, 0);
    updateField('photoCount', newCount);
    if (newCount === 0) updateField('hasPhotos', false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Fotoğraf ve Kanıt</h2>
        <p className="text-gray-500">Saha denetiminde toplanan görsel ve fiziksel kanıtları kaydedin.</p>
      </div>

      {/* Camera Capture Area */}
      <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center space-y-4">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={fileInputRef}
          onChange={handlePhotoCapture}
          multiple
        />
        <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-base">
          <Camera size={24} className="mr-2" />
          Fotoğraf Çek / Seç
        </Button>
        <p className="text-xs text-blue-600/70">
          Kamera ile çekim yapabilir veya galeriden seçebilirsiniz. Fotoğraflar cihazda kalır.
        </p>
      </div>

      {/* Photo Thumbnails */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-900 ml-1">
            Çekilen Fotoğraflar ({photos.length})
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {photos.map(photo => (
              <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm bg-gray-100">
                {photo.fileData ? (
                  <img
                    src={photo.fileData}
                    alt="Denetim fotoğrafı"
                    className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setPreviewPhoto(photo.fileData!)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Veri yok</div>
                )}
                {/* Zoom icon */}
                <button
                  onClick={() => photo.fileData && setPreviewPhoto(photo.fileData)}
                  className="absolute bottom-1 left-1 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ZoomIn size={14} />
                </button>
                {/* Delete button */}
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-80 hover:opacity-100 transition-opacity shadow"
                >
                  <Trash2 size={14} />
                </button>
                {/* Timestamp */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] text-center py-0.5">
                  {new Date(photo.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full-screen Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors z-10"
            onClick={() => setPreviewPhoto(null)}
          >
            <X size={28} />
          </button>
          <img
            src={previewPhoto}
            alt="Fotoğraf önizleme"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

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

