import React from 'react';

import { useNavigate } from 'react-router-dom';
import { usePrefersColorScheme } from 'use-prefers-color-scheme';

import About from '../components/About';
import CharacterEdit from '../components/CharacterEdit';
import ChatroomView from '../components/ChatroomView';
import EmptyChatView from '../components/EmtryChatView';
import Message from '../components/Message';
import StickersView from '../components/StickersView';
import icons from '../shared/icons';
import mui from '../shared/mui';
import * as Remote from '../shared/remote';
import theme from '../shared/theme';
import TTSServicesView from '../components/TTSServicesView';

function CreateStickerSetDialog({ state, onOk, onClose }) {
  let [name, setName] = React.useState('')

  // message related
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('')
  const [messageOpen, setMessageOpen] = React.useState(false)

  return (
    <mui.Dialog open={state} onClose={onClose}>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)}></Message>
      <mui.DialogTitle>Create Sticker Set</mui.DialogTitle>
      <mui.DialogContent>
        <mui.DialogContentText>
          Think of the name for your sticker set. Hmm... How about "Naganohara Yoimiya"?
        </mui.DialogContentText>
        <mui.TextField style={{ marginTop: 10 }} label="Sticker Set Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
      </mui.DialogContent>
      <mui.DialogActions>
        <mui.Button onClick={onClose}>Cancel</mui.Button>
        <mui.Button onClick={() => {
          Remote.createStickerSet(name).then(res => {
            if (res.data.status) {
              setMessageTitle('Success')
              setMessageContent('Sticker set created successfully.')
              setMessageType('success')
              setMessageOpen(true)
            } else {
              setMessageTitle('Error')
              setMessageContent(res.data.message)
              setMessageType('error')
              setMessageOpen(true)
            }
          })
          onOk(name)
          onClose()
        }}>Create</mui.Button>
      </mui.DialogActions>
    </mui.Dialog>)
}

function CreateTTSServiceDialog({ state, onOk, onClose }) {
  let [name, setName] = React.useState('')
  let [description, setDescription] = React.useState('')
  let [url, setUrl] = React.useState('')
  let [ttsInferYamlPath, setTTSInferYamlPath] = React.useState('')

  // message related
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('')
  const [messageOpen, setMessageOpen] = React.useState(false)

  return (
    <mui.Dialog open={state} onClose={onClose}>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)}></Message>
      <mui.DialogTitle>Create TTS Service</mui.DialogTitle>
      <mui.DialogContent>
        <mui.DialogContentText>
          If you are using fast_inference_ branch of GPT-SoVITs, make sure you provide the path to tts_infer.yaml properly.
        </mui.DialogContentText>
        <mui.TextField style={{ marginTop: 10 }} label="TTS Service Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <mui.TextField style={{ marginTop: 10 }} label="TTS Service Description" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
        <mui.TextField style={{ marginTop: 10 }} label="TTS Server Endpoint" fullWidth value={url} onChange={(e) => setUrl(e.target.value)} />
        <mui.TextField style={{ marginTop: 10 }} label="Path to tts_infer.yaml" fullWidth value={ttsInferYamlPath} onChange={(e) => setTTSInferYamlPath(e.target.value)} />
      </mui.DialogContent>
      <mui.DialogActions>
        <mui.Button onClick={onClose}>Cancel</mui.Button>
        <mui.Button onClick={() => {
          Remote.createTTSService(name, description, url, ttsInferYamlPath).then(res => {
            if (res.data.status) {
              setMessageTitle('Success')
              setMessageContent('Sticker set created successfully.')
              setMessageType('success')
              setMessageOpen(true)
            } else {
              setMessageTitle('Error')
              setMessageContent(res.data.data)
              setMessageType('error')
              setMessageOpen(true)
            }
          })
          onOk(name)
          onClose()
        }}>Create</mui.Button>
      </mui.DialogActions>
    </mui.Dialog>)
}

