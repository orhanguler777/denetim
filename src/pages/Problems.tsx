import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { AlertTriangle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Problems() {
  const problems = useLiveQuery(() => db.problems.toArray()) || [];
  const [filter, setFilter] = useState('Hepsi');

  const categories = ['Hepsi', ...Array.from(new Set(problems.map(p => p.category)))];

  const filteredProblems = problems
    .filter(p => filter === 'Hepsi' || p.category === filter)
    .sort((a, b) => b.severity - a.severity);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Problemler</h1>
          <p className="text-gray-500">Sahada tespit edilen zaman kayıpları ve sorunlar.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex items-center gap-2 text-gray-500 mr-2 shrink-0">
          <Filter size={18} /> Filtre:
        </div>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              filter === cat ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredProblems.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-700 text-lg">{p.category}</span>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">{p.stage}</span>
              </div>
              <div className="flex gap-1">
                {Array.from({length: p.severity}).map((_, i) => (
                  <AlertTriangle key={i} size={14} className="text-red-500" fill="currentColor" />
                ))}
              </div>
            </div>
            
            <p className="text-gray-700 mb-3">{p.description}</p>
            
            {p.timeLoss > 0 && (
              <div className="inline-block px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-lg mb-3">
                Tahmini Kayıp: {p.timeLoss} dk
              </div>
            )}
            
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm">
              <span className="text-gray-500">{new Date(p.createdAt).toLocaleDateString('tr-TR')}</span>
              <Link to={`/new?id=${p.observationId}`} className="text-blue-600 font-medium hover:underline">
                Gözleme Git →
              </Link>
            </div>
          </div>
        ))}
        {filteredProblems.length === 0 && (
          <div className="text-center p-8 text-gray-500 bg-white rounded-2xl border border-gray-100">
            Kayıt bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
