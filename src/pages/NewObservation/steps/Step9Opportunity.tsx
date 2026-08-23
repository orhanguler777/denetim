import React, { useState } from 'react';
import { useDraftStore } from '../../../store/useDraftStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Plus, Trash2 } from 'lucide-react';

const BENEFITS_LIST = [
  'Zaman tasarrufu', 'Daha az kağıt', 'Daha az hata', 'Anlık takip',
  'Daha iyi denetim', 'Raporlama', 'Şeffaflık', 'Daha kolay arşiv',
  'Daha hızlı onay', 'Diğer'
];

export default function Step9Opportunity() {
  const { currentDraft } = useDraftStore();
  const [isAdding, setIsAdding] = useState(false);
  
  // Local form state
  const [description, setDescription] = useState('');
  const [currentProcess, setCurrentProcess] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [benefitsOther, setBenefitsOther] = useState('');
  const [priority, setPriority] = useState(3);

  const opportunities = useLiveQuery(
    () => currentDraft ? db.opportunities.where('observationId').equals(currentDraft.id).toArray() : []
  ) || [];

  if (!currentDraft) return null;

  const handleBenefitToggle = (b: string) => {
    if (benefits.includes(b)) {
      setBenefits(benefits.filter(item => item !== b));
    } else {
      setBenefits([...benefits, b]);
    }
  };

  const handleSave = async () => {
    if (!description || !currentProcess || !proposedSolution) {
      alert('Soru, Mevcut Süreç ve Önerilen Çözüm alanları zorunludur.');
      return;
    }
    
    const finalBenefits = benefits.map(b => (b === 'Diğer' && benefitsOther) ? benefitsOther : b);
    
    await db.opportunities.add({
      id: crypto.randomUUID(),
      observationId: currentDraft.id,
      description,
      currentProcess,
      proposedSolution,
      benefits: finalBenefits,
      priority,
      createdAt: new Date().toISOString()
    });
    
    // Reset
    setDescription(''); setCurrentProcess(''); setProposedSolution(''); setBenefits([]); setBenefitsOther(''); setPriority(3);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Fırsatı silmek istediğinize emin misiniz?')) {
      await db.opportunities.delete(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-purple-700">Dijitalleştirme Fırsatı</h2>
        <p className="text-gray-500">Mevcut süreçleri nasıl daha dijital, hızlı ve hatasız hale getirebiliriz?</p>
      </div>

      {opportunities.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">Eklenen Fırsatlar ({opportunities.length})</h3>
          <div className="space-y-3">
            {opportunities.map(o => (
              <div key={o.id} className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-bold text-purple-900 mb-1">{o.description}</h4>
                  <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Mevcut:</span> {o.currentProcess}</p>
                  <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Öneri:</span> {o.proposedSolution}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {o.benefits.map(b => (
                      <span key={b} className="text-xs bg-white text-purple-600 px-2 py-1 rounded-md border border-purple-100">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => handleDelete(o.id)} className="text-purple-400 hover:text-purple-600 p-2 shrink-0">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isAdding && (
        <Button variant="outline" className="w-full text-purple-700 border-purple-200 hover:bg-purple-50" onClick={() => setIsAdding(true)}>
          <Plus size={20} className="mr-2" />
          {opportunities.length === 0 ? 'Fırsat Ekle' : 'Başka Fırsat Ekle'}
        </Button>
      )}

      {isAdding && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-purple-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4">
          
          <Textarea
            label="Bu işlem sistem tarafından otomatik yapılabilse ne fayda sağlardı?"
            placeholder="Kısa bir özet yazın..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <Textarea
            label="Mevcut Süreç"
            placeholder="Şu anda nasıl yapılıyor?"
            value={currentProcess}
            onChange={e => setCurrentProcess(e.target.value)}
          />

          <Textarea
            label="Önerilen Dijital Çözüm"
            placeholder="Nasıl bir ekran veya sistem tasarlanmalı?"
            value={proposedSolution}
            onChange={e => setProposedSolution(e.target.value)}
          />

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">Beklenen Faydalar</label>
            <div className="flex flex-wrap gap-2">
              {BENEFITS_LIST.map(b => (
                <Checkbox
                  key={b}
                  label={b}
                  checked={benefits.includes(b)}
                  onChange={() => handleBenefitToggle(b)}
                  className="p-3 text-base"
                />
              ))}
            </div>
            {benefits.includes('Diğer') && (
              <Input
                placeholder="Lütfen belirtin..."
                value={benefitsOther}
                onChange={e => setBenefitsOther(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <label className="text-sm font-medium text-gray-700 ml-1">Öncelik (1-5)</label>
            <select
              className="w-full h-10 rounded-lg border-2 border-gray-200 px-3 text-sm bg-white"
              value={priority}
              onChange={e => setPriority(Number(e.target.value))}
            >
              <option value={1}>1 - Düşük</option>
              <option value={2}>2 - Orta</option>
              <option value={3}>3 - Yüksek</option>
              <option value={4}>4 - Çok Yüksek</option>
              <option value={5}>5 - Kritik</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setIsAdding(false)}>
              İptal
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700">
              Kaydet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
