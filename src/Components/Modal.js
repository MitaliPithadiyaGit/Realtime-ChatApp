import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button onClick={onClose}>Close</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;

import React, { useContext, useState } from 'react';
import { getUser, registerUser } from '../API/Api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { Button, Container, Link, Paper, TextField, Typography } from '@mui/material';
import  {NotificationManager } from 'react-notifications';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    image: null, // Add image field
  });

  const navigate = useNavigate();

  const { username, email, password, image } = formData;

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const { setUser } = useContext(AuthContext);

  const handleSignUp = async (e) => {
    e.preventDefault();
  
    try {
      const formDataToSend = new FormData(); // Create a new FormData instance
      formDataToSend.append('username', username);
      formDataToSend.append('email', email);
      formDataToSend.append('password', password);
      formDataToSend.append('image', image); // Add image to FormData
  
      const response = await registerUser(formDataToSend);
  
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.id); 
         // Store user ID in localStorage
         const id = response.data.id
        const userData = await getUser();
        setUser(userData
          // image: URL.createObjectURL(image) 
        );
        console.log(image);
        NotificationManager.success('User registered successfully!', 'Success');
        navigate(`/chat-dashboard/${id}`); // Redirect to ChatDashboard
      }
  
      console.log(response);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to register user';
      NotificationManager.error(errorMessage, 'Error');
      throw new Error('Failed to register user');
    }
  };
  

  return (
    <Container maxWidth="sm" sx={{ padding: 3, marginTop: 10 }}>
        <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Sign Up
          </Typography>
            <TextField
              label="Name"
              name="username"
              type="text"
              id="Name"
              fullWidth
              margin="normal"
              variant="outlined"
              required
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              id="Email"
              fullWidth
              margin="normal"
              variant="outlined"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              label="Password"
              name="password"
              id="Password"
              fullWidth
              margin="normal"
              type="password"
              variant="outlined"
              required
              value={formData.password}
              onChange={handleChange}
            />
             <TextField
              fullWidth
              type="file"
              name="image"
              margin="normal"
              onChange={handleChange}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 2 }}
              onClick={handleSignUp}
            >
              Sign Up
            </Button>
          <div style={{ marginLeft: 254, marginTop: 10 ,fontFamily:"system-ui",fontWeight:600,fontSize:17 }}>
            Already have an Account?{" "}
            <Link style={{ color: "blue" }} href="/login">
              Login
            </Link>
          </div>
        </Paper>
      </Container>
  );
};

export default Register;

useEffect(() => {
  const connectWebSocket = () => {
    ws.current = new WebSocket(`ws://realtime-chatapp-backend.vercel.app?userId=${userId}`);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        console.log("Message received from WebSocket:", event.data);
        const { sender, message, timestamp } = JSON.parse(event.data);
        const receivedTimestamp = new Date().toISOString();

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender, message, timestamp: receivedTimestamp },
        ]);
        setSelectedUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === sender
              ? { ...user, lastMessage: { sender, message, timestamp } }
              : user
          )
        );
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      // Attempt to reconnect WebSocket here if needed
      connectWebSocket(); // Example: immediate attempt to reconnect
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Handle WebSocket errors here
    };
  };

  if (userId) {
    connectWebSocket();
  }

  return () => {
    if (ws.current) {
      ws.current.close();
    }
  };
}, [userId, setSelectedUsers, receiverId]);