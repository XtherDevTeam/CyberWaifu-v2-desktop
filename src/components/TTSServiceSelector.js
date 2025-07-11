import * as React from 'react';

import icons from '../shared/icons';
import Mui from '../shared/mui';
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
      <Mui.ListItemButton style={style} onClick={() => setOpen(true)}>
        <Mui.ListItemIcon>
          <icons.Storage />
        </Mui.ListItemIcon>
        <Mui.ListItemText primary="TTS Service" secondary={value} />
      </Mui.ListItemButton>
      <Mui.Dialog open={open} onClose={() => setOpen(false)}>
        <Mui.DialogTitle>Select TTS Service</Mui.DialogTitle>
        <Mui.DialogContent>
          <Mui.DialogContentText>
            Choose a TTS service for character to use during conversation
          </Mui.DialogContentText>
          <Mui.List>
            {ttsServiceList.map(r => (
              <Mui.ListItemButton
                key={r.id}

                onClick={() => {
                  onChange(r);
                  setValue(r.name);
                  setOpen(false);
                }}
              >
                <Mui.ListItemIcon>
                  <icons.Storage />
                </Mui.ListItemIcon>
                <Mui.ListItemText
                  primary={r.name}
                  secondary={r.description}
                />
              </Mui.ListItemButton>
            ))}
          </Mui.List>
        </Mui.DialogContent>
        <Mui.DialogActions>
          <Mui.Button onClick={() => setOpen(false)}>Close</Mui.Button>
        </Mui.DialogActions>
      </Mui.Dialog>
    </>
  );
}

export default TTSServiceSelector;