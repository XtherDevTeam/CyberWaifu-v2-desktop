import React from 'react';

import Mui from '../shared/mui';
import * as Remote from '../shared/remote';

function StickerPicker({ useStickerSet, availableStickers, open, onClose, anchorEl }) {
  return (<>
    <Mui.Popover
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      anchorEl={anchorEl}
      open={open}
      onClose={() => onClose()}
      elevation={1}
    >
      <Mui.Box sx={{maxHeight: '40vh', minHeigth: '20vh', overflowY: 'scroll', minWidth: '10vw', padding: 10}} class='scroll-container'>
        <Mui.List>
          {availableStickers.map((sticker, k) => (
            <Mui.ListItemButton key={k} onClick={() => {
              onClose(sticker.name)
            }}>
              <Mui.ListItemIcon>
                <Mui.Avatar src={Remote.stickerGet(useStickerSet, sticker.name)} sx={{width: 32, height: 32}}/>
              </Mui.ListItemIcon>
              <Mui.ListItemText primary={sticker.name} />
            </Mui.ListItemButton>
          ))}
        </Mui.List>
      </Mui.Box>
    </Mui.Popover>
  </>)
}

export default StickerPicker;