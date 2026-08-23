import React, { useState } from 'react';
import { useDraftStore } from '../../../store/useDraftStore';
import { Radio } from '../../../components/ui/Radio';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Textarea } from '../../../components/ui/Textarea';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Plus } from 'lucide-react';

const CHECKED_INFO = ['Kimlik', 'Ruhsat', 'İşyeri bilgileri', 'Önceki tutanaklar', 'Diğer'];
const INFO_LOCATIONS = ['Kağıt', 'Telefon', 'Tablet', 'Bilgisayar', 'Hafızadan', 'Diğer'];
const DEFAULT_CHECKLIST = [
  'İşletme kontrol edildi',
  'Ruhsat kontrol edildi',
  'Kimlik kontrol edildi',
  'Önceki kayıt kontrol edildi',
  'Fotoğraf çekildi',
  'Tutanak hazırlandı',
  'Vatandaş bilgilendirildi',
  'Amir bilgilendirildi'
];

export default function Step4Inspection() {
  const { currentDraft, updateField, updateOtherField } = useDraftStore();
  const [newChecklistItem, setNewChecklistItem] = useState('');

  if (!currentDraft) return null;

  const handleCheckedInfoToggle = (info: string) => {
    const current = currentDraft.checkedInfo || [];
    if (current.includes(info)) {
      updateField('checkedInfo', current.filter(i => i !== info));
    } else {
      updateField('checkedInfo', [...current, info]);
    }
  };

  const handleChecklistToggle = (item: string) => {
    const current = currentDraft.inspectionChecklist || [];
    if (current.includes(item)) {
      updateField('inspectionChecklist', current.filter(i => i !== item));
    } else {
      updateField('inspectionChecklist', [...current, item]);
    }
  };

  const addCustomChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const currentCustom = currentDraft.customChecklistItems || [];
    updateField('customChecklistItems', [...currentCustom, newChecklistItem.trim()]);
    setNewChecklistItem('');
  };

  const allChecklistItems = [...DEFAULT_CHECKLIST, ...(currentDraft.customChecklistItems || [])];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Denetim İşlemi</h2>
        <p className="text-gray-500">Sahada yapılan işlemleri ve kontrolleri işaretleyin.</p>
      </div>

      <Textarea
        label="İlk yapılan işlem nedir?"
        placeholder="Ekip olay yerine vardığında ilk ne yaptı?"
        value={currentDraft.firstAction || ''}
        onChange={(e) => updateField('firstAction', e.target.value)}
      />

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 ml-1">Kontrol edilen bilgiler</label>
        <div className="flex flex-wrap gap-2">
          {CHECKED_INFO.map(info => (
            <Checkbox
              key={info}
              label={info}
              checked={(currentDraft.checkedInfo || []).includes(info)}
              onChange={() => handleCheckedInfoToggle(info)}
            />
          ))}
        </div>
        {(currentDraft.checkedInfo || []).includes('Diğer') && (
          <Input
            placeholder="Lütfen belirtin..."
            value={currentDraft.otherFields?.checkedInfo || ''}
            onChange={(e) => updateOtherField('checkedInfo', e.target.value)}
          />
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700 ml-1">Bu bilgiler nerede tutuluyor / nereden bakıldı?</label>
        <div className="flex flex-wrap gap-2">
          {INFO_LOCATIONS.map(loc => (
            <Radio
              key={loc}
              label={loc}
              name="infoLocation"
              checked={currentDraft.infoLocation === loc}
              onChange={() => updateField('infoLocation', loc)}
            />
          ))}
        </div>
        {currentDraft.infoLocation === 'Diğer' && (
          <Input
            placeholder="Lütfen belirtin..."
            value={currentDraft.otherFields?.infoLocation || ''}
            onChange={(e) => updateOtherField('infoLocation', e.target.value)}
          />
        )}
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700 ml-1">Denetim Checklist'i</label>
        <div className="flex flex-wrap gap-2">
          {allChecklistItems.map(item => (
            <Checkbox
              key={item}
              label={item}
              checked={(currentDraft.inspectionChecklist || []).includes(item)}
              onChange={() => handleChecklistToggle(item)}
            />
          ))}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Input
            placeholder="Farklı bir işlem..."
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addCustomChecklistItem()}
          />
          <Button variant="secondary" onClick={addCustomChecklistItem} className="px-4 shrink-0">
            <Plus size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}
