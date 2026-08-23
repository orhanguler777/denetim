import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDraftStore } from '../../store/useDraftStore';
import { Save, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';

// Import all steps
import Step1Task from './steps/Step1Task';
import Step2Source from './steps/Step2Source';
import Step3Field from './steps/Step3Field';
import Step4Inspection from './steps/Step4Inspection';
import Step5Evidence from './steps/Step5Evidence';
import Step6Report from './steps/Step6Report';
import Step7Result from './steps/Step7Result';
import Step8Problems from './steps/Step8Problems';
import Step9Opportunity from './steps/Step9Opportunity';
// Step10Summary is omitted as everything is on one page now

export default function NewObservationWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const draftId = searchParams.get('id');

  const { currentDraft, loadDraft, startNew, saveDraftToDB, updateField } = useDraftStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (draftId) {
        await loadDraft(draftId);
      } else {
        startNew();
      }
      setIsReady(true);
    };
    init();
  }, [draftId, loadDraft, startNew]);

  if (!isReady || !currentDraft) {
    return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
  }

  const handleSave = async () => {
    currentDraft.status = 'completed';
    await saveDraftToDB();
    navigate('/observations');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Top Header */}
      <div className="bg-white px-4 py-4 shadow-sm z-10 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {draftId ? 'Gözlem Düzenle' : 'Yeni Denetim / Tutanak Formu'}
        </h1>
      </div>

      {/* Main Form Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 md:px-6 md:pt-6 lg:px-8 lg:pt-8 max-w-3xl mx-auto w-full space-y-12">
        {/* Render all steps sequentially */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Step1Task /></section>
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Step2Source /></section>
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Step3Field /></section>
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Step4Inspection /></section>
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Step5Evidence /></section>
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Step6Report /></section>
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Step7Result /></section>
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Step8Problems /></section>
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><Step9Opportunity /></section>

        {/* Notlar Alanı */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Genel Notlar</h2>
            <p className="text-gray-500">Denetimle ilgili eklemek istediğiniz diğer tüm detayları buraya yazabilirsiniz.</p>
          </div>
          <Textarea
            placeholder="Notlarınızı buraya yazın..."
            rows={6}
            value={currentDraft.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </section>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed md:absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe flex gap-3 justify-end z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button 
          onClick={async () => {
            await saveDraftToDB(true);
            navigate('/observations');
          }} 
          variant="secondary" 
          className="w-full md:w-auto md:px-8 h-14 text-sm md:text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
          Taslak Kaydet ve Çık
        </Button>
        <Button onClick={handleSave} variant="primary" className="w-full md:w-auto md:px-12 bg-green-600 hover:bg-green-700 h-14 text-sm md:text-lg shadow-lg shrink-0">
          <Save size={24} className="mr-2 hidden md:block" />
          KAYDET VE TAMAMLA
        </Button>
      </div>
    </div>
  );
}
