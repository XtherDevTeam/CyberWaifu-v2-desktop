import React from 'react';

import icons from '../shared/icons';
import mui from '../shared/mui';

function EmptyChatView() {

  return <mui.Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
    <mui.Box><icons.ChatBubble fontSize='large' /></mui.Box>
    <mui.Typography variant="h5" style={{ marginTop: 20 }}>
      Touch a friend to start chatting
    </mui.Typography>

  </mui.Box>
}

export default EmptyChatView