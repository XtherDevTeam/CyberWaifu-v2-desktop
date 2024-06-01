import * as React from 'react';

import icons from '../shared/icons';
import mui from '../shared/mui';
import * as Remote from '../shared/remote';

function TTSServiceSelector({ defaultValue, onChange, onErr, style }) {
  const [value, setValue] = React.useState('Select...');
  const [ttsServiceList, setTTSServiceList] = React.useState([]);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    Remote.getTTSServiceList().then(r => {
      if (r.data.status) {
        setTTSServiceList([
          {
            id: 0,
            name: 'None',
            description: 'Do not use TTS service during conversation',
          },
          ...r.data.data,
        ]);
      } else {
        onErr(r.data.data);
      }
    }).catch(r => {
      onErr('NetworkError');
    });
  }, []);

  React.useEffect(() => {
    console.log(defaultValue, value);
    if (
      defaultValue !== undefined &&
      defaultValue !== null &&
      defaultValue.name !== value
    ) {
      setValue(defaultValue.name);
    }
  }, [defaultValue]);

  return (
    <>
      <mui.ListItemButton style={style} onClick={() => setOpen(true)}>
        <mui.ListItemIcon>
          <icons.Storage />
        </mui.ListItemIcon>
        <mui.ListItemText primary="TTS Service" secondary={value} />
      </mui.ListItemButton>
      <mui.Dialog open={open} onClose={() => setOpen(false)}>
        <mui.DialogTitle>Select TTS Service</mui.DialogTitle>
        <mui.DialogContent>
          <mui.DialogContentText>
            Choose a TTS service for character to use during conversation
          </mui.DialogContentText>
          <mui.List>
            {ttsServiceList.map(r => (
              <mui.ListItemButton
                key={r.id}

                onClick={() => {
                  onChange(r);
                  setValue(r.name);
                  setOpen(false);
                }}
              >
                <mui.ListItemIcon>
                  <icons.Storage />
                </mui.ListItemIcon>
                <mui.ListItemText
                  primary={r.name}
                  secondary={r.description}
                />
              </mui.ListItemButton>
            ))}
          </mui.List>
        </mui.DialogContent>
        <mui.DialogActions>
          <mui.Button onClick={() => setOpen(false)}>Close</mui.Button>
        </mui.DialogActions>
      </mui.Dialog>
    </>
  );
}

export default TTSServiceSelector;