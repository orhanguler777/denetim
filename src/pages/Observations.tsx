import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Link } from 'react-router-dom';
import { ClipboardList, Trash2, Calendar, MapPin, Search } from 'lucide-react';
import { Input } from '../components/ui/Input';

export default function Observations() {
  const [searchTerm, setSearchTerm] = useState('');
  const observations = useLiveQuery(() => db.observations.toArray()) || [];

  const filteredObservations = observations.filter(obs => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (obs.location || '').toLowerCase().includes(searchLower) ||
      (obs.team || '').toLowerCase().includes(searchLower) ||
      (obs.taskType || '').toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Bu gözlemi tamamen silmek istediğinize emin misiniz?')) {
      await db.observations.delete(id);
      // also delete associated data
      await db.complaints.where('observationId').equals(id).delete();
      await db.problems.where('observationId').equals(id).delete();
      await db.opportunities.where('observationId').equals(id).delete();
      await db.photos.where('observationId').equals(id).delete();
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gözlemler</h1>
          <p className="text-gray-500">Tüm geçmiş saha analizleri ve denetim kayıtları.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-4 text-gray-400" size={20} />
        <Input
          placeholder="Konum, ekip veya denetim türü ara..."
          className="pl-12"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredObservations.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm mt-4">
          <p className="text-gray-500">Kayıt bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredObservations.map(obs => (
            <div key={obs.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${obs.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                  {obs.status === 'completed' ? 'Tamamlandı' : 'Taslak'}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(obs.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>

              <h3 className="font-bold text-gray-900 mb-3 text-lg line-clamp-1">{obs.taskType || 'Belirtilmemiş Görev'}</h3>

              <div className="space-y-2.5 text-sm text-gray-600 mb-5 flex-1">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400 shrink-0" />
                  {obs.date || '-'} • {obs.time || '-'}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400 shrink-0" />
                  <span className="line-clamp-1">{obs.location || 'Konum belirtilmemiş'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-gray-400 shrink-0" />
                  <span className="line-clamp-1">{obs.team || 'Ekip belirtilmemiş'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
                <Link
                  to={`/new?id=${obs.id}`}
                  className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-2 rounded-xl text-center text-sm transition-colors"
                >
                  Görüntüle / Düzenle
                </Link>
                <button
                  onClick={(e) => handleDelete(obs.id, e)}
                  className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shrink-0"
                  title="Sil"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
