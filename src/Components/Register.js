import React, { useContext, useState } from "react";
import { registerUser } from "../API/Api";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import { AuthContext } from "../Context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate(); // Use useNavigate hook
  const { setUser } = useContext(AuthContext);
  const { username, email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const response = await registerUser(formData, setUser); // Call your API function to register the user
      if (response.token) {
        localStorage.setItem("token", response.token);

        // Redirect to dashboard after successful registration
        navigate("/dashboard"); // Use navigate to go to the dashboard route
      }
      return response;
    } catch (error) {
      throw new Error("Failed to register user");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      {" "}
      {/* Use handleRegister function for form submission */}
      <input
        type="text"
        name="username"
        value={username}
        onChange={onChange}
        required
      />
      <input
        type="email"
        name="email"
        value={email}
        onChange={onChange}
        required
      />
      <input
        type="password"
        name="password"
        value={password}
        onChange={onChange}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
