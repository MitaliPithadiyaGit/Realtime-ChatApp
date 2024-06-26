import React, { useEffect, useState } from "react";
import LeftSide from "./LeftSide";
import RightSide from "./RightSide";
import { useParams } from "react-router-dom";
import { Grid, Paper, Typography } from "@mui/material";
import "./LeftSide.css";

const ChatDashboard = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { id: userId } = useParams();
  const [user, setUser] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const apiUrl = process.env.REACT_APP_API_URL
  const fetchData = async () => {
    const token = localStorage.getItem("token");

    if (!token || !userId) {
      console.error("No token or user ID found in local storage");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const user = await response.json();
      setUser(user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  useEffect(() => {
    const savedUser = localStorage.getItem("selectedUser");
    if (savedUser) {
      setSelectedUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <div>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h5" className="header-message">
            Chat
          </Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper} className="chatSection">
        <LeftSide
          user={user}
          setSelectedUser={setSelectedUser}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
        />
        <RightSide
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          setSelectedUsers={setSelectedUsers}
        />
      </Grid>
    </div>
  );
};

export default ChatDashboard;
