import React from 'react';

import fs from '../shared/fs';
import icons from '../shared/icons';
import mui from '../shared/mui';
import * as Remote from '../shared/remote';
import Message from './Message';

function AddStickerDialog({ state, onOk, onCancel, set }) {
  const [stickerName, setStickerName] = React.useState('')
  const [stickerUrl, setStickerUrl] = React.useState(Remote.stickerGet(set.id, set.previewSticker))
  const [stickerFileObject, setStickerFileObject] = React.useState(null)

  return <><mui.Dialog open={state} onClose={onCancel}>
    <mui.DialogTitle>Add Sticker</mui.DialogTitle>
    <mui.DialogContent style={{ minWidth: window.innerWidth * 0.5, maxHeight: '50vh' }}>
      <mui.TextField style={{ marginTop: 10 }} label="Sticker Name" fullWidth value={stickerName} onChange={(e) => setStickerName(e.target.value)}></mui.TextField>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <img src={stickerUrl} style={{ width: 50, height: 'auto', borderRadius: 25 }}></img>
      </div>
      <mui.Button fullWidth style={{ marginTop: 10 }} startIcon={<icons.Image></icons.Image>} color='primary' variant='contained' onClick={() => {
        fs.launchImagePickerAsync(false).then(files => {
          console.log(files)
          setStickerFileObject(files[0])
          setStickerUrl(URL.createObjectURL(files[0]))
        }).catch(e => {
          console.log(e)
        })
      }}>Pick one from local</mui.Button>
    </mui.DialogContent>
    <mui.DialogActions>
      <mui.Button onClick={onCancel}>Cancel</mui.Button>
      <mui.Button onClick={() => {
        onOk(stickerName, stickerUrl, stickerFileObject)
      }}>Add</mui.Button>
    </mui.DialogActions>
  </mui.Dialog></>
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

  return <mui.Dialog open={state} onClose={onCancel}>
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

    <mui.DialogTitle>Edit Sticker Set</mui.DialogTitle>
    <mui.DialogContent style={{ minWidth: window.innerWidth * 0.5, maxHeight: '50vh', display: 'flex', flexDirection: 'column' }}>
      <mui.TextField label="Sticker Set Name" fullWidth value={name} style={{ marginTop: 10 }} onChange={(e) => setName(e.target.value)}></mui.TextField>

      <mui.Typography style={{ marginTop: 10 }} variant='subtitle2'>Available Stickers ({stickers.length})</mui.Typography>
      <mui.List style={{ flex: 1, overflowY: 'auto' }} data-overlayscrollbars-initialize>
        {stickers.map((sticker, index) => <mui.ListItem style={{marginTop: 10, marginBottom: 10}} key={`stk-${index}`} secondaryAction={<mui.IconButton color='secondary' onClick={() => {
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
        </mui.IconButton>}>
          <mui.ListItemIcon>
            <img src={Remote.stickerGet(set.id, sticker.name)} style={{ width: 50, height: 'auto', borderRadius: 25 }}></img>
          </mui.ListItemIcon>
          <mui.ListItemText style={{ marginLeft: 10 }} primary={sticker.name} />
        </mui.ListItem>)}
      </mui.List>
      <mui.Button style={{ marginTop: 10 }} startIcon={<icons.Add></icons.Add>} color='primary' variant='contained' onClick={() => {
        setAddStickerDialogStatus(true)
        setAddStickerDialogSet(set)
      }}>
        Add Sticker
      </mui.Button>
    </mui.DialogContent>
    <mui.DialogActions>
      <mui.Button onClick={onCancel}>Cancel</mui.Button>
      <mui.Button onClick={() => {
        onOk(name)
      }}>Edit</mui.Button>
    </mui.DialogActions>
  </mui.Dialog>
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
  return <mui.Box sx={{ height: '100%', width: 'calc(100% - 30px)', marginLeft: 30 }}>
    <mui.Box data-overlayscrollbars-initialize sx={{ height: '100%', overflowY: 'scroll' }}>
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
      <mui.List style={{ marginTop: 30 }}>
        {stickerSets.map((set, index) => <mui.ListItem><mui.ListItemButton
          key={index}
          onClick={() => {
            // toggle sticker set edit dialog
            setStickerEditDialogStatus(true)
            setStickerEditDialogStickerSetId(set.id)
          }}
        >
          <mui.ListItemIcon>
            <img src={Remote.stickerGet(set.id, set.previewSticker)} style={{ width: 50, height: 50, borderRadius: 25 }}></img>
          </mui.ListItemIcon>
          <mui.ListItemText style={{ marginLeft: 10 }} primary={set.setName} />
        </mui.ListItemButton>
        </mui.ListItem>)}
      </mui.List>
    </mui.Box>
  </mui.Box>;
}

export default StickersView;