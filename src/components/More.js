import React from 'react';
import About from './About';
import fs from '../shared/fs';
import icons from '../shared/icons';
import Mui from '../shared/mui';
import * as Remote from '../shared/remote';
import Message from './Message';
import ContentEditDialog from './ContentEditDialog';

function More() {
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('success')
  const [messageOpen, setMessageOpen] = React.useState(false)
  const [userPersona, setUserPersona] = React.useState('')
  const [userName, setUserName] = React.useState('')
  const [gptSoVitsMiddlewareApiUrl, setGptSoVitsMiddlewareApiUrl] = React.useState('')
  const [showAboutPage, setShowAboutPage] = React.useState(false)

  function handleServiceInfoRefresh() {
    Remote.getServiceInfo().then(r => {
      console.log(r)
      if (r.data.status) {
        setUserPersona(r.data.data.user_persona)
        setUserName(r.data.data.session_username)
        setGptSoVitsMiddlewareApiUrl(r.data.data.gpt_sovits_middleware_url)
      } else {
        setMessageTitle('Error')
        setMessageContent(r.data.message)
        setMessageType('error')
        setMessageOpen(true)
      }
    })
  }


  React.useEffect(() => {
    handleServiceInfoRefresh()
  }, [])


  return <>{!showAboutPage && <Mui.Box sx={{ height: '100%', width: 'calc(100% - 30px)', marginLeft: 30, paddingRight: 30 }}>
    <Mui.Box data-overlayscrollbars-initialize sx={{ height: '100%', overflowY: 'scroll' }}  class='scroll-container'>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />
      <Mui.List style={{ marginTop: 30 }}>
        <ContentEditDialog title="User Name" description={'Set a new user name'} defaultValue={userName} onOk={(value) => {
          setUserName(value)
          Remote.updateUserName(value).then(r => {
            console.log(r)
            if (r.data.status) {
              setMessageTitle('Success')
              setMessageContent('User name updated successfully.')
              setMessageType('success')
              setMessageOpen(true)
            } else {
              setMessageTitle('Error')
              setMessageContent(r.data.message)
              setMessageType('error')
              setMessageOpen(true)
            }
          })
        }} icon={<icons.AccountCircle />} />
        <ContentEditDialog title="User Persona" description={'User persona is used to describe your personality and interests so as to enhance your experience by helping waifu understand you better.'} defaultValue={userPersona} onOk={(value) => {
          Remote.updateUserPersona(value).then(r => {
            console.log(r)
            if (r.data.status) {
              setMessageTitle('Success')
              setMessageContent('User persona updated successfully.')
              setMessageType('success')
              setMessageOpen(true)
            } else {
              setMessageTitle('Error')
              setMessageContent(r.data.message)
              setMessageType('error')
              setMessageOpen(true)
            }
          })
          setUserPersona(value)
        }} icon={<icons.Badge />} />
        <ContentEditDialog title="GPT-SoVits Middleware API URL" description={'Set the URL of the GPT-SoVits middleware API.'} defaultValue={gptSoVitsMiddlewareApiUrl} onOk={(value) => {
          setGptSoVitsMiddlewareApiUrl(value)
          Remote.setMiddlewareUrl(value).then(r => {
            console.log(r)
            if (r.data.status) {
              setMessageTitle('Success')
              setMessageContent('GPT-SoVits middleware API URL updated successfully.')
              setMessageType('success')
              setMessageOpen(true)
            } else {
              setMessageTitle('Error')
              setMessageContent(r.data.message)
              setMessageType('error')
              setMessageOpen(true)
            }
          })
        }} icon={<icons.Cloud />} />
        <Mui.ListItemButton onClick={() => {
          setShowAboutPage(true)
        }}>
          <Mui.ListItemIcon><icons.Info /></Mui.ListItemIcon>
          <Mui.ListItemText primary="About" secondary="CyberWaifu-v2 1.2.0(2)" />
        </Mui.ListItemButton>
      </Mui.List>
    </Mui.Box>
  </Mui.Box>}
    {showAboutPage && <Mui.Box sx={{ height: '100%', width: 'calc(100% - 30px)' }}>
      <About onClose={() => setShowAboutPage(false)} />

    </Mui.Box>}
  </>;
}

export default More;