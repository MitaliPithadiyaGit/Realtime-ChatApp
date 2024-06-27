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

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData(); // Create a new FormData instance
      formDataToSend.append("username", username);
      formDataToSend.append("email", email);
      formDataToSend.append("password", password);

      const response = await registerUser(formDataToSend);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.id);
        // Store user ID in localStorage
        const id = response.data.id;
        const userData = await getUser();
        setUser(
          userData
          // image: URL.createObjectURL(image)
        );
        console.log(image);
        NotificationManager.success("User registered successfully!", "Success");
        navigate(`/chat-dashboard/${id}`); // Redirect to ChatDashboard
      }

      console.log(response);
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to register user";
      NotificationManager.error(errorMessage, "Error");
      throw new Error("Failed to register user");
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
          onClick={handleSignUp}
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
