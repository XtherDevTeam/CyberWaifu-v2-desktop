import React from 'react';

import { Close } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  IconButton,
  Snackbar,
} from '@mui/material';

const Message = ({ title, message, type, dismiss, open }) => {

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={() => { dismiss() }}>
      <Alert severity={type} action={
        <IconButton aria-label="close" color="inherit" size="small" onClick={() => { dismiss() }}>
          <Close fontSize="inherit" />
        </IconButton>
      }>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Message;