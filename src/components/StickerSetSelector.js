import * as React from 'react';

import * as mui from '@mui/material';

import icons from '../shared/icons';
import * as Remote from '../shared/remote';

function StickerSetSelector({ defaultValue, onChange, onErr, style }) {
  const [value, setValue] = React.useState('Select...');
  const [stickerList, setStickerList] = React.useState([]);
  const [status, setStatus] = React.useState(false);
  const inputRef = React.useRef(null);
  const scrollHeight = 0.5 * window.innerHeight;

  React.useEffect(() => {
    Remote.stickerSetList()
      .then((r) => {
        if (r.data.status) {
          setStickerList(r.data.data);
        } else {
          onErr(r.data.data);
        }
      })
      .catch((r) => {
        onErr('NetworkError');
      });
  }, []);

  React.useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== null) {
      console.log(defaultValue);
      setValue(defaultValue.setName);
    }
  }, [defaultValue]);

  return (
    <>
      <mui.ListItemButton
        style={style}
        primaryText="Sticker set"
        secondaryText={value}
        onClick={() => setStatus(true)}
      >
        <mui.ListItemIcon>
          <icons.EmojiEmotions />
        </mui.ListItemIcon>
        <mui.ListItemText primary="Sticker set" secondary={value} />
      </mui.ListItemButton>
      <mui.Portal>
        <mui.Dialog open={status} onClose={() => setStatus(false)}>
          <mui.DialogTitle>Select sticker set</mui.DialogTitle>
          <mui.DialogContent>
            <mui.Typography variant="body2">
              Choose a sticker set for character to use during conversation
            </mui.Typography>
            <mui.List sx={{ maxHeight: '40vh', overflow: 'scroll' }}>
              {stickerList.map((r) => (
                <mui.ListItemButton
                  key={r.id}
                  primaryText={r.setName}
                  onClick={() => {
                    onChange(r);
                    setValue(r.setName);
                    setStatus(false);
                  }}
                >
                  <mui.ListItemIcon sx={{ padding: 5 }}>
                    <mui.Avatar sizes='48px' src={Remote.stickerGet(r.id, r.previewSticker)} />
                  </mui.ListItemIcon>
                  <mui.ListItemText primary={r.setName} />
                </mui.ListItemButton>
              ))}
            </mui.List>
          </mui.DialogContent>
          <mui.DialogActions>
            <mui.Button onClick={() => setStatus(false)}>Close</mui.Button>
          </mui.DialogActions>
        </mui.Dialog>
      </mui.Portal>
    </>
  );
}

export default StickerSetSelector;