import { create } from 'zustand';
import type { Observation } from '../types';
import { db } from '../db/db';

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

// Debounced save to prevent excessive DB writes
const debouncedSave = debounceFn(async (draft: Partial<Observation>) => {
  if (draft.id) {
    await db.observations.put({ ...draft, updatedAt: new Date().toISOString() } as Observation);
  }
}, 1000);

export const useDraftStore = create<DraftState>((set, get) => ({
  currentDraft: null,

  loadDraft: async (id: string) => {
    const obs = await db.observations.get(id);
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
      await db.observations.put({ ...currentDraft, updatedAt: new Date().toISOString() } as Observation);
    }
  },

  clearDraft: () => set({ currentDraft: null }),
}));
