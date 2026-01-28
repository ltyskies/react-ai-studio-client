import {create} from 'zustand'
import {immer} from 'zustand/middleware/immer'

interface User{
    id: number;
    setUserId: (id: number) => void;
}


const useUserStore = create<User>()(immer((set) => ({
    id: 1,
    setUserId: (id: number) => set((state) => {
        state.id = id;
    }),
})))

export default useUserStore;