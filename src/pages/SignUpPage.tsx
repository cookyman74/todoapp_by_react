// src/pages/signUp/SignUpPage.tsx
import React, { useState } from 'react';
import { Button, TextField, Container, Typography } from '@mui/material';
import useUserStore from '../entities/user/model/userStore';
import { useNavigate } from 'react-router-dom';

const SignUpPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const setUser = useUserStore((state) => state.setUser);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 백엔드 서버와 통신하여 회원가입 처리
        try {
            const response = await fetch('http://localhost:3001/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/login');  // 회원가입 후 메인 페이지로 이동
            } else {
                alert('회원가입 실패: ' + data.message);
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                회원가입
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="비밀번호"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    회원가입
                </Button>
            </form>
        </Container>
);
};

export default SignUpPage;
