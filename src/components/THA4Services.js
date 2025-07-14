import React from 'react';

import fs from '../shared/fs';
import icons from '../shared/icons';
import Mui from '../shared/mui';
import * as Remote from '../shared/remote';
import Message from './Message';
import ContentEditor from './ContentEditor';
import usePrefersColorScheme from 'use-prefers-color-scheme';

function EditService({ state, service, onImageUpdate, onOk, onCancel }) {
  const [serviceName, setServiceName] = React.useState(service?.name)
  const [serviceDescription, setServiceDescription] = React.useState(service?.description)
  const [serviceConfiguration, setServiceConfiguration] = React.useState(service?.configuration)
  const [serviceIconUrl, setServiceIconUrl] = React.useState(service?.avatarUrl)
  const [serviceIconFileObject, setServiceIconFileObject] = React.useState(null)

  React.useEffect(() => {
    if (service) {
      setServiceName(service.name)
      setServiceDescription(service.description)
      setServiceConfiguration(service.configuration)
      setServiceIconUrl(Remote.getTHA4ServiceAvatarUrl(service.id))
    }
  }, [service])

  return <><Mui.Dialog open={state} onClose={onCancel}>
    <Mui.DialogTitle>Edit THA4 Service</Mui.DialogTitle>
    <Mui.DialogContent style={{ minWidth: window.innerWidth * 0.5, maxHeight: '50vh' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <img src={serviceIconUrl} style={{ width: 50, height: 'auto', borderRadius: 25 }}></img>
      </div>
      <Mui.Button fullWidth style={{ marginTop: 10 }} startIcon={<icons.Image></icons.Image>} color='primary' variant='contained' onClick={() => {
        fs.launchImagePickerAsync(false).then(files => {
          console.log(files)
          setServiceIconFileObject(files[0])
          setServiceIconUrl(URL.createObjectURL(files[0]))
          onImageUpdate(files[0])
        }).catch(e => {
          console.log(e)
        })
      }}>Pick one from local</Mui.Button>
      <Mui.TextField style={{ marginTop: 10 }} label="Service Name" fullWidth value={serviceName} onChange={(e) => setServiceName(e.target.value)}></Mui.TextField>
      <Mui.TextField style={{ marginTop: 10 }} label="Service Description" fullWidth value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)}></Mui.TextField>

      <Mui.Typography variant="body1" sx={{ marginTop: 10, marginBottom: 10 }}>
        Character Live 2D Animation Configuration (JSON format)
      </Mui.Typography>

      <ContentEditor height={'20vh'} width={'100%'} mode={usePrefersColorScheme()} language={'json'} value={serviceConfiguration} onChange={(value) => {
        setServiceConfiguration(value)
      }} />
    </Mui.DialogContent>
    <Mui.DialogActions>
      <Mui.Button onClick={onCancel}>Cancel</Mui.Button>
      <Mui.Button onClick={() => {
        onOk(serviceName, serviceDescription, serviceConfiguration)
      }}>Edit</Mui.Button>
    </Mui.DialogActions>
  </Mui.Dialog></>
}

function AddService({ state, onOk, onCancel }) {
  const [serviceName, setServiceName] = React.useState('')
  const [serviceDescription, setServiceDescription] = React.useState('')
  const [serviceConfiguration, setServiceConfiguration] = React.useState('')

  return <><Mui.Dialog open={state} onClose={onCancel}>
    <Mui.DialogTitle>Add THA4 Service</Mui.DialogTitle>
    <Mui.DialogContent style={{ minWidth: window.innerWidth * 0.5, maxHeight: '50vh' }}>
      <Mui.TextField style={{ marginTop: 10 }} label="Service Name" fullWidth value={serviceName} onChange={(e) => setServiceName(e.target.value)}></Mui.TextField>
      <Mui.TextField style={{ marginTop: 10 }} label="Service Description" fullWidth value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)}></Mui.TextField>

      <Mui.Typography variant="body1" sx={{ marginTop: 10, marginBottom: 10 }}>
        Character Live 2D Animation Configuration (JSON format)
      </Mui.Typography>

      <ContentEditor height={'20vh'} width={'100%'} mode={usePrefersColorScheme()} language={'json'} value={serviceConfiguration} onChange={(value) => {
        setServiceConfiguration(value)
      }} />
    </Mui.DialogContent>
    <Mui.DialogActions>
      <Mui.Button onClick={onCancel}>Cancel</Mui.Button>
      <Mui.Button onClick={() => {
        onOk(serviceName, serviceDescription, serviceConfiguration)
      }}>Add</Mui.Button>
    </Mui.DialogActions>
  </Mui.Dialog></>
}

