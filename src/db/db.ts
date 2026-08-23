import Dexie, { type Table } from 'dexie';
import type { Observation, Complaint, Problem, DigitalizationOpportunity, Photo } from '../types';

export class ZabitaAppDatabase extends Dexie {
  observations!: Table<Observation, string>;
  complaints!: Table<Complaint, string>;
  problems!: Table<Problem, string>;
  opportunities!: Table<DigitalizationOpportunity, string>;
  photos!: Table<Photo, string>;

  constructor() {
    super('ZabitaSahaGozlemDB');
    this.version(1).stores({
      observations: 'id, date, team, taskType, status, createdAt',
      complaints: 'id, observationId, source',
      problems: 'id, observationId, category, severity, stage',
      opportunities: 'id, observationId, priority',
      photos: 'id, observationId'
    });
  }
}

export const db = new ZabitaAppDatabase();
