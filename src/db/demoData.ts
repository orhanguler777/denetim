import { db } from './db';

export const loadDemoData = async () => {
  const count = await db.observations.count();
  if (count > 0) return; // Zaten veri varsa ekleme yapma.

  const today = new Date().toISOString().split('T')[0];
  
  const obs1Id = crypto.randomUUID();
  const obs2Id = crypto.randomUUID();
  const obs3Id = crypto.randomUUID();
  const obs4Id = crypto.randomUUID();
  const obs5Id = crypto.randomUUID();

  // 1. Çözüm Masası
  await db.observations.add({
    id: obs1Id,
    date: today,
    time: '09:15',
    team: 'Merkez Ekip 1',
    observer: 'Gözlemci A',
    taskType: 'Vatandaş şikâyeti',
    taskSource: 'Çözüm Masası',
    taskGivenBy: 'Merkez',
    taskInformation: ['Adres', 'Şikâyet / olay açıklaması'],
    dispatchDuration: 5,
    location: 'Atatürk Caddesi No:15',
    arrivalMethod: 'GPS',
    inspectionChecklist: ['İşletme kontrol edildi', 'Ruhsat kontrol edildi'],
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await db.complaints.add({
    id: crypto.randomUUID(),
    observationId: obs1Id,
    source: 'Çözüm Masası',
    applicationNumber: 'CZ-2023-1001',
    subject: 'Kaldırım İşgali',
    description: 'İşletme mallarını kaldırıma koyuyor',
    priority: 'Normal'
  });

  await db.problems.add({
    id: crypto.randomUUID(),
    observationId: obs1Id,
    category: 'Kağıt kullanımı',
    stage: 'Tutanak',
    description: 'Tutanak kağıda yazıldı',
    timeLoss: 10,
    severity: 3,
    createdAt: new Date().toISOString(),
  });

  await db.opportunities.add({
    id: crypto.randomUUID(),
    observationId: obs1Id,
    description: 'Tutanakların dijital doldurulması',
    currentProcess: 'Kağıt form',
    proposedSolution: 'Tabletten dijital form',
    benefits: ['Zaman tasarrufu', 'Daha az kağıt', 'Daha kolay arşiv'],
    priority: 4,
    createdAt: new Date().toISOString(),
  });

  // 2. CİMER
  await db.observations.add({
    id: obs2Id,
    date: today,
    time: '11:00',
    team: 'Bölge Ekip 2',
    observer: 'Gözlemci B',
    taskType: 'Vatandaş şikâyeti',
    taskSource: 'CİMER',
    taskGivenBy: 'Birim Amiri',
    taskInformation: ['Kişi / işletme bilgisi'],
    dispatchDuration: 15,
    inspectionChecklist: ['Fotoğraf çekildi', 'Vatandaş bilgilendirildi'],
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  
  await db.complaints.add({
    id: crypto.randomUUID(),
    observationId: obs2Id,
    source: 'CİMER',
    applicationNumber: 'C-234234',
    subject: 'Gürültü Kirliliği',
    priority: 'Yüksek'
  });

  // 3. Dilekçe
  await db.observations.add({
    id: obs3Id,
    date: today,
    time: '14:30',
    team: 'Merkez Ekip 1',
    observer: 'Gözlemci A',
    taskType: 'Vatandaş şikâyeti',
    taskSource: 'Dilekçe',
    taskGivenBy: 'Yazı İşleri',
    taskInformation: ['Adres'],
    dispatchDuration: 30,
    inspectionChecklist: ['Kimlik kontrol edildi'],
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await db.complaints.add({
    id: crypto.randomUUID(),
    observationId: obs3Id,
    source: 'Dilekçe',
    subject: 'İnşaat Atığı',
    priority: 'Normal'
  });

  // 4. Rutin
  await db.observations.add({
    id: obs4Id,
    date: today,
    time: '15:45',
    team: 'Pazar Denetim',
    observer: 'Gözlemci B',
    taskType: 'Rutin denetim',
    taskGivenBy: 'Program',
    taskInformation: ['Adres'],
    dispatchDuration: 0,
    inspectionChecklist: ['İşletme kontrol edildi', 'Ruhsat kontrol edildi'],
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 5. İhbar
  await db.observations.add({
    id: obs5Id,
    date: today,
    time: '16:20',
    team: 'Acil Müdahale',
    observer: 'Gözlemci A',
    taskType: 'İhbar',
    taskGivenBy: 'Telsiz',
    taskInformation: ['Adres', 'Konum', 'Şikâyet / olay açıklaması'],
    dispatchDuration: 2,
    inspectionChecklist: ['Tutanak hazırlandı', 'Amir bilgilendirildi'],
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log("Demo veriler başarıyla yüklendi.");
};
