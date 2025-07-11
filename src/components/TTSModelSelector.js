import * as React from 'react';

import icons from '../shared/icons';
import Mui from '../shared/mui';
import * as Remote from '../shared/remote';

function TTSModelSelector({ defaultValue, onChange, onErr, style }) {
  const [value, setValue] = React.useState('Select...');
  const [ttsModelList, setTTSModelList] = React.useState([]);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    Remote.getMiddlewareInfo().then(r => {
      if (r.data.status) {
        // get keys of r.data.data.models_path
        let available = Object.keys(r.data.data.models_path);
        setTTSModelList([
          'None',
          ...available,
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
      defaultValue !== value
    ) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  return (
    <>
      <Mui.ListItemButton style={style} onClick={() => setOpen(true)}>
        <Mui.ListItemIcon>
          <icons.Storage />
        </Mui.ListItemIcon>
        <Mui.ListItemText primary="TTS Models" secondary={value} />
      </Mui.ListItemButton>
      <Mui.Dialog open={open} onClose={() => setOpen(false)}>
        <Mui.DialogTitle>Select TTS model</Mui.DialogTitle>
        <Mui.DialogContent>
          <Mui.DialogContentText>
            Choose a TTS model for character to use during conversation
          </Mui.DialogContentText>
          <Mui.List>
            {ttsModelList.map(r => (
              <Mui.ListItemButton
                key={r.id}

                onClick={() => {
                  onChange(r);
                  setValue(r);
                  setOpen(false);
                }}
              >
                <Mui.ListItemIcon>
                  <icons.Storage />
                </Mui.ListItemIcon>
                <Mui.ListItemText
                  primary={r}
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

export default TTSModelSelector;