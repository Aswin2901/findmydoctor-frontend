import { Avatar, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import React from 'react'
import ImageIcon from '@mui/icons-material/Image';
import { Link } from 'react-router-dom';

function UserItem(props) {
    const UserURL = `user ${props.id}`
  return (
    <Link to= {UserURL} >
        <ListItem>
            <ListItemAvatar>
                <Avatar>
                    <ImageIcon></ImageIcon>
                </Avatar>
            </ListItemAvatar>
            <ListItemText primary={props.name} >

            </ListItemText>
        </ListItem>
    </Link>

    
  )
}

export default UserItem
