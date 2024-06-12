import axios from "axios";

const API_URL = "http://localhost:5000"; // Adjust according to your backend URL

export const registerUser = async (userData, setUser) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      const userData = await getUser();
      setUser(userData);
    }
    return response.data;
  } catch (error) {
    throw new Error("Failed to register user");
  }
};

export const loginUser = async (userData, setUser) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      const userData = await getUser();
      setUser(userData);
    }
    return response.data;
  } catch (error) {
    throw new Error("Failed to login");
  }
};

export const getUser = async () => {
  const token = localStorage.getItem("token"); // Get token from localStorage
  if (!token) {
    throw new Error("No token found");
  }

  try {
    const response = await axios.get(`${API_URL}/user`, {
      headers: {
        "x-auth-token": token, // Use the token in the request header
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch user data");
  }
};
