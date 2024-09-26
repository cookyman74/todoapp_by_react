// src/pages/main/MainPage.tsx
import React, {useEffect, useState} from 'react';
import { Button, Container, Typography, CardActions, Card, CardContent, Grid, IconButton, Collapse, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useTodoStore from "../entities/todo/model/todoStore";
import useUserStore from "../entities/user/model/userStore";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const MainPage: React.FC = () => {
    const navigate = useNavigate();
    const { todos, addTodo, toggleTodo, removeTodo } = useTodoStore();
    const { user, clearUser } = useUserStore();

    //로컬스토리지에서 완료된 할일리스트에 대한 접힘 상태를 불러옴
    const [collapsed, setCollapse] = useState(() => {
        const savedState = localStorage.getItem('completedTodosCollapsed');
        return savedState ? JSON.stringify(savedState) : true;
    });

    // 접힘 상태를 localstorage에 저장
    const handleToggleCollapse = () => {
        const newCollapsed = !collapsed;
        setCollapse(newCollapsed);
        localStorage.setItem('completedTodoCollapsed', JSON.stringify(newCollapsed));
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            // 서버로부터 할일 리스트 가져오기
            const fetchTodos = async () => {
                try {
                    const response = await fetch('http://localhost:3001/todos', {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,  // JWT 토큰으로 인증
                        },
                    });

                    if (!response.ok) {
                        throw new Error('할일 목록을 가져오는 데 실패했습니다.');
                    }

                    const data = await response.json();
                    addTodo(data)
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

    const handleStatusTodo = async (todoId: number, isCompleted: boolean) => {
        try {
            const response = await fetch('http://localhost:3001/todos/'+todoId, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.access_token}`,
                },
                body: JSON.stringify({completed: isCompleted})
            });

            if (!response.ok) {
                throw new Error("할일 상태 업데이트에 실패했습니다.")
            }

            toggleTodo(todoId);
        } catch (error) {
            console.error("할일 상태 업데이트 중 오류 발생: ", error);
        }

    };

    const formatDate = (dateString: string | undefined): string => {
        return dateString ? new Date(dateString).toLocaleDateString() : '설정되지 않음';
    };

    return (
        <Container maxWidth="md" style={{ textAlign: 'center', marginTop: '50px' }}>
            <Typography variant="h4" gutterBottom>
                {user ? `${user.email}님의 할일 관리` : 'Todo App'}
            </Typography>

            {user && (
                <>
                <Grid container spacing={3} style={{marginTop: '20px'}}>
                    {todos.filter(todo => !todo.completed).map((todo) => (
                        <Grid item xs={12} sm={6} md={4} key={todo.id}>
                            <Card>
                                <CardContent style={{
                                    textAlign: 'left',
                                    textDecoration: todo.completed ? 'line-through' : 'none'
                                }}>
                                    <Typography variant="h6" gutterBottom style={{textAlign: 'center'}}>
                                        {todo.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        설명: {todo.description}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        생성일: {todo.createdAt ? formatDate(todo.createdAt) : '알 수 없음'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        기한: {todo.deadline ? formatDate(todo.deadline) : '설정되지 않음'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        담당자: {todo.assignedTo ? todo.assignedTo : '할당되지 않음'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        태그: {todo.tags?.join(', ') || '태그 없음'}
                                    </Typography>
                                </CardContent>
                                <CardActions style={{justifyContent: 'center'}}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleStatusTodo(todo.id, !todo.completed)}
                                    >
                                        {todo.completed ? '미완료' : '완료'}
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => removeTodo(todo.id)}
                                    >
                                        삭제
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                    {/* 할일 등록 버튼과 로그아웃 버튼을 나란히 배치 */}
                    <Grid container spacing={2} justifyContent="center" style={{marginTop: '20px'}}>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddTodo}
                            >
                                할일 등록
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleLogout}
                            >
                                로그아웃
                            </Button>
                        </Grid>
                    </Grid>

                <div style={{marginTop: '40px'}}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography>
                            Completed or Deadline Todo List
                        </Typography>
                        <IconButton onClick={handleToggleCollapse}>
                            {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                        </IconButton>
                    </div>
                    <Divider style={{ marginTop: '10px' }} />

                    <Collapse in={!collapsed}>
                        <Grid container spacing={3}>
                            {todos.filter(todo => todo.completed).map((todo) => (
                                <Grid item xs={12} sm={6} md={4} key={todo.id}>
                                    <Card>
                                        <CardContent style={{
                                            textAlign: 'left',
                                            textDecoration: todo.completed ? 'line-through' : 'none'
                                        }}>
                                            <Typography variant="h6" gutterBottom style={{textAlign: 'center'}}>
                                                {todo.title}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                설명: {todo.description}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                생성일: {todo.createdAt ? formatDate(todo.createdAt) : '알 수 없음'}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                기한: {todo.deadline ? formatDate(todo.deadline) : '설정되지 않음'}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                담당자: {todo.assignedTo ? todo.assignedTo : '할당되지 않음'}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                태그: {todo.tags?.join(', ') || '태그 없음'}
                                            </Typography>
                                        </CardContent>
                                        <CardActions style={{justifyContent: 'center'}}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleStatusTodo(todo.id, !todo.completed)}
                                            >
                                                {todo.completed ? '미완료' : '완료'}
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="secondary"
                                                onClick={() => removeTodo(todo.id)}
                                            >
                                                삭제
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Collapse>
                </div>
                </>
                )}
            </Container>
            );
            };

            export default MainPage;
