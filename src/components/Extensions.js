import React from 'react';
import Message from '../components/Message';
import * as Api from '../shared/remote';
import ContentEditor from '../components/ContentEditor';
import Mui from '../shared/mui';
import usePrefersColorScheme from 'use-prefers-color-scheme';

function EditDialog({ open, onClose, onOk, valueType, dialogType, defaultValue }) {
  const [name, setName] = React.useState(defaultValue?.name || '')
  const [descriptionTxt, setDescriptionTxt] = React.useState(defaultValue?.description || '')
  const [enabled, setEnabled] = React.useState(defaultValue?.enabled || false)
  const [author, setAuthor] = React.useState(defaultValue?.author || '')
  const [content, setContent] = React.useState(defaultValue?.content || '')

  React.useEffect(() => {
    setName(defaultValue?.name || '')
    setDescriptionTxt(defaultValue?.description || '')
    setEnabled(defaultValue?.enabled || false)
    setAuthor(defaultValue?.author || '')
    setContent(defaultValue?.content || '')
  }, [defaultValue])

  return <Mui.Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
    <Mui.DialogTitle>
      {dialogType === 'create' ? 'Create' : 'Edit'} {valueType}
    </Mui.DialogTitle>
    <Mui.DialogContent>
      <Mui.Grid container spacing={2}>
        <Mui.Grid item xs={12} sm={6}>
          <Mui.Typography variant="body1" sx={{ marginBottom: 10 }}>
            The name of the {valueType?.toLowerCase()}
          </Mui.Typography>
          <Mui.TextField variant="outlined" label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
        </Mui.Grid>
        <Mui.Grid item xs={12} sm={6}>
          <Mui.Typography variant="body1" sx={{ marginBottom: 10 }}>
            The author of the {valueType?.toLowerCase()}
          </Mui.Typography>
          <Mui.TextField variant="outlined" label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} fullWidth />
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          <Mui.Typography variant="body1" sx={{ marginBottom: 10 }}>
            A brief description of the {valueType?.toLowerCase()}
          </Mui.Typography>
          <Mui.TextField variant="outlined" label="Description" value={descriptionTxt} onChange={(e) => setDescriptionTxt(e.target.value)} fullWidth />
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          <Mui.Typography variant="body1" sx={{ marginBottom: 10 }}>
            Content
          </Mui.Typography>
          <ContentEditor height={'20vh'} width={'100%'} mode={usePrefersColorScheme()} language={valueType === 'User Script' ? 'python' : 'markdown'} value={content} onChange={(value) => {
            setContent(value)
          }} />
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          {/* Switch */}
          <Mui.FormControl>
            <Mui.FormControlLabel
              style={{ padding: 10 }}
              control={
                <Mui.Switch
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  name="enabled"
                  color="primary"

                />
              }
              label="Enabled"
            />
          </Mui.FormControl>
        </Mui.Grid>
      </Mui.Grid>
    </Mui.DialogContent>
    <Mui.DialogActions>
      <Mui.Button onClick={onClose}>Cancel</Mui.Button>
      <Mui.Button onClick={() => {
        console.log('aaaa', content)
        onOk({ name, description: descriptionTxt, author, enabled, content })
        onClose()
      }}>{dialogType === 'create' ? 'Create' : 'Save'}</Mui.Button>
    </Mui.DialogActions>
  </Mui.Dialog>
}

function PanelExtraInfos({ raiseMessage }) {
  const [extraInfos, setExtraInfos] = React.useState([])

  // edit dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editDialogType, setEditDialogType] = React.useState(null)
  const [editDialogValue, setEditDialogValue] = React.useState(null)

  React.useEffect(() => {
    Api.getExtraInfoList().then(res => {
      setExtraInfos(res.data)
    })
  }, [])

  return <Mui.Box sx={{ height: '100%', overflowY: 'scroll' }} class='scroll-container'>
    <Mui.Fab color="primary" onClick={() => {
      setEditDialogOpen(true)
      setEditDialogType('create')
      setEditDialogValue(null)
    }} sx={{ position: 'fixed', bottom: 20, right: 20 }}><Mui.Icons.Add /></Mui.Fab>
    <EditDialog open={editDialogOpen} onClose={() => {
      setEditDialogOpen(false)
    }} onOk={(value) => {
      console.log(value)
      if (editDialogType === 'create') {
        Api.createExtraInfo(value.name, value.description, value.author, value.enabled, value.content).then(res => {
          if (res.status) {
            setExtraInfos([...extraInfos, value])
            setEditDialogOpen(false)
          }
        })
      } else {
        Api.updateExtraInfo(editDialogValue.id, value.name, value.description, value.author, value.enabled, value.content).then(res => {
          setExtraInfos(extraInfos.map(i => i.id === editDialogValue.id ? value : i))
          setEditDialogOpen(false)
        })
      }
    }} valueType="Extra Info" dialogType={editDialogType} defaultValue={editDialogValue} />
    <Mui.List sx={{ paddingX: 10 }}>
      {extraInfos?.map(info => (
        <Mui.ListItem key={info.id}>
          <Mui.ListItemText primary={info.name} secondary={info.description} />
          <Mui.ListItemSecondaryAction>
            <Mui.IconButton edge="end" aria-label="delete" onClick={() => {
              Api.deleteExtraInfo(info.id).then(() => {
                setExtraInfos(extraInfos.filter(i => i.id !== info.id))
              })
            }}>
              <Mui.Icons.Delete />
            </Mui.IconButton>
            <Mui.IconButton edge="end" aria-label="edit" onClick={() => {
              setEditDialogOpen(true)
              setEditDialogType('edit')
              setEditDialogValue(info)
            }}><Mui.Icons.Edit /></Mui.IconButton>
          </Mui.ListItemSecondaryAction>
        </Mui.ListItem>
      ))}
    </Mui.List>
  </Mui.Box>
}

