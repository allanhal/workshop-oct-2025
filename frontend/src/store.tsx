// store.js
import { create } from 'zustand';

const useStore = create((set) => ({
  profile: null,
  setProfile: (profile: unknown) => set(() => ({ profile })),
  count: 0,
  increase: () =>
    set((state: { count: number }) => ({ count: state.count + 1 })),
  decrease: () =>
    set((state: { count: number }) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

export default useStore;
