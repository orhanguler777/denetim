import React, { useState } from 'react';
import { useDraftStore } from '../../../store/useDraftStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Radio } from '../../../components/ui/Radio';
import { Plus, Trash2 } from 'lucide-react';

const CATEGORIES = [
  'Manuel işlem', 'Kağıt kullanımı', 'Telefon trafiği', 'WhatsApp kullanımı',
  'Tekrar veri girişi', 'Bilgiye ulaşamama', 'İnternet problemi', 'Sistem problemi',
  'Onay süreci', 'Fotoğraf / belge problemi', 'Konum problemi', 'İletişim problemi', 'Diğer'
];

const STAGES = ['Görev', 'Şikâyet', 'Saha', 'Denetim', 'Tutanak', 'Onay', 'Sonuç', 'Arşiv', 'Diğer'];
const SEVERITIES = [1, 2, 3, 4, 5]; // 1: Önemsiz, 5: Kritik

export default function Step8Problems() {
  const { currentDraft } = useDraftStore();
  const [isAdding, setIsAdding] = useState(false);
  const [hasProblems, setHasProblems] = useState<boolean | null>(null);
  
  // Local form state for new problem
  const [category, setCategory] = useState('');
  const [categoryOther, setCategoryOther] = useState('');
  const [stage, setStage] = useState('');
  const [stageOther, setStageOther] = useState('');
  const [description, setDescription] = useState('');
  const [timeLoss, setTimeLoss] = useState('');
  const [severity, setSeverity] = useState(3);
  const [personnelComment, setPersonnelComment] = useState('');

  const problems = useLiveQuery(
    () => currentDraft ? db.problems.where('observationId').equals(currentDraft.id).toArray() : []
  ) || [];

  if (!currentDraft) return null;

  const handleSaveProblem = async () => {
    const finalCategory = category === 'Diğer' && categoryOther ? categoryOther : category;
    const finalStage = stage === 'Diğer' && stageOther ? stageOther : stage;
    
    if (!finalCategory || !finalStage || !description) {
      alert('Kategori, Aşama ve Açıklama zorunludur.');
      return;
    }
    await db.problems.add({
      id: crypto.randomUUID(),
      observationId: currentDraft.id,
      category: finalCategory,
      stage: finalStage,
      description,
      timeLoss: parseInt(timeLoss) || 0,
      severity,
      personnelComment,
      createdAt: new Date().toISOString()
    });
    
    // Reset form
    setCategory(''); setCategoryOther(''); setStage(''); setStageOther(''); setDescription(''); setTimeLoss(''); setSeverity(3); setPersonnelComment('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu problemi silmek istediğinize emin misiniz?')) {
      await db.problems.delete(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-red-600">Problem ve Zaman Kaybı</h2>
        <p className="text-gray-500">Süreçte yaşanan aksaklıkları ve gereksiz zaman kayıplarını kaydedin.</p>
      </div>

      {problems.length === 0 && !isAdding && (
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-900 ml-1">Bu denetimde problem yaşandı mı?</label>
          <div className="flex flex-wrap gap-2">
            <Radio
              label="Hayır"
              name="hasProblems"
              checked={hasProblems === false}
              onChange={() => setHasProblems(false)}
            />
            <Radio
              label="Evet"
              name="hasProblems"
              checked={hasProblems === true}
              onChange={() => {
                setHasProblems(true);
                setIsAdding(true);
              }}
            />
          </div>
        </div>
      )}

      {/* List existing problems */}
      {problems.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">Eklenen Problemler ({problems.length})</h3>
          <div className="space-y-3">
            {problems.map(p => (
              <div key={p.id} className="bg-red-50 border border-red-100 p-4 rounded-xl flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-red-700">{p.category}</span>
                    <span className="text-xs bg-white px-2 py-0.5 rounded text-gray-500">{p.stage}</span>
                    {p.timeLoss > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">{p.timeLoss} dk kayıp</span>}
                  </div>
                  <p className="text-sm text-gray-700">{p.description}</p>
                </div>
                <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 p-2">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
          
          {!isAdding && (
            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsAdding(true)}>
              <Plus size={20} className="mr-2" />
              Yeni Problem Ekle
            </Button>
          )}
        </div>
      )}

      {/* Add problem form */}
      {isAdding && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-red-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">Kategori</label>
            <select
              className="w-full h-10 rounded-lg border-2 border-gray-200 px-3 text-sm bg-white focus:border-blue-500 outline-none"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="" disabled>Seçiniz...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {category === 'Diğer' && (
              <Input
                placeholder="Lütfen belirtin..."
                value={categoryOther}
                onChange={e => setCategoryOther(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">Hangi Aşamada?</label>
            <select
              className="w-full h-10 rounded-lg border-2 border-gray-200 px-3 text-sm bg-white focus:border-blue-500 outline-none"
              value={stage}
              onChange={e => setStage(e.target.value)}
            >
              <option value="" disabled>Seçiniz...</option>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {stage === 'Diğer' && (
              <Input
                placeholder="Lütfen belirtin..."
                value={stageOther}
                onChange={e => setStageOther(e.target.value)}
              />
            )}
          </div>

          <Textarea
            label="Problem Açıklaması"
            placeholder="Ne oldu? Sorun neydi?"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Zaman Kaybı (Dk)"
              type="number"
              min="0"
              value={timeLoss}
              onChange={e => setTimeLoss(e.target.value)}
            />
            <div className="space-y-1.5 flex flex-col justify-end pb-[2px]">
              <label className="text-sm font-medium text-gray-700 ml-1">Önem (1-5)</label>
              <select
                className="w-full h-10 rounded-lg border-2 border-gray-200 px-3 text-sm bg-white"
                value={severity}
                onChange={e => setSeverity(Number(e.target.value))}
              >
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <Textarea
            label="Personelin Kendi İfadesi (Opsiyonel)"
            placeholder="Personel bu konuda ne dedi?"
            value={personnelComment}
            onChange={e => setPersonnelComment(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setIsAdding(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveProblem} className="flex-1 bg-red-600 hover:bg-red-700">
              Kaydet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