function THA4Services() {
  const [tha4ServiceList, setTha4ServiceList] = React.useState([])
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('success')
  const [messageOpen, setMessageOpen] = React.useState(false)
  const [editTHA4ServiceDialogStatus, setEditTHA4ServiceDialogStatus] = React.useState(false)
  const [editTHA4ServiceDialogService, setEditTHA4ServiceDialogService] = React.useState(null)
  const [addTHA4ServiceDialogStatus, setAddTHA4ServiceDialogStatus] = React.useState(false)

  function fetchTHA4ServiceList() {
    Remote.getTHA4ServiceList().then(r => {
      if (r.status) {
        console.log(r.data)
        setTha4ServiceList(r.data)
      } else {
        setMessageTitle('Error')
        setMessageContent(r.data)
        setMessageType('error')
        setMessageOpen(true)
      }
    })
  }

  React.useEffect(() => {
    fetchTHA4ServiceList()
  }, [])
  return <Mui.Box sx={{ height: '100%', width: 'calc(100% - 30px)', marginLeft: 30 }}>
    <Mui.Box data-overlayscrollbars-initialize sx={{ height: '100%', overflowY: 'scroll' }} class='scroll-container'>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />
      <AddService state={addTHA4ServiceDialogStatus} onOk={(name, description, configuration) => {
        Remote.createTHA4Service(name, description, configuration).then(r => {
          if (r.status) {
            setMessageTitle('Success')
            setMessageContent(r.data)
            setMessageType('success')
            setMessageOpen(true)
            setAddTHA4ServiceDialogStatus(false)
            setTha4ServiceList([...tha4ServiceList, r.data])
          } else {
            setMessageTitle('Error')
            setMessageContent(r.data)
            setMessageType('error')
            setMessageOpen(true)
          }
        })
      }} onCancel={() => setAddTHA4ServiceDialogStatus(false)}></AddService>
      <EditService state={editTHA4ServiceDialogStatus} service={editTHA4ServiceDialogService} onOk={(name, description, configuration) => {
        Remote.updateTHA4Service(editTHA4ServiceDialogService.id, name, description, configuration).then(r => {
          if (r.status) {
            setMessageTitle('Success')
            setMessageContent(r.data)
            setMessageType('success')
            setMessageOpen(true)
            setEditTHA4ServiceDialogStatus(false)

          } else {
            setMessageTitle('Error')
            setMessageContent(r.data)
            setMessageType('error')
            setMessageOpen(true)
          }
        })
      }} onCancel={() => setEditTHA4ServiceDialogStatus(false)} onImageUpdate={(fileObject) => {
        Remote.updateTHA4ServiceAvatar(editTHA4ServiceDialogService.id, fileObject).then(r => {
          if (r.status) {
            setMessageTitle('Success')
            setMessageContent(r.data)
            setMessageType('success')
            setMessageOpen(true)
          } else {
            setMessageTitle('Error')
            setMessageContent(r.data)
            setMessageType('error')
            setMessageOpen(true)
          }
        })
      }}></EditService>

      <Mui.Typography variant="body1" sx={{ marginTop: 30 }}>
        THA4 (Talking Head Anime 4) API is a middleware integrated with CyberWaifu to provide an interface for Live 2D character presentation and an animation engine for generating 2D animations.
        The API is licensed under the MIT license and is available at https://github.com/XtherDevTeam/talking-head-anime-4-demo-middleware.
      </Mui.Typography>

      <Mui.List style={{ marginTop: 30 }}>
        {tha4ServiceList.map((set, index) => <Mui.ListItem><Mui.ListItemButton
          key={index}
          onClick={() => {
            setEditTHA4ServiceDialogStatus(true)
            setEditTHA4ServiceDialogService(set)
          }}
        >
          <Mui.ListItemIcon>
            <Mui.Icons.Storage />
          </Mui.ListItemIcon>
          <Mui.ListItemText style={{ marginLeft: 10 }} primary={set.name} secondary={set.description} />
        </Mui.ListItemButton>
        </Mui.ListItem>)}
      </Mui.List>
    </Mui.Box>
    <Mui.Fab color="primary" onClick={() => {
      setAddTHA4ServiceDialogStatus(true)
    }} sx={{ position: 'fixed', bottom: 20, right: 20 }}><Mui.Icons.Add /></Mui.Fab>
  </Mui.Box>;
}

export default THA4Services;