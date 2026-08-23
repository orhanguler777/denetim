import { create } from 'zustand';
import type { Observation } from '../types';
import { db } from '../db/db';
import { supabase } from '../lib/supabase';

// A helper debounce function so we don't need lodash
const debounceFn = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

interface DraftState {
  currentDraft: Partial<Observation> | null;
  loadDraft: (id: string) => Promise<void>;
  startNew: (draft?: Partial<Observation>) => void;
  updateField: <K extends keyof Observation>(key: K, value: Observation[K]) => void;
  updateOtherField: (fieldKey: string, value: string) => void;
  saveDraftToDB: (isDraft?: boolean) => Promise<void>;
  clearDraft: () => void;
}

// Debounced save to prevent excessive DB writes locally
const debouncedSave = debounceFn(async (draft: Partial<Observation>) => {
  if (draft.id) {
    await db.observations.put({ ...draft, updatedAt: new Date().toISOString() } as Observation);
  }
}, 1000);

export const useDraftStore = create<DraftState>((set, get) => ({
  currentDraft: null,

  loadDraft: async (id: string) => {
    let obs = await db.observations.get(id);
    if (!obs) {
      const { data } = await supabase.from('observations').select('*').eq('id', id).single();
      if (data) {
        const { data: comp } = await supabase.from('complaints').select('*').eq('observationId', id).single();
        const { data: probs } = await supabase.from('problems').select('*').eq('observationId', id);
        const { data: opps } = await supabase.from('opportunities').select('*').eq('observationId', id);
        obs = { ...data, complaintData: comp || undefined, problems: probs || [], opportunities: opps || [] } as Observation;
      }
    }
    if (obs) {
      set({ currentDraft: obs });
    }
  },

  startNew: (draft: Partial<Observation> = {}) => {
    const today = new Date();
    const newDraft: Partial<Observation> = {
      id: crypto.randomUUID(),
      date: today.toISOString().split('T')[0],
      time: today.toTimeString().split(' ')[0].substring(0, 5),
      team: draft.team,
      departureLocation: draft.departureLocation,
      departureCoordinates: draft.departureCoordinates,
      location: draft.location,
      locationCoordinates: draft.locationCoordinates,
      status: 'draft',
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      taskInformation: [],
      inspectionChecklist: [],
    };
    set({ currentDraft: newDraft });
    db.observations.add(newDraft as Observation).catch(console.error);
  },

  updateField: (key, value) => {
    set(state => {
      if (!state.currentDraft) return state;
      const updated = { ...state.currentDraft, [key]: value };
      debouncedSave(updated);
      return { currentDraft: updated };
    });
  },

  updateOtherField: (fieldKey: string, value: string) => {
    set(state => {
      if (!state.currentDraft) return state;
      const otherFields = { ...(state.currentDraft.otherFields || {}), [fieldKey]: value };
      const updated = { ...state.currentDraft, otherFields };
      debouncedSave(updated);
      return { currentDraft: updated };
    });
  },

  saveDraftToDB: async (isDraft = false) => {
    const { currentDraft } = get();
    if (currentDraft && currentDraft.id) {
      const now = new Date().toISOString();
      const statusToSave = isDraft ? 'draft' : 'completed';
      const draft = { ...currentDraft, status: statusToSave, updatedAt: now };

      const { complaintData, problems, opportunities, ...obsToSave } = draft as any;
      const { error: obsError } = await supabase.from('observations').upsert(obsToSave);

      if (obsError) {
        console.error('Error saving observation:', obsError);
        alert('Kaydetme hatası: ' + obsError.message);
        return;
      }

      if (draft.complaintData && Object.keys(draft.complaintData).length > 0) {
        const compId = draft.complaintData.id || crypto.randomUUID();
        await supabase.from('complaints').upsert({ id: compId, observationId: draft.id, ...draft.complaintData });
      }

      if (draft.problems && draft.problems.length > 0) {
        await supabase.from('problems').delete().eq('observationId', draft.id);
        const problemsToInsert = draft.problems.map(p => ({ ...p, id: p.id || crypto.randomUUID(), observationId: draft.id }));
        await supabase.from('problems').insert(problemsToInsert);
      }

      if (draft.opportunities && draft.opportunities.length > 0) {
        await supabase.from('opportunities').delete().eq('observationId', draft.id);
        const oppsToInsert = draft.opportunities.map(o => ({ ...o, id: o.id || crypto.randomUUID(), observationId: draft.id }));
        await supabase.from('opportunities').insert(oppsToInsert);
      }

      await db.observations.delete(draft.id);
      set({ currentDraft: null });
    }
  },

  clearDraft: () => set({ currentDraft: null }),
}));
