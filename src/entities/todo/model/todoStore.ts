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

    addTodo: (todo: Todo | Todo[]) => set((state) => {
        // 데이터를 배열로 변환 (배열이 아니면 배열로 변환)
        const todosArray = Array.isArray(todo) ? todo : [todo];

        // 상태에 중복 없이 todo 추가
        const newTodos = todosArray.filter(newTodo =>
            !state.todos.some(existingTodo => existingTodo.id === newTodo.id)
        );

        return {
            todos: [...state.todos, ...newTodos],
        };
    }),

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