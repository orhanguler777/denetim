import React from 'react';
import { useDraftStore } from '../../../store/useDraftStore';
import { Input } from '../../../components/ui/Input';
import { Radio } from '../../../components/ui/Radio';
import { Checkbox } from '../../../components/ui/Checkbox';

const TASK_TYPES = ['Rutin denetim', 'Vatandaş şikâyeti', 'İhbar', 'Amir talimatı', 'Diğer'];
const DELIVERY_METHODS = ['Sözlü', 'Telefon', 'WhatsApp', 'Telsiz', 'Mevcut sistem', 'Kağıt', 'Diğer'];
const INFO_TYPES = ['Adres', 'Konum', 'Şikâyet / olay açıklaması', 'Kişi / işletme bilgisi', 'Önceki işlem bilgisi', 'Diğer'];

export default function Step1Task() {
  const { currentDraft, updateField, updateOtherField } = useDraftStore();

  if (!currentDraft) return null;

  const handleInfoToggle = (info: string) => {
    const current = currentDraft.taskInformation || [];
    if (current.includes(info)) {
      updateField('taskInformation', current.filter(i => i !== info));
    } else {
      updateField('taskInformation', [...current, info]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Görev Bilgileri</h2>
        <p className="text-gray-500">Görevin nasıl geldiğini ve temel bilgileri kaydedin.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input 
          label="Tarih" 
          type="date"
          value={currentDraft.date || ''} 
          onChange={(e) => updateField('date', e.target.value)}
        />
        <Input 
          label="Saat" 
          type="time"
          value={currentDraft.time || ''} 
          onChange={(e) => updateField('time', e.target.value)}
        />
      </div>

      <Input
        label="Ekip / Birim Adı"
        placeholder="Örn: Merkez Ekip 1"
        value={currentDraft.team || ''}
        onChange={(e) => updateField('team', e.target.value)}
      />

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 ml-1">Görev Türü</label>
        <div className="flex flex-wrap gap-2">
          {TASK_TYPES.map(type => (
            <Radio
              key={type}
              label={type}
              name="taskType"
              checked={currentDraft.taskType === type}
              onChange={() => updateField('taskType', type)}
            />
          ))}
        </div>
        {currentDraft.taskType === 'Diğer' && (
          <Input
            placeholder="Lütfen belirtin..."
            value={currentDraft.otherFields?.taskType || ''}
            onChange={(e) => updateOtherField('taskType', e.target.value)}
          />
        )}
      </div>

      <Input
        label="Görevi kim verdi?"
        placeholder="Örn: Nöbetçi Amir"
        value={currentDraft.taskGivenBy || ''}
        onChange={(e) => updateField('taskGivenBy', e.target.value)}
      />

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 ml-1">Görev personele nasıl ulaştı?</label>
        <div className="flex flex-wrap gap-2">
          {DELIVERY_METHODS.map(method => (
            <Radio
              key={method}
              label={method}
              name="taskDeliveryMethod"
              checked={currentDraft.taskDeliveryMethod === method}
              onChange={() => updateField('taskDeliveryMethod', method)}
            />
          ))}
        </div>
        {currentDraft.taskDeliveryMethod === 'Diğer' && (
          <Input
            placeholder="Lütfen belirtin..."
            value={currentDraft.otherFields?.taskDeliveryMethod || ''}
            onChange={(e) => updateOtherField('taskDeliveryMethod', e.target.value)}
          />
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 ml-1">Görevle birlikte hangi bilgiler iletildi?</label>
        <div className="flex flex-wrap gap-2">
          {INFO_TYPES.map(info => (
            <Checkbox
              key={info}
              label={info}
              checked={(currentDraft.taskInformation || []).includes(info)}
              onChange={() => handleInfoToggle(info)}
            />
          ))}
        </div>
        {(currentDraft.taskInformation || []).includes('Diğer') && (
          <Input
            placeholder="Lütfen belirtin..."
            value={currentDraft.otherFields?.taskInformation || ''}
            onChange={(e) => updateOtherField('taskInformation', e.target.value)}
          />
        )}
      </div>

      <Input
        label="Görevden harekete geçiş süresi (Tahmini Dakika)"
        type="number"
        min="0"
        placeholder="0"
        value={currentDraft.dispatchDuration || ''}
        onChange={(e) => updateField('dispatchDuration', parseInt(e.target.value) || 0)}
      />
    </div>
  );
}
