import React from 'react';

import fs from '../shared/fs';
import icons from '../shared/icons';
import Mui from '../shared/mui';
import * as Remote from '../shared/remote';
import Message from './Message';

function AddStickerDialog({ state, onOk, onCancel, set }) {
  const [stickerName, setStickerName] = React.useState('')
  const [stickerUrl, setStickerUrl] = React.useState(Remote.stickerGet(set.id, set.previewSticker))
  const [stickerFileObject, setStickerFileObject] = React.useState(null)

  return <><Mui.Dialog open={state} onClose={onCancel}>
    <Mui.DialogTitle>Add Sticker</Mui.DialogTitle>
    <Mui.DialogContent style={{ minWidth: window.innerWidth * 0.5, maxHeight: '50vh' }}>
      <Mui.TextField style={{ marginTop: 10 }} label="Sticker Name" fullWidth value={stickerName} onChange={(e) => setStickerName(e.target.value)}></Mui.TextField>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <img src={stickerUrl} style={{ width: 50, height: 'auto', borderRadius: 25 }}></img>
      </div>
      <Mui.Button fullWidth style={{ marginTop: 10 }} startIcon={<icons.Image></icons.Image>} color='primary' variant='contained' onClick={() => {
        fs.launchImagePickerAsync(false).then(files => {
          console.log(files)
          setStickerFileObject(files[0])
          setStickerUrl(URL.createObjectURL(files[0]))
        }).catch(e => {
          console.log(e)
        })
      }}>Pick one from local</Mui.Button>
    </Mui.DialogContent>
    <Mui.DialogActions>
      <Mui.Button onClick={onCancel}>Cancel</Mui.Button>
      <Mui.Button onClick={() => {
        onOk(stickerName, stickerUrl, stickerFileObject)
      }}>Add</Mui.Button>
    </Mui.DialogActions>
  </Mui.Dialog></>
}

function StickerSetEdit({ state, setId, onOk, onCancel }) {
  let [set, setSet] = React.useState(null)
  let [name, setName] = React.useState('')
  let [stickers, setStickers] = React.useState([])
  let [addStickerDialogState, setAddStickerDialogStatus] = React.useState(false)
  let [addStickerDialogSet, setAddStickerDialogSet] = React.useState({
    id: 0,
    setName: '',
    previewSticker: ''
  })

  let [messageTitle, setMessageTitle] = React.useState('')
  let [messageContent, setMessageContent] = React.useState('')
  let [messageType, setMessageType] = React.useState('success')
  let [messageOpen, setMessageOpen] = React.useState(false)

  function refreshStickerList() {
    Remote.stickerList(setId).then(r => {
      if (r.data.status) {
        setStickers(r.data.data)
      } else {
        setMessageTitle('Error')
        setMessageContent(r.data.data)
        setMessageType('error')
        setMessageOpen(true)
      }
    })
  }

  React.useEffect(() => {
    if (setId) {
      Remote.getStickerSetInfo(setId).then(r => {
        if (r.data.status) {
          console.log(r.data.data)
          setSet(r.data.data)
          setName(r.data.data.setName)
          refreshStickerList()
        } else {
          setMessageTitle('Error')
          setMessageContent(r.data.data)
          setMessageType('error')
          setMessageOpen(true)
        }
      })
    }
  }, [setId])

  return <Mui.Dialog open={state} onClose={onCancel}>
    <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />
    <AddStickerDialog state={addStickerDialogState} set={addStickerDialogSet} onOk={(stickerName, stickerUrl, stickerFileObject) => {
      URL.revokeObjectURL(stickerUrl)
      fs.uploadAsync(Remote.addStickerToSet(setId, stickerName), stickerFileObject).then(async r => {
        let response = await r.json()
        console.log(response)
        if (response.status) {
          setMessageTitle('Success')
          setMessageContent('Sticker added successfully')
          setMessageType('success')
          setMessageOpen(true)
          refreshStickerList()
        } else {
          setMessageTitle('Error')
          setMessageContent(r.data.data)
          setMessageType('error')
          setMessageOpen(true)
        }
      })
      setAddStickerDialogStatus(false)
    }} onCancel={() => {
      setAddStickerDialogStatus(false)
    }}></AddStickerDialog>

    <Mui.DialogTitle>Edit Sticker Set</Mui.DialogTitle>
    <Mui.DialogContent style={{ minWidth: window.innerWidth * 0.5, maxHeight: '50vh', display: 'flex', flexDirection: 'column' }}>
      <Mui.TextField label="Sticker Set Name" fullWidth value={name} style={{ marginTop: 10 }} onChange={(e) => setName(e.target.value)}></Mui.TextField>

      <Mui.Typography style={{ marginTop: 10 }} variant='subtitle2'>Available Stickers ({stickers.length})</Mui.Typography>
      <Mui.List style={{ flex: 1, overflowY: 'auto' }} data-overlayscrollbars-initialize  class='scroll-container'>
        {stickers.map((sticker, index) => <Mui.ListItem style={{marginTop: 10, marginBottom: 10}} key={`stk-${index}`} secondaryAction={<Mui.IconButton color='secondary' onClick={() => {
          Remote.deleteSticker(sticker.id).then(r => {
            if (r.data.status) {
              setMessageTitle('Success')
              setMessageContent('Sticker deleted successfully')
              setMessageType('success')
              setMessageOpen(true)
              setStickers(stickers.filter(s => s.id !== sticker.id))
            } else {
              setMessageTitle('Error')
              setMessageContent(r.data.message)
              setMessageType('error')
              setMessageOpen(true)
            }
          })
        }}>
          <icons.Delete></icons.Delete>
        </Mui.IconButton>}>
          <Mui.ListItemIcon>
            <img src={Remote.stickerGet(set.id, sticker.name)} style={{ width: 50, height: 'auto', borderRadius: 25 }}></img>
          </Mui.ListItemIcon>
          <Mui.ListItemText style={{ marginLeft: 10 }} primary={sticker.name} />
        </Mui.ListItem>)}
      </Mui.List>
      <Mui.Button style={{ marginTop: 10 }} startIcon={<icons.Add></icons.Add>} color='primary' variant='contained' onClick={() => {
        setAddStickerDialogStatus(true)
        setAddStickerDialogSet(set)
      }}>
        Add Sticker
      </Mui.Button>
    </Mui.DialogContent>
    <Mui.DialogActions>
      <Mui.Button onClick={onCancel}>Cancel</Mui.Button>
      <Mui.Button onClick={() => {
        onOk(name)
      }}>Edit</Mui.Button>
    </Mui.DialogActions>
  </Mui.Dialog>
}

