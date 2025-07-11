import React from 'react';

import Mui from '../shared/mui';

function ContentEditDialog({ defaultValue, onOk, title, description, icon }) {
  const [value, setValue] = React.useState(defaultValue)
  const [state, setState] = React.useState(false)

  React.useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  return <>
    <Mui.Dialog open={state} onClose={() => setState(false)}>
      <Mui.DialogTitle>Edit</Mui.DialogTitle>
      <Mui.DialogContent sx={{minWidth: '50vw', maxWidth: '80vw'}}>
        <Mui.Typography variant='body1'>
          {description}
        </Mui.Typography>
        <Mui.TextField sx={{marginTop: '1em'}} label={title} value={value} multiline maxRows={6} onChange={(e) => setValue(e.target.value)} variant='outlined' fullWidth></Mui.TextField>
      </Mui.DialogContent>
      <Mui.DialogActions>
        <Mui.Button variant='text' onClick={() => setState(false)}>
          Cancel
        </Mui.Button>
        <Mui.Button variant='text' onClick={() => {
          onOk(value)
          setState(false)
        }}>
          Save
        </Mui.Button>
      </Mui.DialogActions>
    </Mui.Dialog>
    <Mui.ListItemButton onClick={() => setState(true)}>
      <Mui.ListItemIcon>
        {icon}
      </Mui.ListItemIcon>
      <Mui.ListItemText primary={title} secondary={defaultValue} secondaryTypographyProps={{textOverflow: 'ellipsis', overflow: 'hidden', width: '100%', maxHeight: '3em'}} />
    </Mui.ListItemButton></>
}

export default ContentEditDialog