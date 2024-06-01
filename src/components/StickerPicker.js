import React from 'react';

import mui from '../shared/mui';
import * as Remote from '../shared/remote';

function StickerPicker({ useStickerSet, availableStickers, open, onClose, anchorEl }) {
  return (<>
    <mui.Popover
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
      <mui.Box sx={{maxHeight: '40vh', minHeigth: '20vh', overflowY: 'scroll', minWidth: '10vw', padding: 10}}>
        <mui.List>
          {availableStickers.map((sticker, k) => (
            <mui.ListItemButton key={k} onClick={() => {
              onClose(sticker.name)
            }}>
              <mui.ListItemIcon>
                <mui.Avatar src={Remote.stickerGet(useStickerSet, sticker.name)} sx={{width: 32, height: 32}}/>
              </mui.ListItemIcon>
              <mui.ListItemText primary={sticker.name} />
            </mui.ListItemButton>
          ))}
        </mui.List>
      </mui.Box>
    </mui.Popover>
  </>)
}

export default StickerPicker;