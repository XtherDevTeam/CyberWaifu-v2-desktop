import React from 'react';

import fs from '../shared/fs';
import icons from '../shared/icons';
import mui from '../shared/mui';
import * as Remote from '../shared/remote';
import Message from './Message';

function AddReferenceAudioDialog({ state, onOk, onCancel, serviceID }) {
  let [refAudioPath, setRefAudioPath] = React.useState('')
  let [name, setName] = React.useState('')
  let [text, setText] = React.useState('')
  let [language, setLanguage] = React.useState('')

  return <mui.Dialog open={state} onClose={onCancel}>
    <mui.DialogTitle>Add Reference Audio</mui.DialogTitle>
    <mui.DialogContent>
      <mui.DialogContentText>
        The path to the reference audio file is the relative path of the audio file from the TTS service endpoint.
        You might add the audio file to the TTS service endpoint manually before using it.
      </mui.DialogContentText>
      <mui.TextField fullWidth style={{ marginTop: 10 }} label="Name" value={name} onChange={(e) => {
        setName(e.target.value)
      }} />
      <mui.TextField fullWidth style={{ marginTop: 10 }} label="Text" value={text} onChange={(e) => {
        setText(e.target.value)
      }} />
      <mui.TextField fullWidth style={{ marginTop: 10 }} label="Language" value={language} onChange={(e) => {
        setLanguage(e.target.value)
      }} />
      <mui.TextField fullWidth style={{ marginTop: 10 }} label="Audio File Path" value={refAudioPath} onChange={(e) => {
        setRefAudioPath(e.target.value)
      }} />
    </mui.DialogContent>
    <mui.DialogActions>
      <mui.Button onClick={onCancel}>Cancel</mui.Button>
      <mui.Button onClick={() => {
        onOk(name, text, language, refAudioPath)
      }}>Add</mui.Button>
    </mui.DialogActions>
  </mui.Dialog>
}

function EditTTSServiceDialog({ state, serviceID, onOk, onCancel }) {
  let [messageTitle, setMessageTitle] = React.useState('')
  let [messageContent, setMessageContent] = React.useState('')
  let [messageType, setMessageType] = React.useState('success')
  let [messageOpen, setMessageOpen] = React.useState(false)

  let [service, setService] = React.useState({
    id: null,
    name: '',
    description: '',
    ttsInferYamlPath: ''
  })
  let [name, setName] = React.useState(service.name)
  let [url, setUrl] = React.useState('')
  let [description, setDescription] = React.useState(service.description)
  let [ttsInferYamlPath, setTTSInferYamlPath] = React.useState(service.ttsInferYamlPath)
  let [currentTab, setCurrentTab] = React.useState(0)
  let [addReferencAudioDialogState, setAddReferencAudioDialogState] = React.useState(false)

  function refreshServiceInfo() {
    Remote.getTTSServiceInfo(serviceID).then(r => {
      if (r.data.status) {
        setService(r.data.data)
        setName(r.data.data.name)
        setDescription(r.data.data.description)
        setTTSInferYamlPath(r.data.data.ttsInferYamlPath)
        setUrl(r.data.data.url)
      } else {
        setMessageTitle('Error')
        setMessageContent(r.data.data)
        setMessageType('error')
        setMessageOpen(true)
      }
    }).catch(e => {
      console.error(e)
    })
  }

  React.useEffect(() => {
    if (serviceID && state) {
      refreshServiceInfo()
    }
  }, [serviceID, state])

  return <mui.Dialog open={state} onClose={onCancel}>
    <AddReferenceAudioDialog state={addReferencAudioDialogState} onOk={(name, text, language, refAudioPath) => {
      Remote.addTTSReferenceAudio(serviceID, name, text, language, refAudioPath).then(r => {
        if (r.data.status) {
          refreshServiceInfo()
          setMessageTitle('Success')
          setMessageContent('Reference audio added successfully.')
          setMessageType('success')
          setMessageOpen(true)
        } else {
          setMessageTitle('Error')
          setMessageContent(r.data.data)
          setMessageType('error')
          setMessageOpen(true)
        }
      })
      setAddReferencAudioDialogState(false)
    }} onCancel={() => {
      setAddReferencAudioDialogState(false)
    }} serviceID={serviceID} />
    <mui.DialogTitle>Edit TTS Service</mui.DialogTitle>
    <mui.DialogContent style={{ height: '60vh', width: '50vw' }}>
      <mui.Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <mui.Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <mui.Tab label="Edit Info" />
          <mui.Tab label="Reference Audios" />
        </mui.Tabs>
      </mui.Box>
      {currentTab === 0 && <mui.Box><mui.TextField fullWidth style={{ marginTop: 20 }} label="Name" value={name} onChange={(e) => {
        setName(e.target.value)
      }} />
        <mui.TextField fullWidth style={{ marginTop: 10 }} label="Description" value={description} onChange={(e) => {
          setDescription(e.target.value)
        }} />
        <mui.TextField fullWidth style={{ marginTop: 10 }} label="TTS Service Endpoint" value={url} onChange={(e) => {
          setUrl(e.target.value)
        }} />
        <mui.TextField fullWidth style={{ marginTop: 10 }} label="TTS Infer Yaml Path" value={ttsInferYamlPath} onChange={(e) => {
          setTTSInferYamlPath(e.target.value)
        }} /></mui.Box>}
      {currentTab === 1 && <mui.Box style={{ display: 'flex', flexDirection: 'column', height: '85%' }}>
        <mui.List style={{ flex: 1, overflowY: 'scroll' }} data-overlayscrollbars-initialize>
          {service.reference_audios.map((audio, index) => <mui.ListItem key={index} style={{ marginTop: 10 }}>
            <mui.ListItemText primary={audio.name} secondary={audio.text} />
            <mui.ListItemSecondaryAction>
              <mui.IconButton edge="end" aria-label="delete" onClick={() => {
                Remote.deleteTTSReferenceAudio(audio.id).then(r => {
                  if (r.data.status) {
                    refreshServiceInfo()
                    setMessageTitle('Success')
                    setMessageContent('Reference audio deleted successfully.')
                    setMessageType('success')
                    setMessageOpen(true)
                  } else {
                    setMessageTitle('Error')
                    setMessageContent(r.data.data)
                    setMessageType('error')
                    setMessageOpen(true)
                  }
                })
              }}><icons.Delete color="secondary" /></mui.IconButton>
            </mui.ListItemSecondaryAction>
          </mui.ListItem>
          )}
        </mui.List>
        <mui.Button variant="contained" color="primary" style={{ marginTop: 10 }} onClick={() => {
          setAddReferencAudioDialogState(true)
        }} startIcon={<icons.Add />}>Add Reference Audio</mui.Button>
      </mui.Box>}

    </mui.DialogContent>
    <mui.DialogActions>
      <mui.Button onClick={onCancel}>Cancel</mui.Button>
      <mui.Button onClick={() => {
        Remote.updateTTSService(serviceID, name, description, url, ttsInferYamlPath).then(r => {
          if (r.data.status) {
            refreshServiceInfo()
            setMessageTitle('Success')
            setMessageContent('TTS service updated successfully.')
            setMessageType('success')
            setMessageOpen(true)
          } else {
            setMessageTitle('Error')
            setMessageContent(r.data.data)
            setMessageType('error')
            setMessageOpen(true)
          }
        }).catch(e => {
          console.error(e)
        })
      }}>Save</mui.Button>
    </mui.DialogActions>
  </mui.Dialog>
}

