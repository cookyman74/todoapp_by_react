import { create } from 'zustand'

interface Todo {
    id: number;
    title: string;
    description: string;
    completed: boolean;
}

interface TodoStore {
    todos: Todo[];
    addTodo: (todo: Todo) => void;
    removeTodo: (id: number) => void;
    toggleTodo: (id: number) => void;
}

const useTodoStore = create<TodoStore>((set) => ({
    todos: [],  // 초기 상태에 대한 타입 지정

    addTodo: (todo: Todo) => set((state) => ({
        todos: [...state.todos, todo],
    })),

    removeTodo: (id: number) => set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
    })),

    toggleTodo: (id: number) => set((state) => ({
        todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
    })),
}));

export default useTodoStore;