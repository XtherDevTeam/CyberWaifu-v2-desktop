import React from 'react';

import mui from '../shared/mui';

function ContentEditDialog({ defaultValue, onOk, title, description, icon }) {
  const [value, setValue] = React.useState(defaultValue)
  const [state, setState] = React.useState(false)

  React.useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  return <>
    <mui.Dialog open={state} onClose={() => setState(false)}>
      <mui.DialogTitle>Edit</mui.DialogTitle>
      <mui.DialogContent sx={{minWidth: '50vw', maxWidth: '80vw'}}>
        <mui.Typography variant='body1'>
          {description}
        </mui.Typography>
        <mui.TextField sx={{marginTop: '1em'}} label={title} value={value} multiline maxRows={6} onChange={(e) => setValue(e.target.value)} variant='outlined' fullWidth></mui.TextField>
      </mui.DialogContent>
      <mui.DialogActions>
        <mui.Button variant='text' onClick={() => setState(false)}>
          Cancel
        </mui.Button>
        <mui.Button variant='text' onClick={() => {
          onOk(value)
          setState(false)
        }}>
          Save
        </mui.Button>
      </mui.DialogActions>
    </mui.Dialog>
    <mui.ListItemButton onClick={() => setState(true)}>
      <mui.ListItemIcon>
        {icon}
      </mui.ListItemIcon>
      <mui.ListItemText primary={title} secondary={defaultValue} secondaryTypographyProps={{textOverflow: 'ellipsis', overflow: 'hidden', width: '100%', maxHeight: '3em'}} />
    </mui.ListItemButton></>
}

export default ContentEditDialog