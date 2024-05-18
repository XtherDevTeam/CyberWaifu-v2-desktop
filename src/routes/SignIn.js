import React from 'react';

import Message from '../components/Message';
import mui from '../shared/mui';
import * as Remote from '../shared/remote';
import * as storage from '../shared/storage';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

function SignIn() {
  const [serverUrl, setServerUrl] = React.useState('')
  const [stage, setStage] = React.useState(0)
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')

  // message related
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('')
  const [messageOpen, setMessageOpen] = React.useState(false)

  React.useEffect(() => {
    storage.inquireItem('serverAddress', (r, v) => {
      setServerUrl(v)
    })
  }, [])

  React.useEffect(() => {
    if (serverUrl !== '') {
      storage.setItem('serverAddress', serverUrl, () => Remote.refreshServerUrl())
    }
  }, [serverUrl])

  const handleFirstStage = () => {
    Remote.checkIfInitialized().then(r => {
      if (r) {
        Remote.getUserName().then(r => {
          setUsername(r)
          setStage(1)
        }).catch(e => {
          setMessageTitle('Error')
          setMessageContent(e.message)
          setMessageType('error')
          setMessageOpen(true)
        })
      } else {
        setStage(2)
      }
    }).catch(e => {
      setMessageTitle('Error')
      setMessageContent(e.message)
      setMessageType('error')
      setMessageOpen(true)
    })

  }

  const handleSecondStage = () => {
    Remote.signIn(password).then(r => {
      if (r.data.status) {
        setTimeout(() => {
          window.api.invoke('resize-window-normal')
          window.location.href = '/'
        }, 1000)
        setMessageTitle('Success')
        setMessageContent('Signed in successfully, redirecting...')
        setMessageType('success')
        setMessageOpen(true)
      } else {
        setMessageTitle('Error')
        setMessageContent(r.data.data)
        setMessageType('error')
        setMessageOpen(true)
      }
    }).catch(e => {
      setMessageTitle('Error')
      setMessageContent(e.message)
      setMessageType('error')
      setMessageOpen(true)
    })
  }

  return (
    <mui.Paper elevation={1} style={{ position: 'absolute', display: 'flex', height: '100vh', width: '100vw' }}>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />
      <mui.Grid container style={{ justifySelf: 'center' }} direction="column" justifyContent="center" alignItems="center" rowSpacing={2}>
        <mui.Grid item>
          <mui.Avatar src={require('../assets/new.png')} sx={{ width: 72, height: 72 }}></mui.Avatar>
        </mui.Grid>
        <mui.Grid item>
          {stage === 0 && <mui.Typography variant='h5'>Welcome to CyberWaifu-V2</mui.Typography>}
          {stage === 1 && <mui.Typography variant='h5'>Welcome back, {username}!</mui.Typography>}
        </mui.Grid>
        <mui.Grid item style={{ width: '90%' }}>
          {stage === 0 && <mui.TextField style={{ width: '100%' }} label="Server Url" placeholder={'http://www.xiaokang00010.top:6210/'} value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} />}
          {stage === 1 && <mui.TextField style={{ width: '100%' }} label="Password" type='password' placeholder={'Enter your password here...'} value={password} onChange={(e) => setPassword(e.target.value)} />}
        </mui.Grid>
        <mui.Grid item style={{ width: '90%' }}>
          {stage === 0 && <mui.Button variant="contained" color="primary" style={{ width: '100%' }}
            onClick={() => {
              handleFirstStage()
            }}>Sign In</mui.Button>}
          {stage === 1 && <mui.Button variant="contained" color="primary" style={{ width: '100%' }}
            onClick={() => {
              handleSecondStage()
            }}>Sign In</mui.Button>}
        </mui.Grid>
        <mui.Grid item>
          <mui.Typography variant='body2'>Fireworks are for now, but friends are forever!</mui.Typography>
        </mui.Grid>
        <mui.Grid item>
          <div style={{ height: '48px' }}></div>
        </mui.Grid>
      </mui.Grid>
    </mui.Paper>
  )
}

export default SignIn;