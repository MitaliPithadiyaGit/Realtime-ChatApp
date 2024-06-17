import React, { useContext, useState } from 'react';
import { getUser, registerUser } from '../API/Api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    image: null, // Add image field
  });

  const navigate = useNavigate();

  const { username, email, password, image } = formData;

  const onChange = (e) => {
    if (e.target.name === 'image') {
      setFormData({ ...formData, image: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const { setUser } = useContext(AuthContext);

  const handleRegister = async (e) => {
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
        navigate(`/chat-dashboard/${id}`); // Redirect to ChatDashboard
      }
  
      console.log(response);
      return response;
    } catch (error) {
      throw new Error('Failed to register user');
    }
  };
  

  return (
    <form onSubmit={handleRegister}>
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
      <input
        type="file"
        name="image"
        onChange={onChange}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;