import { create } from 'zustand';

interface User {
    email: string;
    refresh_token: string;
    access_token: string;
}

interface UserStore {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
}

// JSON.parse 오류 처리 추가
const getUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem('user');
    try {
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error('LocalStorage에서 user를 파싱하는 중 오류 발생:', error);
        return null;
    }
};

const useUserStore = create<UserStore>((set) => ({
    user: getUserFromLocalStorage(),
    setUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user));  // 로그인 시 LocalStorage에 저장
        set({ user });
    },
    clearUser: () => {
        localStorage.removeItem('user');  // 로그아웃 시 LocalStorage에서 제거
        set({ user: null });
    },
}));

export default useUserStore;