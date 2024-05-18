import React from 'react';

import { usePrefersColorScheme } from 'use-prefers-color-scheme';

import EmptyChatView from '../components/EmtryChatView';
import Message from '../components/Message';
import icons from '../shared/icons';
import mui from '../shared/mui';
import * as Remote from '../shared/remote';
import theme from '../shared/theme';

function Home() {
  const [selectedIndex, setSelectedIndex] = React.useState({
    type: 'Home',
    title: 'Home'
  });
  const [charList, setCharList] = React.useState([]);

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
        window.location.href = '/signin'
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
      <mui.Drawer ref={drawerRef} onLoad={() => { console.log(drawerRef) }} variant="permanent" style={{ position: 'absolute', top: 0, left: 0, height: '100vh', width: '30vw' }}>
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
              <mui.ListItemButton key={index} selected={selectedIndex.title == char.charName} onClick={() => handleListItemClick('Character', char.charName)}>
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
              <mui.ListItemText  style={{ paddingLeft: 10, maxWidth: '20vw' }} primary="Stickers"></mui.ListItemText>
            </mui.ListItemButton>
            <mui.ListItemButton selected={selectedIndex.type == 'TTS Services'} onClick={() => handleListItemClick('TTS Services', 'TTS Services')}>
              <mui.ListItemIcon>
                <icons.Mic />
              </mui.ListItemIcon>
              <mui.ListItemText  style={{ paddingLeft: 10, maxWidth: '20vw' }} primary="TTS Services"></mui.ListItemText>
            </mui.ListItemButton>
            <mui.ListItemButton selected={selectedIndex.type == 'About'} onClick={() => handleListItemClick('About', 'About')}>
              <mui.ListItemIcon>
                <icons.Apps />
              </mui.ListItemIcon>
              <mui.ListItemText  style={{ paddingLeft: 10, maxWidth: '20vw' }} primary="About"></mui.ListItemText>
            </mui.ListItemButton>
          </mui.Box>
        </mui.List>
      </mui.Drawer>
      <mui.Box style={{ display: 'block', marginLeft: secondBoxMarginLeft }}>
        <mui.AppBar style={{ paddingLeft: secondBoxMarginLeft }}>
          <mui.Toolbar>
          {selectedIndex.type == 'CharacterEdit' && <mui.IconButton color="inherit" onClick={() => {
              setSelectedIndex({...selectedIndex, type: 'Character'})
            }}>
              <icons.ArrowBack />
            </mui.IconButton>}
            <mui.Typography color="inherit" sx={{ fontWeight: 500, letterSpacing: 0.5, fontSize: 20, flexGrow: 1 }}>
              {selectedIndex.title}
            </mui.Typography>
            {selectedIndex.type == 'Character' && <mui.IconButton color="inherit" onClick={() => {
              setSelectedIndex({...selectedIndex, type: 'CharacterEdit'})
            }}>
              <icons.MoreVert />
            </mui.IconButton>}
            {selectedIndex.type == 'Stickers' && <mui.IconButton color="inherit" onClick={() => {
              // TODO: implement add sticker pack
            }}>
              <icons.Add />
            </mui.IconButton>}
            {selectedIndex.type == 'TTS Services' && <mui.IconButton color="inherit" onClick={() => {
              // TODO: implement add TTS service
            }}>
              <icons.Add />
            </mui.IconButton>}
          </mui.Toolbar>
        </mui.AppBar>
        <mui.Toolbar />
        <mui.Paper style={{ padding: 0, borderTopLeftRadius: 30, height: `calc(100vh - 64px)`, paddingVertical: 30 }}>
          {selectedIndex.type == 'Home' && <EmptyChatView />}
        </mui.Paper>
      </mui.Box>
    </mui.Box>
  )
}

export default Home