import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Opportunities() {
  const opportunities = useLiveQuery(() => db.opportunities.toArray()) || [];

  const sortedOpps = opportunities.sort((a, b) => b.priority - a.priority);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dijitalleştirme Fırsatları</h1>
          <p className="text-gray-500">Mevcut süreçleri iyileştirmek için önerilen çözümler.</p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedOpps.map(opp => (
          <div key={opp.id} className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-purple-900 text-lg flex-1">{opp.description}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ml-2 ${
                opp.priority >= 4 ? 'bg-red-100 text-red-700' :
                opp.priority === 3 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                Öncelik: {opp.priority}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Mevcut Süreç</p>
                <p className="text-gray-800 text-sm">{opp.currentProcess}</p>
              </div>
              <div className="hidden md:flex items-center justify-center shrink-0">
                <ArrowRight className="text-gray-300" />
              </div>
              <div>
                <p className="text-xs text-purple-600 font-medium uppercase tracking-wider mb-1">Önerilen Çözüm</p>
                <p className="text-purple-900 text-sm font-medium">{opp.proposedSolution}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {opp.benefits.map(b => (
                <span key={b} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100">
                  {b}
                </span>
              ))}
            </div>
            
            <div className="border-t border-gray-100 pt-3 text-right">
              <Link to={`/new?id=${opp.observationId}`} className="text-sm text-blue-600 font-medium hover:underline">
                Kaynağa Git →
              </Link>
            </div>
          </div>
        ))}
        {sortedOpps.length === 0 && (
          <div className="text-center p-8 text-gray-500 bg-white rounded-2xl border border-gray-100">
            Henüz dijitalleştirme fırsatı eklenmemiş.
          </div>
        )}
      </div>
    </div>
  );
}
