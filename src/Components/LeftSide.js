import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import MoreVert from "@mui/icons-material/MoreVert";
import "./LeftSide.css";

const LeftSide = ({
  user,
  setSelectedUser,
  selectedUser,
  setSelectedUsers,
  selectedUsers,
}) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [dialogSelectedUsers, setDialogSelectedUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const { id: userId } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in local storage");
        return;
      }

      try {
        // Fetch all users except the logged-in user
        const usersResponse = await fetch("http://localhost:5000/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!usersResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const users = await usersResponse.json();
        const filteredUsers = users.filter((user) => user._id !== userId);
        setUsers(filteredUsers);

        // Fetch selected users and their last messages
        const selectedUsersResponse = await fetch(
          "http://localhost:5000/getselectedusers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!selectedUsersResponse.ok) {
          throw new Error("Failed to fetch selected users");
        }

        const selectedUsers = await selectedUsersResponse.json();

        // Fetch last messages for selected users
        const usersWithLastMessages = await Promise.all(
          selectedUsers.map(async (user) => {
            const lastMessageResponse = await fetch(
              `http://localhost:5000/getlastmessage?sender=${userId}&receiver=${user._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!lastMessageResponse.ok) {
              console.error(
                "Failed to fetch last message for user",
                user.username
              );
              return { ...user, lastMessage: null }; // Handle error case gracefully
            }

            const lastMessage = await lastMessageResponse.json();
            return { ...user, lastMessage };
          })
        );

        // Update state with users and their last messages
        setSelectedUsers(usersWithLastMessages);

        // Ensure dialogSelectedUsers is updated only if it's empty

        setDialogSelectedUsers(usersWithLastMessages);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]); // Depend only on userId and dialogSelectedUsers.length

  const handleClickOpen = () => {
    setDialogSelectedUsers(selectedUsers);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggleUser = (user) => {
    setDialogSelectedUsers((prevSelectedUsers) => {
      if (prevSelectedUsers.includes(user)) {
        return prevSelectedUsers.filter((u) => u !== user);
      } else {
        return [...prevSelectedUsers, user];
      }
    });
  };

  const handleOk = async () => {
    setSelectedUsers(dialogSelectedUsers);

    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found in local storage");
      return;
    }

    try {
      await fetch(`http://localhost:5000/selected-users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          selectedUsers: dialogSelectedUsers.map((user) => user._id),
        }),
      });
    } catch (error) {
      console.error("Error updating selected users:", error);
    }

    setOpen(false);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    localStorage.setItem("selectedUser", JSON.stringify(user));
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const filteredUsers = selectedUsers.filter((user) =>
    user.username.toLowerCase().includes(searchInput.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    } else {
      // Manually format the date as dd/mm/yyyy
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  return (
    <Grid item xs={3} className="borderRight500">
      <List>
        <ListItem button key={user?.username}>
          <ListItemIcon>
            <Avatar
              alt={user?.username}
              src={`http://localhost:5000/${user.image}`}
            />
          </ListItemIcon>
          <ListItemText
            primary={
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "1.2em",
                  textTransform: "capitalize",
                  letterSpacing: "0.1rem",
                }}
              >
                {user?.username}
              </span>
            }
          />
          <IconButton onClick={handleClickOpen}>
            <MoreVert />
          </IconButton>
        </ListItem>
      </List>
      <Divider />
      <Grid item xs={12} style={{ padding: "10px" }}>
        <TextField
          id="outlined-basic-email"
          label="Search"
          variant="outlined"
          fullWidth
          value={searchInput}
          onChange={handleSearchInputChange}
        />
      </Grid>
      <Divider />
      <List>
        {filteredUsers.length === 0 ? (
          <ListItem>
            <ListItemText primary="No users found" />
          </ListItem>
        ) : (
          // Sort filteredUsers based on the timestamp of the last message (descending order)

          filteredUsers
            .sort((userA, userB) => {
              // Sorting logic remains unchanged
              if (userA.lastMessage && !userB.lastMessage) {
                return -1;
              }
              if (!userA.lastMessage && userB.lastMessage) {
                return 1;
              }
              if (userA.lastMessage && userB.lastMessage) {
                return (
                  new Date(userB.lastMessage.timestamp) -
                  new Date(userA.lastMessage.timestamp)
                );
              }
              return 0;
            })
            .map((user) => (
              <ListItem
                button
                key={user._id}
                onClick={() => handleUserClick(user)}
                style={{
                  backgroundColor:
                    user._id === selectedUser?._id ? "#f0f0f0" : "inherit",
                }} // Highlight selected user
              >
                <ListItemIcon>
                  <Avatar
                    alt={user.username}
                    src={`http://localhost:5000/${user.image}`}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <span
                      style={{
                        fontWeight: "600",
                        fontSize: "1rem",
                        textTransform: "capitalize",
                        letterSpacing: "0.1rem",
                      }}
                    >
                      {user?.username}
                    </span>
                  }
                  secondary={
                    user.lastMessage
                      ? `${user.lastMessage.sender === userId ? "You: " : ""}${
                          user.lastMessage.message
                        }`
                      : "No messages yet"
                  }
                />
                <ListItemText
                  primary={
                    <span
                      style={{
                        position: "absolute",
                        top: "3px",
                        right: "3px",
                        fontSize: "12px",
                        color: "#999",
                        fontFamily: "math",
                      }}
                    >
                      {user.lastMessage
                        ? `${formatTime(user.lastMessage.timestamp)}`
                        : ""}{" "}
                    </span>
                  }
                />
              </ListItem>
            ))
        )}
      </List>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{"Select Users"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select users from the list below.
          </DialogContentText>
          <List>
            {users.map((user) => (
              <ListItem button key={user._id}>
                <Checkbox
                  checked={dialogSelectedUsers.some(
                    (selectedUser) => selectedUser._id === user._id
                  )}
                  onChange={() => handleToggleUser(user)}
                />
                <ListItemIcon>
                  <Avatar
                    alt={user.username}
                    src={`http://localhost:5000/${user.image}`}
                  />
                </ListItemIcon>
                <ListItemText primary={user.username} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleOk} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default LeftSide;
