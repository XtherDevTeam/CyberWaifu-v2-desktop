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
import Mui from '../shared/mui';
import * as Remote from '../shared/remote';
import theme from '../shared/theme';
import TTSServicesView from '../components/TTSServicesView';
import More from '../components/More';
import GPTSoViTsMiddleware from '../components/GPTSoViTsMiddleware';
import Extensions from '../components/Extensions';

function CreateStickerSetDialog({ state, onOk, onClose }) {
  let [name, setName] = React.useState('')

  // message related
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('')
  const [messageOpen, setMessageOpen] = React.useState(false)

  return (
    <Mui.Dialog open={state} onClose={onClose}>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)}></Message>
      <Mui.DialogTitle>Create Sticker Set</Mui.DialogTitle>
      <Mui.DialogContent>
        <Mui.DialogContentText>
          Think of the name for your sticker set. Hmm... How about "Naganohara Yoimiya"?
        </Mui.DialogContentText>
        <Mui.TextField style={{ marginTop: 10 }} label="Sticker Set Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
      </Mui.DialogContent>
      <Mui.DialogActions>
        <Mui.Button onClick={onClose}>Cancel</Mui.Button>
        <Mui.Button onClick={() => {
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
          }).catch(e => {
            console.error(e)
          })
          onOk(name)
          onClose()
        }}>Create</Mui.Button>
      </Mui.DialogActions>
    </Mui.Dialog>)
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
    <Mui.Dialog open={state} onClose={onClose}>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)}></Message>
      <Mui.DialogTitle>Create TTS Service</Mui.DialogTitle>
      <Mui.DialogContent>
        <Mui.DialogContentText>
          If you are using fast_inference_ branch of GPT-SoVITs, make sure you provide the path to tts_infer.yaml properly.
        </Mui.DialogContentText>
        <Mui.TextField style={{ marginTop: 10 }} label="TTS Service Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
        <Mui.TextField style={{ marginTop: 10 }} label="TTS Service Description" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} />
        <Mui.TextField style={{ marginTop: 10 }} label="TTS Server Endpoint" fullWidth value={url} onChange={(e) => setUrl(e.target.value)} />
        <Mui.TextField style={{ marginTop: 10 }} label="Path to tts_infer.yaml" fullWidth value={ttsInferYamlPath} onChange={(e) => setTTSInferYamlPath(e.target.value)} />
      </Mui.DialogContent>
      <Mui.DialogActions>
        <Mui.Button onClick={onClose}>Cancel</Mui.Button>
        <Mui.Button onClick={() => {
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
          }).catch(e => {
            console.error(e)
          })
          onOk(name)
          onClose()
        }}>Create</Mui.Button>
      </Mui.DialogActions>
    </Mui.Dialog>)
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

  function handleCharListUpdate() {
    Remote.characterList().then(res => {
      if (res.data.status) {
        setCharList(res.data.data)
      } else {
        setMessageTitle('Error')
        setMessageContent(res.data.message)
        setMessageType('error')
        setMessageOpen(true)
      }
    }).catch(e => {
      console.error(e)
    })
  }

  React.useEffect(() => {
    console.log('Home');
    console.log(theme.light)
    Remote.checkIfLoggedIn().then(res => {
      if (!res) {
        window.api.invoke('resize-window-login')
        navigate('/signin')
      }
      handleCharListUpdate()
      setInterval(() => {
        handleCharListUpdate()
      }, 60000) // update every 60 seconds
    }).catch(e => {
      console.error(e)
    })
  }, []);
  React.useLayoutEffect(() => {
    console.log('secondBoxMarginLeft', drawerRef.current?.getBoundingClientRect())
    setSecondBoxMarginLeft(drawerRef.current?.offsetWidth + 10)
  })
  return (
    <Mui.Box style={{ position: 'absolute', top: 0, left: 0, height: '100vh', width: '100vw', backgroundColor: usePrefersColorScheme() == 'light' ? theme.light.palette.surfaceContainer.main : theme.dark.palette.surfaceContainer.main }}>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)}></Message>
      <CreateStickerSetDialog state={createStickerSetDialogState} onOk={(name) => {
        console.log('create sticker set', name)
        handleListItemClick('', '')
        handleListItemClick('Stickers', '')
        setCreateStickerSetDialogState(false)
      }} onClose={() => {
        setCreateStickerSetDialogState(false)
      }} />
      <CreateTTSServiceDialog state={createTTSServiceDialogState} onOk={(name) => {
        console.log('create tts service', name)
        handleListItemClick('', '')
        handleListItemClick('TTS Services', '')
        setCreateTTSServiceDialogState(false)
      }} onClose={() => {
        setCreateTTSServiceDialogState(false)
      }} />

      <Mui.Drawer ref={drawerRef} open={true} onLoad={() => { console.log(drawerRef) }} class='scroll-container' variant="permanent" style={{ position: 'absolute', top: 0, left: 0, height: '100vh', width: '30vw' }}>
        <Mui.Toolbar>
          <Mui.Typography color="inherit" sx={{ fontWeight: 500, letterSpacing: 0.5, fontSize: 20 }}>
            CyberWaifu-V2
          </Mui.Typography>
        </Mui.Toolbar>
        <Mui.List style={{ padding: 10 }} >
          <Mui.Box>
            <Mui.ListItem sx={{ py: 2, px: 3, padding: 10 }}>
              <Mui.ListItemText sx={{ fontWeight: 'bold' }}>
                <Mui.Typography color="inherit" sx={{ ml: 1, fontSize: 15, fontWeight: 500 }} >
                  Chats
                </Mui.Typography>
              </Mui.ListItemText>
            </Mui.ListItem>
            {/* <Mui.ListItemButton component={Mui.Link} to='/' selected={selectedIndex == 'Home'} onClick={() => handleListItemClick('Home')}>
              <Mui.ListItemIcon>
                {selectedIndex == 'Home' ? <Mui.HomeIcon /> : <HomeIconOutlined />}
              </Mui.ListItemIcon>
              <Mui.ListItemText>Home</Mui.ListItemText>
            </Mui.ListItemButton> */}
            {charList.map((char, index) => (
              <Mui.ListItemButton key={index} selected={selectedIndex.title == char.charName} onClick={() => setSelectedIndex({ type: 'Character', title: char.charName, ...char })}>
                <Mui.ListItemIcon>
                  <Mui.Avatar src={Remote.charAvatar(char.id)} />
                </Mui.ListItemIcon>
                <Mui.ListItemText style={{ paddingLeft: 10, maxWidth: '20vw' }} secondaryTypographyProps={{ style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }} primary={char.charName} secondary={char.latestMsg} />
              </Mui.ListItemButton>
            ))}
          </Mui.Box>
          <Mui.Box>
            <Mui.ListItem sx={{ py: 2, px: 3, padding: 10 }}>
              <Mui.ListItemText sx={{ fontWeight: 'bold' }}>
                <Mui.Typography color="inherit" sx={{ ml: 1, fontSize: 15, fontWeight: 500 }} >
                  Settings
                </Mui.Typography>
              </Mui.ListItemText>
            </Mui.ListItem>
            <Mui.ListItemButton selected={selectedIndex.type === 'Stickers'} onClick={() => handleListItemClick('Stickers', 'Stickers')}>
              <Mui.ListItemIcon>
                <icons.EmojiEmotions />
              </Mui.ListItemIcon>
              <Mui.ListItemText style={{ paddingLeft: 10, maxWidth: '20vw' }} primary="Stickers"></Mui.ListItemText>
            </Mui.ListItemButton>
            <Mui.ListItemButton selected={selectedIndex.type === 'GPTSoViTsMiddleware'} onClick={() => handleListItemClick('GPTSoViTsMiddleware', 'GPT-SoVITs Middleware')}>
              <Mui.ListItemIcon>
                <icons.Mic />
              </Mui.ListItemIcon>
              <Mui.ListItemText style={{ paddingLeft: 10, maxWidth: '20vw' }} primary="GPT-SoVITs Middleware"></Mui.ListItemText>
            </Mui.ListItemButton>
            <Mui.ListItemButton selected={selectedIndex.type === 'Extensions'} onClick={() => handleListItemClick('Extensions', 'Extensions')}>
              <Mui.ListItemIcon>
                <icons.Extension />
              </Mui.ListItemIcon>
              <Mui.ListItemText style={{ paddingLeft: 10, maxWidth: '20vw' }} primary="Extensions"></Mui.ListItemText>
            </Mui.ListItemButton>
            <Mui.ListItemButton selected={selectedIndex.type === 'More'} onClick={() => handleListItemClick('More', 'More')}>
              <Mui.ListItemIcon>
                <icons.Apps />
              </Mui.ListItemIcon>
              <Mui.ListItemText style={{ paddingLeft: 10, maxWidth: '20vw' }} primary="More"></Mui.ListItemText>
            </Mui.ListItemButton>
          </Mui.Box>
        </Mui.List>
      </Mui.Drawer>
      <Mui.Box style={{ display: 'block', marginLeft: secondBoxMarginLeft }}>
        <Mui.AppBar style={{ paddingLeft: secondBoxMarginLeft }}>
          <Mui.Toolbar>
            {selectedIndex.type === 'CharacterEdit' && <Mui.IconButton color="inherit" onClick={() => {
              setSelectedIndex({ ...selectedIndex, type: 'Character' })
            }}>
              <icons.ArrowBack />
            </Mui.IconButton>}
            <Mui.Typography color="inherit" sx={{ fontWeight: 500, letterSpacing: 0.5, fontSize: 20, flexGrow: 1 }}>
              {selectedIndex.title}
            </Mui.Typography>
            {selectedIndex.type === 'Character' && <Mui.IconButton color="inherit" onClick={() => {
              setSelectedIndex({ ...selectedIndex, type: 'CharacterEdit' })
            }}>
              <icons.MoreVert />
            </Mui.IconButton>}
            {selectedIndex.type === 'Stickers' && <Mui.IconButton color="inherit" onClick={() => {
              setCreateStickerSetDialogState(true)
            }}>
              <icons.Add />
            </Mui.IconButton>}
          </Mui.Toolbar>
        </Mui.AppBar>
        <Mui.Toolbar />
        <Mui.Paper style={{ padding: 0, borderTopLeftRadius: 30, height: `calc(100vh - 64px)` }}>
          {selectedIndex.type === 'Home' && <EmptyChatView />}
          {selectedIndex.type === 'More' && <More />}
          {selectedIndex.type === 'Character' && <ChatroomView key={`room-${selectedIndex.title}`} {...selectedIndex} />}
          {selectedIndex.type === 'CharacterEdit' && <CharacterEdit key={`edit-${selectedIndex.title}`} {...selectedIndex} />}
          {selectedIndex.type === 'TTS Services' && <TTSServicesView></TTSServicesView>}
          {selectedIndex.type === 'Stickers' && <StickersView></StickersView>}
          {selectedIndex.type === 'GPTSoViTsMiddleware' && <GPTSoViTsMiddleware></GPTSoViTsMiddleware>}
          {selectedIndex.type === 'Extensions' && <Extensions></Extensions>}
        </Mui.Paper>
      </Mui.Box>
    </Mui.Box>
  )
}

export default Home