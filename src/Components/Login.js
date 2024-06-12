import React, { useContext, useState } from "react";
import { loginUser } from "../API/Api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const history = useNavigate();

  const { email, password } = formData;
  const { setUser } = useContext(AuthContext);
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData, setUser);
      console.log(response);
      if (response.token) {
        localStorage.setItem("token", response.token);

        // Redirect to dashboard after successful registration
        history("/dashboard"); // Use navigate to go to the dashboard route
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <form onSubmit={onSubmit}>
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
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
