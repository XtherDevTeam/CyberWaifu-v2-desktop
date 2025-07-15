import React from 'react';
import icons from '../shared/icons';
import Mui from '../shared/mui';

function About({onClose}) {

  return <Mui.Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
    <Mui.Box><Mui.Avatar style={{ width: 100, height: 100 }} src={require('../assets/new.png')}></Mui.Avatar></Mui.Box>
    <Mui.Typography variant="h5" style={{ marginTop: 20 }}>
      CyberWaifu-V2 Desktop
    </Mui.Typography>
    <Mui.Typography variant="body1" style={{ marginTop: 10 }}>
      Version 1.3.0 (3)
    </Mui.Typography>
    <Mui.Typography variant="body1" style={{ marginTop: 10 }}>
      A cross-platform desktop client for CyberWaifu-V2
    </Mui.Typography>
    <Mui.Typography variant="body2" style={{ marginTop: 10 }}>
      Made with love by Jerry Chou, and Naganohara Yoimiya
    </Mui.Typography>
    <Mui.Button variant="text" color="primary" style={{ marginTop: 20 }} onClick={onClose} startIcon={<icons.ArrowBack />}>
      Back
    </Mui.Button>
  </Mui.Box>
}

export default About