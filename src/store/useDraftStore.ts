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
  startNew: () => void;
  updateField: <K extends keyof Observation>(key: K, value: Observation[K]) => void;
  updateOtherField: (fieldKey: string, value: string) => void;
  saveDraftToDB: () => Promise<void>;
  clearDraft: () => void;
}

// Debounced save to local Dexie for drafts
const debouncedSave = debounceFn(async (draft: Partial<Observation>) => {
  if (draft.id) {
    await db.observations.put({ ...draft, updatedAt: new Date().toISOString() } as Observation);
  }
}, 1000);

export const useDraftStore = create<DraftState>((set, get) => ({
  currentDraft: null,
  
  loadDraft: async (id: string) => {
    // First try local Dexie
    let obs = await db.observations.get(id);
    // If not local, try Supabase (for editing completed records)
    if (!obs) {
      const { data } = await supabase.from('observations').select('*').eq('id', id).single();
      if (data) {
        // Fetch related data
        const { data: comp } = await supabase.from('complaints').select('*').eq('observationId', id).single();
        const { data: probs } = await supabase.from('problems').select('*').eq('observationId', id);
        const { data: opps } = await supabase.from('opportunities').select('*').eq('observationId', id);
        
        obs = {
          ...data,
          complaintData: comp || undefined,
          problems: probs || [],
          opportunities: opps || []
        } as Observation;
      }
    }
    
    if (obs) {
      set({ currentDraft: obs });
    }
  },

  startNew: () => {
    const today = new Date();
    const newDraft: Partial<Observation> = {
      id: crypto.randomUUID(),
      date: today.toISOString().split('T')[0],
      time: today.toTimeString().split(' ')[0].substring(0, 5),
      status: 'draft',
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      taskInformation: [],
      inspectionChecklist: [],
    };
    set({ currentDraft: newDraft });
    
    // Save to DB initially
    db.observations.add(newDraft as Observation).catch(console.error);
  },

  updateField: (key, value) => {
    set(state => {
      if (!state.currentDraft) return state;
      const updated = { ...state.currentDraft, [key]: value };
      
      // Auto-save to IndexedDB in background
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

  saveDraftToDB: async () => {
    const { currentDraft } = get();
    if (currentDraft && currentDraft.id) {
      const now = new Date().toISOString();
      const draft = { ...currentDraft, status: 'completed', updatedAt: now };
      
      // 1. Save Observation to Supabase
      const { error: obsError } = await supabase.from('observations').upsert({
        id: draft.id,
        date: draft.date,
        time: draft.time,
        team: draft.team,
        location: draft.location,
        locationCoordinates: draft.locationCoordinates,
        taskType: draft.taskType,
        otherFields: draft.otherFields,
        status: draft.status,
        notes: draft.notes,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
        taskInformation: draft.taskInformation,
        inspectionChecklist: draft.inspectionChecklist
      });

      if (obsError) {
        console.error('Error saving observation:', obsError);
        alert('Kaydetme hatası: ' + obsError.message);
        return;
      }

      // 2. Save related data
      if (draft.complaintData && Object.keys(draft.complaintData).length > 0) {
        const compId = draft.complaintData.id || crypto.randomUUID();
        await supabase.from('complaints').upsert({
          id: compId,
          observationId: draft.id,
          ...draft.complaintData
        });
      }

      if (draft.problems && draft.problems.length > 0) {
        await supabase.from('problems').delete().eq('observationId', draft.id);
        const problemsToInsert = draft.problems.map(p => ({
          ...p,
          id: p.id || crypto.randomUUID(),
          observationId: draft.id
        }));
        await supabase.from('problems').insert(problemsToInsert);
      }

      if (draft.opportunities && draft.opportunities.length > 0) {
        await supabase.from('opportunities').delete().eq('observationId', draft.id);
        const oppsToInsert = draft.opportunities.map(o => ({
          ...o,
          id: o.id || crypto.randomUUID(),
          observationId: draft.id
        }));
        await supabase.from('opportunities').insert(oppsToInsert);
      }

      // Clear local draft from dexie
      await db.observations.delete(draft.id);
      set({ currentDraft: null });
    }
  },

  clearDraft: () => set({ currentDraft: null }),
}));
