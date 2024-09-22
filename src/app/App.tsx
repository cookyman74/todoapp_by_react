import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from '../pages/MainPage';
// import TodoDetailPage from '../pages/todoDetail/TodoDetailPage';
// import TodoCreationPage from '../pages/todoCreation/TodoCreationPage';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';

const App: React.FC = () => {
  return (
      <Router>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/" element={<MainPage />} />
        </Routes>
      </Router>
  );
};

export default App;