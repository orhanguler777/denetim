import React from 'react';
import { useDraftStore } from '../../../store/useDraftStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db/db';
import { AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function Step10Summary() {
  const { currentDraft } = useDraftStore();

  const problems = useLiveQuery(
    () => currentDraft ? db.problems.where('observationId').equals(currentDraft.id).toArray() : []
  ) || [];

  const opportunities = useLiveQuery(
    () => currentDraft ? db.opportunities.where('observationId').equals(currentDraft.id).toArray() : []
  ) || [];

  if (!currentDraft) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-2 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Gözlem Tamamlandı</h2>
        <p className="text-gray-500">Tüm verileri kaydetmek için aşağıdaki butona basın.</p>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 space-y-6">
        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Denetim Özeti</h3>
        
        <div className="flex flex-wrap gap-2 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Görev Türü</p>
            <p className="font-semibold text-gray-900">{currentDraft.taskType || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Ekip</p>
            <p className="font-semibold text-gray-900">{currentDraft.team || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Konum</p>
            <p className="font-semibold text-gray-900">{currentDraft.location || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Sonuç</p>
            <p className="font-semibold text-gray-900">{currentDraft.result || '-'}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
          <div className="flex-1 bg-red-50 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-red-100 text-red-600 w-10 h-10 rounded-full flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="font-bold text-red-900 text-lg">{problems.length}</p>
              <p className="text-xs text-red-700 font-medium">Tespit Edilen Problem</p>
            </div>
          </div>
          <div className="flex-1 bg-purple-50 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
              <Lightbulb size={20} />
            </div>
            <div>
              <p className="font-bold text-purple-900 text-lg">{opportunities.length}</p>
              <p className="text-xs text-purple-700 font-medium">Dijitalleşme Fırsatı</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500 px-4">
        "Kaydet" butonuna bastığınızda bu gözlem tamamlanmış sayılacak ve ana sayfada listelenecektir.
      </div>
    </div>
  );
}