function StickersView() {
  const [stickerSets, setStickerSets] = React.useState([]);
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('success')
  const [messageOpen, setMessageOpen] = React.useState(false)
  const [stickerEditDialogStatus, setStickerEditDialogStatus] = React.useState(false)
  const [stickerEditDialogStickerSetId, setStickerEditDialogStickerSetId] = React.useState(null)

  React.useEffect(() => {
    Remote.stickerSetList().then(r => {
      if (r.data.status) {
        console.log(r.data.data)
        setStickerSets(r.data.data)
      } else {
        setMessageTitle('Error')
        setMessageContent(r.data.message)
        setMessageType('error')
        setMessageOpen(true)
      }
    })
  }, [])
  return <Mui.Box sx={{ height: '100%', width: 'calc(100% - 30px)', marginLeft: 30 }}>
    <Mui.Box data-overlayscrollbars-initialize sx={{ height: '100%', overflowY: 'scroll' }}  class='scroll-container'>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />
      <StickerSetEdit state={stickerEditDialogStatus} setId={stickerEditDialogStickerSetId} onOk={(v) => {
        Remote.renameStickerSet(stickerEditDialogStickerSetId, v).then(r => {
          if (r.data.status) {
            setMessageTitle('Success')
            setMessageContent('Sticker set renamed successfully')
            setMessageType('success')
            setMessageOpen(true)
          } else {
            setMessageTitle('Error')
            setMessageContent(r.data.message)
            setMessageType('error')
            setMessageOpen(true)
          }
        })
        setStickerEditDialogStatus(false)
        setStickerEditDialogStickerSetId(null)
      }} onCancel={() => {
        setStickerEditDialogStatus(false)
        setStickerEditDialogStickerSetId(null)
      }} />
      <Mui.List style={{ marginTop: 30 }}>
        {stickerSets.map((set, index) => <Mui.ListItem><Mui.ListItemButton
          key={index}
          onClick={() => {
            // toggle sticker set edit dialog
            setStickerEditDialogStatus(true)
            setStickerEditDialogStickerSetId(set.id)
          }}
        >
          <Mui.ListItemIcon>
            <img src={Remote.stickerGet(set.id, set.previewSticker)} style={{ width: 50, height: 50, borderRadius: 25 }}></img>
          </Mui.ListItemIcon>
          <Mui.ListItemText style={{ marginLeft: 10 }} primary={set.setName} />
        </Mui.ListItemButton>
        </Mui.ListItem>)}
      </Mui.List>
    </Mui.Box>
  </Mui.Box>;
}

export default StickersView;