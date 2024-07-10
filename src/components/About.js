import React from 'react';
import icons from '../shared/icons';
import mui from '../shared/mui';

function About({onClose}) {

  return <mui.Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
    <mui.Box><mui.Avatar style={{ width: 100, height: 100 }} src={require('../assets/new.png')}></mui.Avatar></mui.Box>
    <mui.Typography variant="h5" style={{ marginTop: 20 }}>
      CyberWaifu-V2 Desktop
    </mui.Typography>
    <mui.Typography variant="body1" style={{ marginTop: 10 }}>
      Version 1.0.0 (1)
    </mui.Typography>
    <mui.Typography variant="body1" style={{ marginTop: 10 }}>
      A cross-platform desktop client for CyberWaifu-V2
    </mui.Typography>
    <mui.Typography variant="body2" style={{ marginTop: 10 }}>
      Made with love by Jerry Chou, and Naganohara Yoimiya
    </mui.Typography>
    <mui.Button variant="text" color="primary" style={{ marginTop: 20 }} onClick={onClose} startIcon={<icons.ArrowBack />}>
      Back
    </mui.Button>
  </mui.Box>
}

export default About