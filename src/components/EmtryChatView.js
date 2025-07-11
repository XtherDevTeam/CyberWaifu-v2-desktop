import React from 'react';

import icons from '../shared/icons';
import Mui from '../shared/mui';

function EmptyChatView() {

  return <Mui.Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
    <Mui.Box><icons.ChatBubble fontSize='large' /></Mui.Box>
    <Mui.Typography variant="h5" style={{ marginTop: 20 }}>
      Touch a friend to start chatting
    </Mui.Typography>

  </Mui.Box>
}

export default EmptyChatView