function TTSServicesView() {
  const [TTSServices, setTTSServices] = React.useState([]);
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('success')
  const [messageOpen, setMessageOpen] = React.useState(false)

  const [editTTSServiceDialogState, setEditTTSServiceDialogState] = React.useState(false)
  const [editTTSServerDialogServiceID, setEditTTSServerDialogServiceID] = React.useState(null)

  React.useEffect(() => {
    Remote.getTTSServiceList().then(r => {
      if (r.data.status) {
        console.log(r.data.data)
        setTTSServices(r.data.data)
      } else {
        setMessageTitle('Error')
        setMessageContent(r.data.data)
        setMessageType('error')
        setMessageOpen(true)
      }
    }).catch(e => {
      console.error(e)
    })
  }, [])
  return <mui.Box sx={{ height: '100%', width: 'calc(100% - 30px)', marginLeft: 30 }}>
    <mui.Box data-overlayscrollbars-initialize sx={{ height: '100%', overflowY: 'scroll' }}>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />
      <EditTTSServiceDialog state={editTTSServiceDialogState} serviceID={editTTSServerDialogServiceID} onOk={(v) => {
        setEditTTSServiceDialogState(false)
        setEditTTSServerDialogServiceID(null)
      }} onCancel={() => {
        setEditTTSServiceDialogState(false)
        setEditTTSServerDialogServiceID(null)
      }} />
      <mui.List style={{ marginTop: 30 }}>
        {TTSServices.map((service, index) => <mui.ListItem><mui.ListItemButton
          key={index}
          onClick={() => {
            // toggle sticker set edit dialog
            setEditTTSServiceDialogState(true)
            setEditTTSServerDialogServiceID(service.id)
          }}
        >
          <mui.ListItemIcon>
            <icons.Storage />
          </mui.ListItemIcon>
          <mui.ListItemText style={{ marginLeft: 10 }} primary={service.name} secondary={service.description} />
        </mui.ListItemButton>
        </mui.ListItem>)}
      </mui.List>
    </mui.Box>
  </mui.Box>;
}

export default TTSServicesView;