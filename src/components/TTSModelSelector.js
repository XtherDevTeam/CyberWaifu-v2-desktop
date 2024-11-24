import * as React from 'react';

import icons from '../shared/icons';
import mui from '../shared/mui';
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
      <mui.ListItemButton style={style} onClick={() => setOpen(true)}>
        <mui.ListItemIcon>
          <icons.Storage />
        </mui.ListItemIcon>
        <mui.ListItemText primary="TTS Models" secondary={value} />
      </mui.ListItemButton>
      <mui.Dialog open={open} onClose={() => setOpen(false)}>
        <mui.DialogTitle>Select TTS model</mui.DialogTitle>
        <mui.DialogContent>
          <mui.DialogContentText>
            Choose a TTS model for character to use during conversation
          </mui.DialogContentText>
          <mui.List>
            {ttsModelList.map(r => (
              <mui.ListItemButton
                key={r.id}

                onClick={() => {
                  onChange(r);
                  setValue(r);
                  setOpen(false);
                }}
              >
                <mui.ListItemIcon>
                  <icons.Storage />
                </mui.ListItemIcon>
                <mui.ListItemText
                  primary={r}
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

export default TTSModelSelector;