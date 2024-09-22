// src/pages/main/MainPage.tsx
import React, { useEffect } from 'react';
import { Button, Container, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useTodoStore from "../entities/todo/model/todoStore";
import useUserStore from "../entities/user/model/userStore";

const MainPage: React.FC = () => {
    const navigate = useNavigate();
    const { todos, addTodo, toggleTodo, removeTodo } = useTodoStore();
    const { user, clearUser } = useUserStore();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            // 서버로부터 할일 리스트 가져오기
            const fetchTodos = async () => {
                try {
                    const response = await fetch('http://localhost:3001/todos', {
                        headers: {
                            Authorization: `Bearer ${user.token}`,  // JWT 토큰으로 인증
                        },
                    });

                    if (!response.ok) {
                        throw new Error('할일 목록을 가져오는 데 실패했습니다.');
                    }

                    const data = await response.json();
                    addTodo(data);  // 상태 업데이트
                } catch (error) {
                    console.error('할일 데이터를 가져오는 중 오류 발생:', error);
                }
            };

            fetchTodos();
        }
    }, [user, navigate]);

    // 로그아웃 처리
    const handleLogout = () => {
        clearUser();
        navigate('/login');
    };

    // 할일 등록 페이지로 이동
    const handleAddTodo = () => {
        navigate('/create-todo');
    };

    // 로그인 페이지로 이동
    const handleLogin = () => {
        navigate('/login');
    };

    // 회원가입 페이지로 이동
    const handleSignUp = () => {
        navigate('/signup');
    };

    return (
        <Container maxWidth="md" style={{ textAlign: 'center', marginTop: '50px' }}>
            <Typography variant="h4" gutterBottom>
                {user ? `${user.email}님의 할일 관리` : 'Todo App'}
            </Typography>

            {user && (
                <>
                    <Typography variant="h5" gutterBottom>
                        할일 통계
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {/*완료된 할일: {completedTodos}, 진행 중인 할일: {inProgressTodos}*/}
                    </Typography>

                    {/* 할일 등록 버튼 */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddTodo}
                        style={{ marginTop: '20px' }}
                    >
                        할일 등록
                    </Button>

                    {/* 할일 리스트 */}
                    <List style={{ marginTop: '20px', textAlign: 'left' }}>
                        {todos.map((todo) => (
                            <ListItem key={todo.id}>
                                <ListItemText
                                    primary={todo.title}
                                    secondary={todo.description}
                                    style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => toggleTodo(todo.id)}
                                    style={{ marginRight: '10px' }}
                                >
                                    {todo.completed ? '미완료' : '완료'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => removeTodo(todo.id)}
                                >
                                    삭제
                                </Button>
                            </ListItem>
                        ))}
                    </List>

                    {/* 로그아웃 버튼 */}
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleLogout}
                        style={{ marginTop: '20px' }}
                    >
                        로그아웃
                    </Button>
                </>
            )}
        </Container>
    );
};

export default MainPage;
