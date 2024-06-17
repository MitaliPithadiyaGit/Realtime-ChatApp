import React, { useState, useEffect } from 'react';
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Checkbox,
  makeStyles
} from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import { useParams } from 'react-router-dom';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  chatSection: {
    width: '100%',
    height: '80vh'
  },
  headBG: {
      backgroundColor: '#e0e0e0'
  },
  borderRight500: {
      borderRight: '1px solid #e0e0e0'
  },
  messageArea: {
    height: '70vh',
    overflowY: 'auto'
  }
});

const LeftSide = ({ user,setSelectedUser }) => {
    console.log(user,"userl");
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  console.log(users,"users");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [dialogSelectedUsers, setDialogSelectedUsers] = useState([]);
  console.log(selectedUsers, "selectedUsers");
  const {id:userId} = useParams();
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
  
      if (!token) {
        console.error('No token found in local storage');
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:5000/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
  
        const users = await response.json();
        const filteredUsers = users.filter(user => user._id !== userId);
        setUsers(filteredUsers);
  
        // Fetch selected users from the database
        const selectedResponse = await fetch(`http://localhost:5000/getselectedusers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!selectedResponse.ok) {
          throw new Error('Failed to fetch selected users');
        }
  
        const selectedUsers = await selectedResponse.json();
        setSelectedUsers(selectedUsers);
        setDialogSelectedUsers(selectedUsers);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, []);
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
  
    const token = localStorage.getItem('token');
  
    if (!token) {
      console.error('No token found in local storage');
      return;
    }
  
    try {
      await fetch(`http://localhost:5000/selected-users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ selectedUsers: dialogSelectedUsers.map(user => user._id) }),
      });
    } catch (error) {
      console.error('Error updating selected users:', error);
    }
  
    setOpen(false);
  };
  
  
  const handleUserClick = (user) => {
    setSelectedUser(user);
    localStorage.setItem('selectedUser', JSON.stringify(user));
  };
 

  

  return (
    <Grid item xs={3} className={classes.borderRight500}>
      <List>
        <ListItem button key={user?.username}>
          <ListItemIcon>
            <Avatar alt={user?.username} src={`http://localhost:5000/${user.image}`} />
          </ListItemIcon>
          <ListItemText primary={user?.username} />
          <IconButton onClick={handleClickOpen}>
            <MoreVert />
          </IconButton>
        </ListItem>
      </List>
      <Divider />
      <Grid item xs={12} style={{ padding: '10px' }}>
        <TextField id="outlined-basic-email" label="Search" variant="outlined" fullWidth />
      </Grid>
      <Divider />
      <List>
        {selectedUsers.map((user) => (
          <ListItem button key={user._id}  onClick={() => handleUserClick(user)}>
            <ListItemIcon>
              <Avatar alt={user.username} src={`http://localhost:5000/${user.image}`} />
            </ListItemIcon>
            <ListItemText primary={user.username} />
          </ListItem>
        ))}
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
            checked={dialogSelectedUsers.some(selectedUser => selectedUser._id === user._id)}
            onChange={() => handleToggleUser(user)}
          />
          <ListItemIcon>
            <Avatar alt={user.username} src={`http://localhost:5000/${user.image}`} />
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
  )
}

export default LeftSide;
