import React from 'react';
import {  Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import Register from './Components/Register';
import Login from './Components/Login';
import ProtectedRoute from './Context/ProtectedRoute';
import Dashboard from './Components/Dashboard';
import AuthProvider from './Context/AuthContext';
import Chat from './Components/Chat';
import "./index.css"
import ChatDashboard from './Components/ChatDashboard';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/chat-dashboard/:id" element={<ChatDashboard/>} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
        />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
        />
        <Route path="*" element={<Navigate to="/register" />} />
        </Routes>

      </BrowserRouter>
    </AuthProvider>
  );
};



export default App;