function PanelUserScripts() {
  const [userScripts, setUserScripts] = React.useState([])

  // edit dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [editDialogType, setEditDialogType] = React.useState(null)
  const [editDialogValue, setEditDialogValue] = React.useState(null)

  React.useEffect(() => {
    Api.getUserScriptList().then(res => {
      setUserScripts(res.data)
    })
  }, [])

  return <Mui.Box style={{ height: '100%', overflowY: 'scroll' }} class='scroll-container'>
    <Mui.Fab color="primary" onClick={() => {
      setEditDialogOpen(true)
      setEditDialogType('create')
      setEditDialogValue(null)
    }} sx={{ position: 'fixed', bottom: 20, right: 20 }}><Mui.Icons.Add /></Mui.Fab>
    <EditDialog open={editDialogOpen} onClose={() => {
      setEditDialogOpen(false)
    }} onOk={(value) => {
      if (editDialogType === 'create') {
        Api.createUserScript(value.name, value.description, value.author, value.enabled, value.content).then(res => {
          if (res.status) {
            setUserScripts([...userScripts, value])
            setEditDialogOpen(false)
          }
        })
      } else {
        Api.updateUserScript(editDialogValue.id, value.name, value.description, value.author, value.enabled, value.content).then(res => {
          setUserScripts(userScripts.map(i => i.id === editDialogValue.id ? value : i))
          setEditDialogOpen(false)
        })
      }
    }} valueType="User Script" dialogType={editDialogType} defaultValue={editDialogValue} />
    <Mui.List sx={{ paddingX: 10 }}>
      {userScripts?.map(info => (
        <Mui.ListItem key={info.id}>
          <Mui.ListItemText primary={info.name} secondary={info.description} />
          <Mui.ListItemSecondaryAction>
            <Mui.IconButton edge="end" aria-label="delete" onClick={() => {
              Api.deleteExtraInfo(info.id).then(() => {
                setUserScripts(userScripts.filter(i => i.id !== info.id))
              })
            }}>
              <Mui.Icons.Delete />
            </Mui.IconButton>
            <Mui.IconButton edge="end" aria-label="edit" onClick={() => {
              setEditDialogOpen(true)
              setEditDialogType('edit')
              setEditDialogValue(info)
            }}><Mui.Icons.Edit /></Mui.IconButton>
          </Mui.ListItemSecondaryAction>
        </Mui.ListItem>
      ))}
    </Mui.List>
  </Mui.Box>
}

function Extensions() {
  const [currentPage, setCurrentPage] = React.useState('Extra Infos')

  // message alert related
  const [messageOpen, setMessageOpen] = React.useState(false);
  const [messageTitle, setMessageTitle] = React.useState(null);
  const [messageContent, setMessageContent] = React.useState(null);
  const [messageType, setMessageType] = React.useState(null);

  return <Mui.Box sx={{ height: 'calc(100% - 48px)', width: 'calc(100% - 30px)', marginLeft: 30 }} class='scroll-container'>
    <Message open={messageOpen} title={messageTitle} content={messageContent} type={messageType} dismiss={() => {
      setMessageOpen(false);
    }} />
    <Mui.Tabs value={currentPage} onChange={(e, val) => setCurrentPage(val)} sx={{ marginLeft: 32 }}>
      <Mui.Tab label="Extra Infos" value="Extra Infos" />
      <Mui.Tab label="User Scripts" value="User Scripts" />
    </Mui.Tabs>
    {currentPage === 'Extra Infos' && <PanelExtraInfos raiseMessage={(title, content, type) => {
      setMessageTitle(title)
      setMessageContent(content)
      setMessageType(type)
      setMessageOpen(true)
    }} />}
    {currentPage === 'User Scripts' && <PanelUserScripts raiseMessage={(title, content, type) => {
      setMessageTitle(title)
      setMessageContent(content)
      setMessageType(type)
      setMessageOpen(true)
    }} />}
  </Mui.Box>
}

export default Extensions;