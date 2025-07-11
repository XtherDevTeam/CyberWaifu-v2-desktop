import * as React from 'react';

import Mui from '../shared/mui';

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
      <Mui.ListItemButton
        style={style}
        primaryText="Sticker set"
        secondaryText={value}
        onClick={() => setStatus(true)}
      >
        <Mui.ListItemIcon>
          <icons.EmojiEmotions />
        </Mui.ListItemIcon>
        <Mui.ListItemText primary="Sticker set" secondary={value} />
      </Mui.ListItemButton>
      <Mui.Portal>
        <Mui.Dialog open={status} onClose={() => setStatus(false)}>
          <Mui.DialogTitle>Select sticker set</Mui.DialogTitle>
          <Mui.DialogContent data-overlayscrollbars-initialize>
            <Mui.Typography variant="body2">
              Choose a sticker set for character to use during conversation
            </Mui.Typography>
            <Mui.List sx={{ maxHeight: '40vh', overflow: 'scroll' }} data-overlayscrollbars-initialize>
              {stickerList.map((r) => (
                <Mui.ListItemButton
                  key={r.id}
                  primaryText={r.setName}
                  onClick={() => {
                    onChange(r);
                    setValue(r.setName);
                    setStatus(false);
                  }}
                >
                  <Mui.ListItemIcon sx={{ padding: 5 }}>
                    <Mui.Avatar sizes='48px' src={Remote.stickerGet(r.id, r.previewSticker)} />
                  </Mui.ListItemIcon>
                  <Mui.ListItemText primary={r.setName} />
                </Mui.ListItemButton>
              ))}
            </Mui.List>
          </Mui.DialogContent>
          <Mui.DialogActions>
            <Mui.Button onClick={() => setStatus(false)}>Close</Mui.Button>
          </Mui.DialogActions>
        </Mui.Dialog>
      </Mui.Portal>
    </>
  );
}

export default StickerSetSelector;