// src/pages/CreateTodoPage.tsx
import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, TextField, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import useTodoStore from '../entities/todo/model/todoStore';
import useUserStore from '../entities/user/model/userStore';  // Zustand에서 user 상태 가져오기

interface User {
    id: number;
    name: string;
}

const CreateTodoPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('low');  // 우선순위
    const [deadline, setDeadline] = useState('');  // 기한
    const [assignedTo, setAssignedTo] = useState<number | null>(null);  // 담당자
    const [userList, setUserList] = useState<User []>([]);
    const [tags, setTags] = useState('');  // 태그
    const navigate = useNavigate();
    const { addTodo } = useTodoStore();
    const { user, setUser } = useUserStore();  // Zustand에서 user 상태를 가져옴

    const isValidTodo = (): boolean => {
        if (!title.trim()) {
            alert('제목은 필수 입력 항목입니다.');
            return false;
        }
        return true;
    };

    //  사용자 목록을 서버에서  가져오는 함수
    const fetchUsers = async () => {
        if (!user || !user.access_token) {
            alert('사용자 인증 정보가 없습니다.');
            return null;
        }

        try {
            const response = await fetch('http://localhost:3001/users', {
                headers: {
                    Authorization: `Bearer ${user.access_token}`,
                },
            })

            const data = await response.json();
            console.log("hhhhhh", data)
            setUserList(data);
        } catch (error) {
            console.error("사용자 목록을 가져오는 중 오류 발생: ", error)
        }
    };

    // 의존성 배열 없이 한 번만 fetchUsers 실행
    useEffect(() => {
        fetchUsers(); // 컴포넌트가 로드될 때 사용자 목록 가져오기
    }, []);

    const fetchCreateTodo = async (accessToken: string | undefined): Promise<Response | null> => {
        if (!user || !user.access_token) {
            alert('사용자 인증 정보가 없습니다.');
            return null;
        }

        const refreshAccessToken = async (): Promise<string | null> => {
            try {
                const response = await fetch('http://localhost:3001/auth/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: user.refresh_token }),  // refresh_token 사용
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser({
                        ...user,
                        access_token: data.access_token,  // 새로운 access_token 업데이트
                    });
                    return data.access_token;
                } else {
                    console.error('access_token 갱신 실패');
                    return null;
                }
            } catch (error) {
                console.error('토큰 갱신 중 오류 발생:', error);
                return null;
            }
        };

        const deadlineISO = deadline ? new Date(deadline).toISOString() : null;
        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

        try {
            const response = await fetch('http://localhost:3001/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.access_token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    priority,
                    deadline: deadlineISO,
                    assignedTo,
                    tags: tagsArray,
                    completed: false,
                }),
            });

            if (response.status === 401) {
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken) {
                    return fetchCreateTodo(newAccessToken);
                } else {
                    alert('다시 로그인해주세요');
                    navigate('/login');
                    return null;
                }
            }

            return response;
        } catch (error) {
            console.error('할일 등록 중 오류 발생:', error);
            alert('서버 오류가 발생했습니다.');
            return null;
        }
    };

    const handleConfirm = async () => {
        if (!isValidTodo()) return;

        const response = await fetchCreateTodo(user?.access_token);

        if (response && response.ok) {
            const data = await response.json();
            addTodo(data);  // 로컬 상태에 새로 추가된 할일 저장
            navigate('/');  // 메인 페이지로 이동
        } else {
            alert('할일 등록에 실패했습니다.');
        }
    };

    const handleCancel = () => navigate('/');  // 취소 시 메인 페이지로 이동

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                할일 등록
            </Typography>

            <TextField
                label="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                margin="normal"
                required
            />

            <TextField
                label="설명"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                margin="normal"
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>우선순위</InputLabel>
                <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as string)}
                >
                    <MenuItem value={1}>낮음</MenuItem>
                    <MenuItem value={3}>중간</MenuItem>
                    <MenuItem value={5}>높음</MenuItem>
                </Select>
            </FormControl>

            <TextField
                label="기한"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                fullWidth
                margin="normal"
            />

            {/* 담당자 선택을 위한 드롭다운 */}
            <FormControl fullWidth margin="normal">
                <InputLabel>담당자</InputLabel>
                <Select
                    value={assignedTo ?? ''}
                    onChange={(e) => setAssignedTo(Number(e.target.value))}
                >
                    {userList.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                            {user.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField
                label="태그 (쉼표로 구분)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                fullWidth
                margin="normal"
            />

            <Button
                variant="contained"
                color="primary"
                onClick={handleConfirm}
                style={{ marginTop: '20px' }}
            >
                확인
            </Button>

            <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                style={{ marginTop: '20px', marginLeft: '10px' }}
            >
                취소
            </Button>
        </Container>
    );
};

export default CreateTodoPage;
