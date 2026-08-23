
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { ClipboardList, AlertTriangle, Lightbulb, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function EndOfDay() {
  const todayStr = new Date().toISOString().split('T')[0];

  const observations = useLiveQuery(() => db.observations.toArray()) || [];
  const problems = useLiveQuery(() => db.problems.toArray()) || [];
  const opportunities = useLiveQuery(() => db.opportunities.toArray()) || [];
  const complaints = useLiveQuery(() => db.complaints.toArray()) || [];

  const todayObs = observations.filter(o => o.date === todayStr);
  const completedToday = todayObs.filter(o => o.status === 'completed');
  const draftToday = todayObs.filter(o => o.status === 'draft');

  const todayObsIds = todayObs.map(o => o.id);
  const todayProblems = problems.filter(p => p.observationId && todayObsIds.includes(p.observationId));
  const todayOpps = opportunities.filter(o => o.observationId && todayObsIds.includes(o.observationId));
  const todayComplaints = complaints.filter(c => c.observationId && todayObsIds.includes(c.observationId));

  const totalTimeLoss = todayProblems.reduce((sum, p) => sum + (p.timeLoss || 0), 0);

  const stats = [
    { label: 'Bugünkü Gözlem', value: todayObs.length, icon: ClipboardList, color: 'bg-blue-100 text-blue-700' },
    { label: 'Tamamlanan', value: completedToday.length, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { label: 'Devam Eden', value: draftToday.length, icon: Clock, color: 'bg-orange-100 text-orange-700' },
    { label: 'Toplam Problem', value: todayProblems.length, icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
    { label: 'Zaman Kaybı', value: `${totalTimeLoss} dk`, icon: Clock, color: 'bg-red-50 text-red-700' },
    { label: 'Fırsat', value: todayOpps.length, icon: Lightbulb, color: 'bg-purple-100 text-purple-700' },
  ];

  // Complaint Sources
  const sourceCount = todayComplaints.reduce((acc, c) => {
    acc[c.source] = (acc[c.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Gün Sonu Analizi</h1>
        <p className="text-gray-500 font-medium capitalize">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: tr })}
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Complaints Analysis */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Şikayet Kaynakları Dağılımı</h2>
          {Object.keys(sourceCount).length === 0 ? (
            <p className="text-gray-500 text-sm">Bugün şikayet kaynaklı görev kaydedilmedi.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(sourceCount).map(([source, count]) => {
                const percentage = Math.round((count / todayComplaints.length) * 100);
                return (
                  <div key={source}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{source}</span>
                      <span className="font-bold text-gray-900">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-red-700 mb-2 border-b border-red-50 pb-2 flex items-center gap-2">
              <AlertTriangle size={18} /> En Kritik Problemler
            </h2>
            {todayProblems.length === 0 ? (
              <p className="text-gray-500 text-sm">Bugün problem kaydedilmedi.</p>
            ) : (
              <ul className="space-y-2 text-sm text-gray-700">
                {todayProblems.sort((a, b) => b.severity - a.severity).slice(0, 3).map(p => (
                  <li key={p.id} className="flex gap-2">
                    <span className="font-bold text-red-600">{p.severity}/5</span>
                    <span>{p.category}: {p.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-purple-700 mb-2 border-b border-purple-50 pb-2 flex items-center gap-2">
              <Lightbulb size={18} /> Öne Çıkan Fırsatlar
            </h2>
            {todayOpps.length === 0 ? (
              <p className="text-gray-500 text-sm">Bugün fırsat kaydedilmedi.</p>
            ) : (
              <ul className="space-y-2 text-sm text-gray-700">
                {todayOpps.sort((a, b) => b.priority - a.priority).slice(0, 3).map(o => (
                  <li key={o.id} className="flex gap-2">
                    <span className="font-bold text-purple-600">{o.priority}/5</span>
                    <span>{o.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
