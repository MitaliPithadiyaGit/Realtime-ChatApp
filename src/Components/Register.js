import React, { useContext, useState } from "react";
import { getUser, registerUser } from "../API/Api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import {
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { NotificationManager } from "react-notifications";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const { username, email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { setUser } = useContext(AuthContext);

  // const handleSignUp = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const formDataToSend = new FormData(); // Create a new FormData instance
  //     formDataToSend.append("username", username);
  //     formDataToSend.append("email", email);
  //     formDataToSend.append("password", password);

  //     const response = await registerUser(formDataToSend);

  //     if (response.data.token) {
  //       localStorage.setItem("token", response.data.token);
  //       localStorage.setItem("userId", response.data.id);
  //       // Store user ID in localStorage
  //       const id = response.data.id;
  //       const userData = await getUser();
  //       setUser(
  //         userData
  //         // image: URL.createObjectURL(image)
  //       );
  //       NotificationManager.success("User registered successfully!", "Success");
  //       navigate(`/chat-dashboard/${id}`); // Redirect to ChatDashboard
  //     }

  //     console.log(response);
  //     return response;
  //   } catch (error) {
  //     const errorMessage =
  //       error.response?.data?.message || "Failed to register user";
  //     NotificationManager.error(errorMessage, "Error");
  //     throw new Error("Failed to register user");
  //   }
  // };

  // const handleSignUp = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const formDataForUpload = new FormData();
  //     formDataForUpload.append('username', formData.username);
  //     formDataForUpload.append('email', formData.email);
  //     formDataForUpload.append('password', formData.password);
  
  //     console.log('FormData:', formDataForUpload.get('username'), formDataForUpload.get('email'), formDataForUpload.get('password'));
  
  //     const response = await axios.post('https://realtime-chta-app-backend.vercel.app/register', formDataForUpload);
  
  //     if (response.status === 200) {
  //       console.log('SignUp Successful:', response.data);
  //       if (response.data.token) {
  //         localStorage.setItem("token", response.data.token);
  //         localStorage.setItem("userId", response.data.id);
  //         const id = response.data.id;
  //         const userData = await getUser();
  //         setUser(userData);
  //         NotificationManager.success("User registered successfully!", "Success");
  //         navigate(`/chat-dashboard/${id}`);
  //       } else {
  //         console.error('Signup Failed:', response.data);
  //         NotificationManager.error('Sign Up Failed', 'Error');
  //       }
  //     } 
  //   } catch (error) {
  //     NotificationManager.error('Error during sign up', 'Error');
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://realtime-chta-app-backend.vercel.app/register', formData);
      if (response.data.token && response.data.id) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.id);
        const userData = await getUser();
        setUser(userData);
      }
      navigate("/login");
      NotificationManager.success("User registered successfully!", "Success");
      console.log('Registration successful:', response.data);
      // Handle success logic here (e.g., redirect user)
    } catch (error) {
      console.error('Registration error:', error.message);
      // Handle error (e.g., show error message to user)
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
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
          onClick={handleSubmit}
        >
          Sign Up
        </Button>
        <div
          style={{
            marginLeft: 254,
            marginTop: 10,
            fontFamily: "system-ui",
            fontWeight: 600,
            fontSize: 17,
          }}
        >
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
