import '@livekit/components-styles';

import React from 'react';

import { usePrefersColorScheme } from 'use-prefers-color-scheme';

import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';

import Message from '../components/Message';
import Mui from '../shared/mui';
import * as Remote from '../shared/remote';
import theme from '../shared/theme';

function VoiceChat() {
  const [accessToken, setAccessToken] = React.useState('')
  const [remoteUrl, setRemoteUrl] = React.useState('')
  const [sessionName, setSessionName] = React.useState('')

  // alert api
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('success')
  const [messageOpen, setMessageOpen] = React.useState(false)
  const [connect, setConnect] = React.useState(false)

  // const liveKitRoom = useRoomContext()
  // const livekitRoomState = null


  React.useEffect(() => {
    const p = new URLSearchParams(window.location.hash.substring(window.location.hash.indexOf('?')));
    console.log('called')
    if (!p.get('charName')) {
      setMessageTitle('Error')
      setMessageContent('Invalid URL')
      setMessageType('error')
      setMessageOpen(true)
      return
    }
    Remote.rtVcEstablish(p.get('charName')).then(data => {
      if (data.data.status) {
        setAccessToken(data.data.data.token)
        setRemoteUrl(data.data.data.url)
        setSessionName(data.data.data.session)
      } else {
        setMessageTitle('Error')
        setMessageContent(data.data.data)
        setMessageType('error')
        setMessageOpen(true)
      }
    }).catch(err => {
      setMessageTitle('Error')
      setMessageContent(err.message)
      setMessageType('error')
      setMessageOpen(true)
    })

  }, [])

  React.useEffect(() => {
    if (accessToken !== '') {
      setConnect(true)
    }
  }, [accessToken])

  React.useEffect(() => {
    if (sessionName !== '' && !connect) {
      /*Remote.rtVcTerminate(sessionName).then(data => {
        if (data.data.status) {
          setConnect(false)
        } else {
          setMessageTitle('Error')
          setMessageContent(data.data.data)
          setMessageType('error')
          setMessageOpen(true)
        }
      }).catch(err => {
        setMessageTitle('Error')
        setMessageContent(err.message)
        setMessageType('error')
        setMessageOpen(true)
      })*/
      //  window.close()

    }
  }, [connect])

  return <Mui.Box style={{ position: 'absolute', top: 0, left: 0, height: '100vh', width: '100vw', backgroundColor: usePrefersColorScheme() == 'light' ? theme.light.palette.surfaceContainer.main : theme.dark.palette.surfaceContainer.main }}>
    <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />
    <LiveKitRoom data-lk-theme="default" options={{
      publishDefaults: {
        red: false,
      },
      videoCaptureDefaults:
      {
        resolution: {
          width: 1280,
          height: 720,
          frameRate: 10,
        }
      },
      disconnectOnPageLeave: true,
    }} serverUrl={`wss://${remoteUrl}`} token={accessToken} connect={connect}
      onDisconnected={() => {
        console.log('disconnected')
        setConnect(false)
      }}
      audio={true}
      video={false}
    >
      <VideoConference></VideoConference>
    </LiveKitRoom>
  </Mui.Box>
}

export default VoiceChat