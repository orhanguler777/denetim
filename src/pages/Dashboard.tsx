import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ClipboardList, AlertTriangle, Lightbulb, Clock, CheckCircle, Plus } from 'lucide-react';

export default function Dashboard() {
  const todayStr = new Date().toISOString().split('T')[0];

  const observations = useLiveQuery(() => db.observations.toArray()) || [];
  const problems = useLiveQuery(() => db.problems.toArray()) || [];
  const opportunities = useLiveQuery(() => db.opportunities.toArray()) || [];

  const todayObs = observations.filter(o => o.date === todayStr);
  const completedToday = todayObs.filter(o => o.status === 'completed');
  const draftObs = observations.filter(o => o.status === 'draft');

  const stats = [
    { label: 'Bugünkü Gözlem', value: todayObs.length, icon: ClipboardList, color: 'bg-blue-100 text-blue-700' },
    { label: 'Tamamlanan', value: completedToday.length, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { label: 'Devam Eden', value: draftObs.length, icon: Clock, color: 'bg-orange-100 text-orange-700' },
    { label: 'Problem', value: problems.length, icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
    { label: 'Fırsat', value: opportunities.length, icon: Lightbulb, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Zabıta Saha Gözlem</h1>
        <p className="text-gray-500 font-medium capitalize">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: tr })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Devam Eden Gözlemler */}
      {draftObs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-orange-500" size={20} />
            Devam Eden Gözlemler
          </h2>
          <div className="space-y-3">
            {draftObs.map(obs => (
              <div key={obs.id} className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">{obs.taskType || 'Yeni Denetim'}</p>
                  <p className="text-sm text-gray-500">{obs.time} • {obs.team || 'Ekip seçilmedi'}</p>
                </div>
                <Link
                  to={`/new?id=${obs.id}`}
                  className="bg-orange-100 text-orange-700 px-4 py-2 rounded-xl font-medium text-sm hover:bg-orange-200 transition-colors"
                >
                  Devam Et
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bugünkü Gözlemler Listesi */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="text-blue-600" size={20} />
          Bugünkü Gözlemler
        </h2>
        
        {todayObs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <ClipboardList size={32} />
            </div>
            <p className="text-gray-500 mb-4">Henüz gözlem bulunmuyor.</p>
            <Link to="/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium">
              <Plus size={20} />
              İlk denetimi oluştur
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayObs.map(obs => {
              const obsProblems = problems.filter(p => p.observationId === obs.id).length;
              const obsOpps = opportunities.filter(o => o.observationId === obs.id).length;

              return (
                <div key={obs.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold">
                      {obs.taskType}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">{obs.time}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{obs.location || 'Konum belirtilmedi'}</h3>
                  <p className="text-sm text-gray-500 mb-4">{obs.taskSource || obs.taskGivenBy}</p>
                  
                  <div className="flex gap-2">
                    {obsProblems > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md">
                        <AlertTriangle size={14} /> {obsProblems} Problem
                      </span>
                    )}
                    {obsOpps > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                        <Lightbulb size={14} /> {obsOpps} Fırsat
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
