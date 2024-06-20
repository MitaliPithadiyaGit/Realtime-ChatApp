import React, { useContext, useState } from 'react';
import { getUser, loginUser } from '../API/Api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { Button, Container, Link, Paper, TextField, Typography } from '@mui/material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const history=useNavigate();

  const { email, password } = formData;
  const { setUser } = useContext(AuthContext);
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData,setUser);
      console.log(response);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.id); 
        const userData = await getUser();
         setUser(userData);
         const id = response.data.id
        // Redirect todashboard after successful registration
        history(`/chat-dashboard/${id}`); // Use navigate to go to the dashboard route
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{marginTop:25}}>
    <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          name='email'
          id="email"
          fullWidth
          margin="normal"
          variant="outlined"
          required
          value={email}
          onChange={handleChange}
        />
        <TextField
          label="Password"
          type="password"
          id="password"
          name='password'
          fullWidth
          margin="normal"
          variant="outlined"
          required
          value={password}
          onChange={handleChange}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Login
        </Button>
        <div style={{ marginLeft: 260, marginTop: 10,fontFamily:"system-ui",fontWeight:600,fontSize:17 }}>
          Don't have an account?{' '}
          <Link style={{ color: 'blue' }} href="/">
            Signup
          </Link>
        </div>
      </form>
    </Paper>
  </Container>
  );
};

export default Login;
