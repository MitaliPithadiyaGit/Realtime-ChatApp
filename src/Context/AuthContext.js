import React, { createContext, useState, useEffect } from "react";
import { getUser } from "../API/Api";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  console.log(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await getUser();
          setUser(userData);
          console.log(userData,"userData");
        } catch (err) {
          console.error(err.message);
          // Handle error
        }
      } else {
        console.log("No token found");
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