function Home() {
  let navigate = useNavigate()
  const [selectedIndex, setSelectedIndex] = React.useState({
    type: 'Home',
    title: 'Home'
  });
  const [charList, setCharList] = React.useState([]);
  const [createStickerSetDialogState, setCreateStickerSetDialogState] = React.useState(false)
  const [createTTSServiceDialogState, setCreateTTSServiceDialogState] = React.useState(false)

  // message related
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('')
  const [messageOpen, setMessageOpen] = React.useState(false)

  const drawerRef = React.useRef(null);

  // second box marginLeft
  const [secondBoxMarginLeft, setSecondBoxMarginLeft] = React.useState(0)

  const handleListItemClick = (type, index) => {
    setSelectedIndex({
      type: type,
      title: index
    });
  }

  React.useEffect(() => {
    console.log('Home');
    console.log(theme.light)
    Remote.checkIfLoggedIn().then(res => {
      if (!res) {
        window.api.invoke('resize-window-login')
        navigate('/signin')
      }
      Remote.characterList().then(res => {
        if (res.data.status) {
          setCharList(res.data.data)
        } else {
          setMessageTitle('Error')
          setMessageContent(res.data.message)
          setMessageType('error')
          setMessageOpen(true)
        }
      })
    })
  }, []);
  React.useLayoutEffect(() => {
    console.log('secondBoxMarginLeft', drawerRef.current?.getBoundingClientRect())
    setSecondBoxMarginLeft(drawerRef.current?.offsetWidth)
  })
  return (
    <mui.Box style={{ position: 'absolute', top: 0, left: 0, height: '100vh', width: '100vw', backgroundColor: usePrefersColorScheme() == 'light' ? theme.light.palette.surfaceContainer.main : theme.dark.palette.surfaceContainer.main }}>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)}></Message>
      <CreateStickerSetDialog state={createStickerSetDialogState} onOk={(name) => {
        console.log('create sticker set', name)
        handleListItemClick('', {})
        handleListItemClick('Stickers', {})
        setCreateStickerSetDialogState(false)
      }} onClose={() => {
        setCreateStickerSetDialogState(false)
      }} />
      <CreateTTSServiceDialog state={createTTSServiceDialogState} onOk={(name) => {
        console.log('create tts service', name)
        handleListItemClick('', {})
        handleListItemClick('TTS Services', {})
        setCreateTTSServiceDialogState(false)
      }} onClose={() => {
        setCreateTTSServiceDialogState(false)
      }} />

      <mui.Drawer ref={drawerRef} open={true} onLoad={() => { console.log(drawerRef) }} variant="permanent" style={{ position: 'absolute', top: 0, left: 0, height: '100vh', width: '30vw' }}>
        <mui.Toolbar>
          <mui.Typography color="inherit" sx={{ fontWeight: 500, letterSpacing: 0.5, fontSize: 20 }}>
            CyberWaifu-V2
          </mui.Typography>
        </mui.Toolbar>
        <mui.List style={{ padding: 10 }}>
          <mui.Box>
            <mui.ListItem sx={{ py: 2, px: 3, padding: 10 }}>
              <mui.ListItemText sx={{ fontWeight: 'bold' }}>
                <mui.Typography color="inherit" sx={{ ml: 1, fontSize: 15, fontWeight: 500 }} >
                  Chats
                </mui.Typography>
              </mui.ListItemText>
            </mui.ListItem>
            {/* <mui.ListItemButton component={mui.Link} to='/' selected={selectedIndex == 'Home'} onClick={() => handleListItemClick('Home')}>
              <mui.ListItemIcon>
                {selectedIndex == 'Home' ? <mui.HomeIcon /> : <HomeIconOutlined />}
              </mui.ListItemIcon>
              <mui.ListItemText>Home</mui.ListItemText>
            </mui.ListItemButton> */}
            {charList.map((char, index) => (
              <mui.ListItemButton key={index} selected={selectedIndex.title == char.charName} onClick={() => setSelectedIndex({ type: 'Character', title: char.charName, ...char })}>
                <mui.ListItemIcon>
                  <mui.Avatar src={Remote.charAvatar(char.id)} />
                </mui.ListItemIcon>
                <mui.ListItemText style={{ paddingLeft: 10, maxWidth: '20vw' }} secondaryTypographyProps={{ style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }} primary={char.charName} secondary={char.latestMsg} />
              </mui.ListItemButton>
            ))}
          </mui.Box>
          <mui.Box>
            <mui.ListItem sx={{ py: 2, px: 3, padding: 10 }}>
              <mui.ListItemText sx={{ fontWeight: 'bold' }}>
                <mui.Typography color="inherit" sx={{ ml: 1, fontSize: 15, fontWeight: 500 }} >
                  Settings
                </mui.Typography>
              </mui.ListItemText>
            </mui.ListItem>
            <mui.ListItemButton selected={selectedIndex.type == 'Stickers'} onClick={() => handleListItemClick('Stickers', 'Stickers')}>
              <mui.ListItemIcon>
                <icons.EmojiEmotions />
              </mui.ListItemIcon>
              <mui.ListItemText style={{ paddingLeft: 10, maxWidth: '20vw' }} primary="Stickers"></mui.ListItemText>
            </mui.ListItemButton>
            <mui.ListItemButton selected={selectedIndex.type == 'TTS Services'} onClick={() => handleListItemClick('TTS Services', 'TTS Services')}>
              <mui.ListItemIcon>
                <icons.Mic />
              </mui.ListItemIcon>
              <mui.ListItemText style={{ paddingLeft: 10, maxWidth: '20vw' }} primary="TTS Services"></mui.ListItemText>
            </mui.ListItemButton>
            <mui.ListItemButton selected={selectedIndex.type == 'About'} onClick={() => handleListItemClick('About', 'About')}>
              <mui.ListItemIcon>
                <icons.Apps />
              </mui.ListItemIcon>
              <mui.ListItemText style={{ paddingLeft: 10, maxWidth: '20vw' }} primary="About"></mui.ListItemText>
            </mui.ListItemButton>
          </mui.Box>
        </mui.List>
      </mui.Drawer>
      <mui.Box style={{ display: 'block', marginLeft: secondBoxMarginLeft }}>
        <mui.AppBar style={{ paddingLeft: secondBoxMarginLeft }}>
          <mui.Toolbar>
            {selectedIndex.type == 'CharacterEdit' && <mui.IconButton color="inherit" onClick={() => {
              setSelectedIndex({ ...selectedIndex, type: 'Character' })
            }}>
              <icons.ArrowBack />
            </mui.IconButton>}
            <mui.Typography color="inherit" sx={{ fontWeight: 500, letterSpacing: 0.5, fontSize: 20, flexGrow: 1 }}>
              {selectedIndex.title}
            </mui.Typography>
            {selectedIndex.type == 'Character' && <mui.IconButton color="inherit" onClick={() => {
              setSelectedIndex({ ...selectedIndex, type: 'CharacterEdit' })
            }}>
              <icons.MoreVert />
            </mui.IconButton>}
            {selectedIndex.type == 'Stickers' && <mui.IconButton color="inherit" onClick={() => {
              setCreateStickerSetDialogState(true)
            }}>
              <icons.Add />
            </mui.IconButton>}
            {selectedIndex.type == 'TTS Services' && <mui.IconButton color="inherit" onClick={() => {
              setCreateTTSServiceDialogState(true)
            }}>
              <icons.Add />
            </mui.IconButton>}
          </mui.Toolbar>
        </mui.AppBar>
        <mui.Toolbar />
        <mui.Paper style={{ padding: 0, borderTopLeftRadius: 30, height: `calc(100vh - 64px)` }}>
          {selectedIndex.type == 'Home' && <EmptyChatView />}
          {selectedIndex.type == 'About' && <About />}
          {selectedIndex.type == 'Character' && <ChatroomView key={`room-${selectedIndex.title}`} {...selectedIndex} />}
          {selectedIndex.type == 'CharacterEdit' && <CharacterEdit key={`edit-${selectedIndex.title}`} {...selectedIndex} />}
          {selectedIndex.type == 'TTS Services' && <TTSServicesView></TTSServicesView>}
          {selectedIndex.type == 'Stickers' && <StickersView></StickersView>}
        </mui.Paper>
      </mui.Box>
    </mui.Box>
  )
}

export default Home