import React from 'react';
import { useDraftStore } from '../../../store/useDraftStore';
import { Input } from '../../../components/ui/Input';
import { Radio } from '../../../components/ui/Radio';
import { Textarea } from '../../../components/ui/Textarea';
import type { ComplaintSource } from '../../../types';

const COMPLAINT_SOURCES: ComplaintSource[] = ['Çözüm Masası', 'CİMER', 'Dilekçe', 'Diğer'];
const PRIORITIES = ['Düşük', 'Normal', 'Yüksek', 'Acil'];

export default function Step2Source() {
  const { currentDraft, updateField } = useDraftStore();

  if (!currentDraft) return null;

  const complaintData = currentDraft.complaintData || {};

  const updateComplaint = (key: keyof typeof complaintData, value: any) => {
    updateField('complaintData', { ...complaintData, [key]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Şikâyet / Başvuru Kaynağı</h2>
        <p className="text-gray-500">Vatandaş bildiriminin nereden geldiğini ve detaylarını belirtin.</p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 ml-1">Kaynak</label>
        <div className="flex flex-wrap gap-2">
          {COMPLAINT_SOURCES.map(src => (
            <Radio
              key={src}
              label={src}
              name="complaintSource"
              checked={complaintData.source === src}
              onChange={() => updateComplaint('source', src)}
            />
          ))}
        </div>
      </div>

      {complaintData.source === 'Diğer' && (
        <Input
          label="Kaynak Nedir?"
          placeholder="Lütfen belirtin..."
          value={complaintData.otherSourceDescription || ''}
          onChange={(e) => updateComplaint('otherSourceDescription', e.target.value)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Şikâyet / Başvuru No"
          placeholder="Örn: 123456"
          value={complaintData.applicationNumber || ''}
          onChange={(e) => updateComplaint('applicationNumber', e.target.value)}
        />
        <Input
          label="Şikâyet Tarihi"
          type="date"
          value={complaintData.complaintDate || ''}
          onChange={(e) => updateComplaint('complaintDate', e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 ml-1">Öncelik</label>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map(priority => (
            <Radio
              key={priority}
              label={priority}
              name="priority"
              checked={complaintData.priority === priority}
              onChange={() => updateComplaint('priority', priority)}
            />
          ))}
        </div>
      </div>

      <Input
        label="Şikâyet Konusu"
        placeholder="Örn: Kaldırım işgali"
        value={complaintData.subject || ''}
        onChange={(e) => updateComplaint('subject', e.target.value)}
      />

      <Textarea
        label="Şikâyetin Özeti"
        placeholder="Vatandaşın belirttiği temel sorun nedir?"
        value={complaintData.description || ''}
        onChange={(e) => updateComplaint('description', e.target.value)}
      />

      <Textarea
        label="Şikâyet ilgili birime nasıl aktarıldı?"
        placeholder="Örn: Çözüm masasından sistem üzerinden düştü."
        value={complaintData.transferredBy || ''}
        onChange={(e) => updateComplaint('transferredBy', e.target.value)}
      />
    </div>
  );
}
