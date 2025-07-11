import 'react-photo-view/dist/react-photo-view.css';

import React from 'react';

import {
  PhotoProvider,
  PhotoView,
} from 'react-photo-view';
import usePrefersColorScheme from 'use-prefers-color-scheme';

import fs from '../shared/fs';
import icons from '../shared/icons';
import Mui from '../shared/mui';
import * as Remote from '../shared/remote';
import theme from '../shared/theme';
import AudioMessagesView from './AudioMessagesView';
import Message from './Message';
import StickerPicker from './StickerPicker';

const getCursorPosition = (ctrl) => {
  let CaretPos = {
    start: 0,
    end: 0
  };
  if (ctrl?.resizableTextArea?.textArea.selectionStart) {
    CaretPos.start = ctrl?.resizableTextArea?.textArea.selectionStart;
  }
  if (ctrl?.resizableTextArea?.textArea.selectionEnd) {
    CaretPos.end = ctrl?.resizableTextArea?.textArea.selectionEnd;
  }
  return CaretPos;
}

const setCursorPosition = (ctrl, start, end) => {
  ctrl.focus();
  if (ctrl?.resizableTextArea?.textArea.selectionStart) {
    ctrl.resizableTextArea.textArea.selectionStart = start;
  }
  if (ctrl?.resizableTextArea?.textArea.selectionEnd) {
    ctrl.resizableTextArea.textArea.selectionEnd = end;
  }
}

function useIsInViewport(ref) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  const observer = React.useMemo(
    () =>
      new IntersectionObserver(([entry]) =>
        setIsIntersecting(entry.isIntersecting),
      ),
    [],
  );

  React.useEffect(() => {
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, observer]);

  return isIntersecting;
}

function ChatroomView({ id, charName }) {
  // toolbar ref
  const toolbarRef = React.useRef(null);
  let scheme = usePrefersColorScheme()
  // message related
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('')
  const [messageOpen, setMessageOpen] = React.useState(false)

  // old message view component states and refs, required for porting work
  const [messageViewHeight, setMessageViewHeight] = React.useState('');
  const [chatHistoryView, setChatHistoryView] = React.useState([]);
  const [isReceivingMessage, setIsReceivingMessage] = React.useState(false)
  const charHistoryOffset = React.useRef(0)
  const chatSession = React.useRef(null)
  const [useStickerSet, setUseStickerSet] = React.useState(0)
  const [availableStickers, setAvailableStickers] = React.useState([])
  const [sessionUsername, setSessionUsername] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [isInitializing, setIsInitializing] = React.useState(true)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // sending message related
  const [chatFilesView, setChatFilesView] = React.useState([])
  const keepAliveTimer = React.useRef(null)
  const [isTyping, setIsTyping] = React.useState(false)
  const [pendingMsgChain, setPendingMsgChain] = React.useState([])
  const [pendingSendTimer, setPendingSendTimer] = React.useState(null)
  const chatFiles = React.useRef([])
  const [chatMessageInput, setChatMessageInput] = React.useState('')
  const chatMessageInputRef = React.useRef(null)
  const cursorRef = React.useRef({
    start: 0,
    end: 0
  })

  const chatHistoryViewRef = React.useRef(null)
  const dummyMsgRef = React.useRef(null)
  const dummyLoadingRef = React.useRef(null)
  const loadingVisible = useIsInViewport(dummyLoadingRef)

  // sticker & attachment
  const [isStickerPickerOpen, setIsStickerPickerOpen] = React.useState(false)
  const [stickerPickerAnchorEl, setStickerPickerAnchorEl] = React.useState(null)

  function loadChatHistory() {
    Remote.charHistory(id, charHistoryOffset.current++).then(r => {
      if (r.data.status) {
        console.log(id, r.data.data)
        receiveMessage(r.data.data, true)
      } else {
        setMessageTitle('Failed to fetch chat history')
        setMessageContent(r.data.data)
        setMessageType('error')
        setMessageOpen(true)
      }
    }).catch(r => {
      setMessageTitle('Failed to fetch chat history')
      setMessageContent('NetworkError')
      setMessageType('error')
      setMessageOpen(true)
    })
  }

  React.useEffect(() => {
    if (loadingVisible && chatHistoryView.length !== 0 && !isInitializing) {
      console.log('草泥马', chatHistoryView)
      setIsLoading(true)
      loadChatHistory()
    }
  }, [loadingVisible])

  React.useEffect(() => {
    setChatHistoryView([])
    charHistoryOffset.current = 0
    setIsInitialized(false)
  }, [id, charName])

  React.useEffect(() => {
    if (chatHistoryView.length === 0 && !isInitialized) {
      // switch to another character
      chatSession.current = null
      charHistoryOffset.current = 0
      Remote.getCharacterInfo(id).then(r => {
        if (r.data.status) {
          setUseStickerSet(r.data.data.emotionPack)
        }
      })
      Remote.getUserName().then(r => {
        setSessionUsername(r)
      })
      loadChatHistory()
    } else {
      if (!isLoading) {
        console.log('Scrolling')
        dummyMsgRef.current?.scrollIntoView({ behavior: 'smooth' })
      } else {
        setIsLoading(false)
      }
    }
  }, [chatHistoryView])

  React.useEffect(() => {
    updateCursurPosition()
  }, [chatMessageInput])

  React.useEffect(() => {
    if (useStickerSet !== 0) {
      Remote.stickerList(useStickerSet).then(r => {
        if (r.data.status) {
          console.log(r.data.data)
          setAvailableStickers(r.data.data)
        }
      })
    }
  }, [useStickerSet])

  React.useEffect(() => {
    console.log('triggerred reset pending msg timer by message chain change')
    addTemporaryMessage(pendingMsgChain)
    resetPendingMsgTimer()
  }, [pendingMsgChain])

  React.useEffect(() => {
    chatFiles.current = [...chatFilesView]
  }, [chatFilesView])


  function receiveMessage(response, order = false) {
    setIsReceivingMessage(false)
    if (order) {
      console.log('reversed order')
      chatHistoryView.forEach(k => {
        response.push(k)
      })
      setChatHistoryView(response)
      if (isInitializing) {
        dummyMsgRef.current?.scrollIntoView({ behavior: 'auto' })
        setTimeout(() => setIsInitializing(false), 100)
        setIsInitialized(true)
      }
    } else {
      // Filter out temporary messages from the chat history
      const filteredHistory = chatHistoryView.filter(message => !message.role.endsWith('_temporary'));

      // Create a queue to maintain order of messages
      const messageQueue = []
      let firstFlag = true

      // Process each response and add it to the queue with calculated delay
      response.forEach(resp => {
        let delay = 0
        if (resp.role === 'model' && resp.type === 0) {
          if (firstFlag) {
            delay = resp.text.length * 10 // Calculate delay based on text length
          } else {
            firstFlag = false
          }
        }

        messageQueue.push({ message: resp, delay })
      });

      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }

      // Process each message in the queue
      (async () => {
        for (let i = 0; i < messageQueue.length; i++) {
          const { message, delay } = messageQueue[i]
          console.log('Processing message', message, 'with delay', delay)
          await timeout(delay)
          filteredHistory.push(message)
          setChatHistoryView([...filteredHistory])
        }
      })()
    }
  }

  function clearTemporaryMessage() {
    let a = []
    chatHistoryView.forEach(k => { return k.role.endsWith('_temporary') ? null : a.push(k) })
    setChatHistoryView(a)
  }

  function addTemporaryMessage(msgChain) {
    // setChatHistoryView([...chatHistoryView, { role: 'user_temporary', type: 0, text: 'Sending...' }])
    let a = []
    chatHistoryView.forEach(k => { return k.role.endsWith('_temporary') ? null : a.push(k) })
    let to_push = msgChain.map(v => {
      if (v.startsWith('image:')) {
        return { role: 'user_temporary', type: 1, text: v.substring(6) }
      } else if (v.startsWith('audio:')) {
        return { role: 'user_temporary', type: 2, text: v.substring(6) }
      } else {
        return { role: 'user_temporary', type: 0, text: v }
      }
    })
    console.log('adding temporary message', to_push)
    setChatHistoryView([...a, ...to_push])
  }

  function buildTextView(availableStickers, text) {
    return Remote.splitEmotionAndText(availableStickers, text).map((v, k) => {
      if (v.startsWith('text:')) {
        return v.substring(5)
      } else {
        return <img style={{ width: 'auto', display: 'inline-block', height: 48, borderRadius: 24 }} imageStyle={{ borderRadius: 24 }} src={Remote.stickerGet(useStickerSet, v.substring('4'))} />
      }
    })
  }

  React.useLayoutEffect(() => {
    console.log('toolbar', toolbarRef.current?.offsetHeight)
    setMessageViewHeight(`calc(100% - ${toolbarRef.current?.offsetHeight}px)`)
  })

  function uploadAllAttachment() {
    return (async () => {
      for (let i in chatFiles.current) {
        console.log(i)
        let r = await fs.uploadAsync(chatFiles.current[i].type.startsWith('image/') ? Remote.attachmentUploadImage() : Remote.attachmentUploadAudio(), chatFiles.current[i])
        if (r.status == 200) {
          let data = await r.json()
          if (data.status) {
            chatFiles.current[i] = data.id
          } else {
            throw data.data
          }
        } else {
          throw 'NetworkError'
        }
      }
    })()
  }

  function clearChatImages() {
    chatFiles.current = []
    setChatFilesView([])
  }

  function sendMessageChain(msgChain) {
    if (chatSession.current === null) {
      setIsReceivingMessage(true)
      Remote.chatEstablish(charName, msgChain).then(r => {
        if (r.data.status) {
          console.log(r.data)
          chatSession.current = r.data.session
          receiveMessage(r.data.response)
        }
        setPendingMsgChain([])
      })
    } else {
      setIsReceivingMessage(true)
      Remote.chatMessage(chatSession.current, msgChain).then(r => {
        if (r.data.status) {
          receiveMessage(r.data.response)
        } else {
          // setMessageText(`Failed to send message: ${r.data.data}`)
          // setMessageState(true)
          setMessageTitle('Failed to send message')
          setMessageContent(r.data.data)
          setMessageType('error')
          setMessageOpen(true)
        }
        setPendingMsgChain([])
      }).catch(r => {
        // setMessageText(`Failed to send message: NetworkError`)
        // setMessageState(true)
        setMessageTitle('Failed to send message')
        setMessageContent('NetworkError')
        setMessageType('error')
        setMessageOpen(true)
      })
    }
  }

  function sendAudio(attachmentId) {
    setPendingMsgChain([...pendingMsgChain, `audio:${attachmentId}`])
  }

  function buildMessageChain(text, images) {
    let msgChain = [...pendingMsgChain] // force copy, otherwise it can't trigger resetPendingMsgTimer
    if (text.length !== 0) {
      msgChain.push(text)
    }
    images.map(v => { msgChain.push('image:' + v) })
    clearChatImages()
    setChatMessageInput('')
    setPendingMsgChain(msgChain)
  }

  function discardPendingMessageTimer() {
    if (pendingSendTimer !== null) {
      clearTimeout(pendingSendTimer)
      setPendingSendTimer(null)
    }
  }

  function resetPendingMsgTimer() {
    if (pendingMsgChain.length === 0) {
      return
    }
    let f = () => sendMessageChain(pendingMsgChain)
    if (pendingSendTimer !== null) {
      console.log('not null, clearing timeout', pendingSendTimer)
      clearTimeout(pendingSendTimer)
    }
    // if user is recording voice message, do not send message immediately
    // deprecated: cuz it will discard this timer directly.
    // if (audioRecordingStatus) {
    //   console.log('delayed sending message by 1145141919')
    //   setPendingSendTimer(setTimeout(f, 1145141919))
    // }

    // if user is typing message, wait for 10 seconds before sending
    // if (isTyping) {
    //   setPendingSendTimer(setTimeout(f, 10000))
    // }
    // if menu is open, user probably wants to send emotion stickers, so postpone sending message
    console.log('random timeout', Math.floor((Math.random() * 1000) % 4000 + 1000))
    setPendingSendTimer(setTimeout(f, Math.floor((Math.random() * 1000) % 4000 + 1000)))
  }

  function updateCursurPosition() {
    let CaretPos = getCursorPosition(chatMessageInputRef.current)
    console.log('update cursor position', CaretPos)
    cursorRef.current = CaretPos
  }

  function addAttachment() {
    fs.launchFilePickerAsync('image/*; audio/*', true).then(r => {
      setChatFilesView([...chatFilesView, ...r])
      console.log('selected files', chatFiles.current)
    })
  }

  return (
    <Mui.Box sx={{ height: '100%', width: 'calc(100% - 30px)', marginLeft: 30 }}>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />
      <Mui.Box ref={chatHistoryViewRef} data-overlayscrollbars-initialize height={messageViewHeight} sx={{ paddingRight: 30 }} overflow={'scroll'}>
        <Mui.Box ref={dummyLoadingRef} sx={{ display: isInitializing ? 'none' : 'block' }} display={'flex'} width={'100%'}></Mui.Box>
        <Mui.Box height={'10vh'}></Mui.Box>
        <PhotoProvider>
          {chatHistoryView.map((v, k) => <Mui.Box key={v.id} style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            marginBottom: 10,
            justifyContent: v.role.startsWith('model') ? 'flex-start' : 'flex-end',
          }}>
            {(v.role.startsWith('model')) && (
              <>
                <Mui.Avatar style={{ marginRight: 10 }} src={Remote.charAvatar(id)}></Mui.Avatar>
                <Mui.Box style={{ flexDirection: 'column', maxWidth: '50vw' }}>
                  <Mui.Typography variant='body2' style={{ marginBottom: 5, textAlign: 'left' }}>{charName}</Mui.Typography>
                  {v.type == 0 &&
                    <Mui.Paper elevation={3} style={{ padding: 10, borderRadius: 10, backgroundColor: scheme == 'light' ? theme.light.palette.surfaceContainer.main : theme.dark.palette.surfaceContainer.main }}>
                      <Mui.Typography variant='body2'>{buildTextView(availableStickers.map(r => r.name), v.text)}</Mui.Typography>
                    </Mui.Paper>
                  }
                  {v.type == 2 && <AudioMessagesView audioUrl={Remote.attachmentDownload(v.text)} />}
                </Mui.Box>
              </>)}
            {(v.role.startsWith('user')) && (
              <>
                <Mui.Box style={{ flexDirection: 'column', maxWidth: '50vw' }}>
                  <Mui.Typography variant='body2' style={{ marginBottom: 5, textAlign: 'right' }}>{sessionUsername}</Mui.Typography>
                  {v.type == 0 &&
                    <Mui.Paper elevation={3} style={{ padding: 10, borderRadius: 10, backgroundColor: scheme == 'light' ? theme.light.palette.surfaceContainer.main : theme.dark.palette.surfaceContainer.main }}>
                      <Mui.Typography variant='body2'>{buildTextView(availableStickers.map(r => r.name), v.text)}</Mui.Typography>
                    </Mui.Paper>
                  }
                  {v.type == 1 && <PhotoView key={k} src={Remote.attachmentDownload(v.text)}><img src={Remote.attachmentDownload(v.text)} style={{ maxHeight: '20vh', width: 'auto', borderRadius: 10 }}></img></PhotoView>}
                  {v.type == 2 && <AudioMessagesView audioUrl={Remote.attachmentDownload(v.text)} />}
                </Mui.Box>
                <Mui.Avatar style={{ marginLeft: 10 }} src={Remote.getAvatar()}></Mui.Avatar>
              </>)}
          </Mui.Box>)}
        </PhotoProvider>
        <Mui.Box ref={dummyMsgRef} style={{ height: 0, width: 0, opacity: 0 }}></Mui.Box>
      </Mui.Box>
      <Mui.Grid ref={toolbarRef} container sx={{ width: 'calc(70vw - 30px)', position: 'absolute', bottom: 0, backgroundColor: scheme == 'light' ? theme.light.palette.surface.main : theme.dark.palette.surface.main }} >
        <Mui.Grid item xs={12} sx={{ paddingY: 10 }}>
          {isReceivingMessage && <Mui.Typography variant='body2'><b>{charName}</b> is typing...</Mui.Typography>}
        </Mui.Grid>
        <Mui.Grid item xs={8}>
          <Mui.TextField ref={chatMessageInputRef}
            onFocus={() => {
              discardPendingMessageTimer()
              if (chatSession.current) {
                keepAliveTimer.current = setInterval(() => {
                  Remote.chatKeepAlive(chatSession.current)
                }, 5000)
              }
            }} onBlur={() => {
              updateCursurPosition()
              resetPendingMsgTimer()
              if (keepAliveTimer.current) {
                console.log('clearing keepalive timer')
                clearInterval(keepAliveTimer.current)
              }
            }}
            onPaste={(e) => {
              e.preventDefault()
              let items = (e.clipboardData || e.originalEvent.clipboardData).items;
              for (var index in items) {
                var item = items[index];
                if (item.kind === 'file') {
                  let blob = item.getAsFile();
                  setChatFilesView([...chatFilesView, blob])
                }
              }
            }}
            value={chatMessageInput} onChange={(e) => {
              setChatMessageInput(e.target.value)
              updateCursurPosition()
            }} sx={{ width: '100%' }} variant='standard' multiline maxRows={4} label={''} placeholder='Type a message...' ></Mui.TextField>
        </Mui.Grid>
        <Mui.Grid item xs={4}>
          <Mui.Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', alignSelf: 'center', width: '100%' }}>
            <Mui.IconButton color='primary' variant='contained' onClick={(e) => {
              setIsStickerPickerOpen(!isStickerPickerOpen)
              setStickerPickerAnchorEl(e.currentTarget)
            }}>
              <icons.EmojiEmotions />
              <StickerPicker anchorEl={stickerPickerAnchorEl} useStickerSet={useStickerSet} availableStickers={availableStickers} open={isStickerPickerOpen} onClose={(v) => {
                // insert sticker to current position of chatMessageInput
                v = `(${v})`
                const insertStart = cursorRef.current.start
                const insertEnd = cursorRef.current.end + v.length
                const newText = chatMessageInput.slice(0, insertStart) + v + chatMessageInput.slice(insertStart)
                setTimeout(() => {
                  console.log('inserting sticker', v, 'to', insertStart, insertEnd)
                  setCursorPosition(chatMessageInputRef.current, insertEnd, insertEnd)
                  cursorRef.current = { start: insertEnd, end: insertEnd }
                }, 200)
                setChatMessageInput(newText)
              }} />
            </Mui.IconButton>
            <Mui.IconButton color='primary' variant='contained' onClick={() => addAttachment()} >
              <icons.Attachment />
            </Mui.IconButton>
            <Mui.IconButton color='primary' variant='contained' onClick={() => {
              window.api.invoke('create-voice-chat-window', charName)
            }} >
              <icons.VoiceChat />
            </Mui.IconButton>
            <Mui.Button variant='contained' startIcon={<icons.Send />} onClick={() => {
              uploadAllAttachment().then(() => {
                buildMessageChain(chatMessageInput, chatFiles.current)
              }).catch(r => {
                setMessageTitle('Error')
                setMessageContent(r)
                setMessageType('error')
                setMessageOpen(true)
              })
              chatFiles.current = []
            }}>
              Send
            </Mui.Button>
          </Mui.Box>
        </Mui.Grid>
        <Mui.Grid item xs={12}>
          {chatFilesView.length !== 0 && <Mui.List sx={{ width: '100%', paddingY: 10, maxHeight: '30vh', overflow: 'scroll' }} data-overlayscrollbars-initialize>
            {chatFilesView.map((v, k) => <Mui.ListItem key={k}>
              <Mui.ListItemIcon>
                {v.type.startsWith('audio/') && <icons.VoiceChat />}
                {v.type.startsWith('image/') && <Mui.Avatar src={URL.createObjectURL(v)} sx={{ width: 24, height: 24 }}></Mui.Avatar>}
              </Mui.ListItemIcon>
              <Mui.ListItemText primary={v.name} secondary={v.type.startsWith('audio/') ? 'Voice message' : 'Image attachment'} />
              <Mui.ListItemSecondaryAction>
                <Mui.IconButton color='primary' edge='end' onClick={() => {
                  setChatFilesView([...chatFilesView.slice(0, k), ...chatFilesView.slice(k + 1)])
                }}><icons.Delete /></Mui.IconButton>
              </Mui.ListItemSecondaryAction>
            </Mui.ListItem>)}
          </Mui.List>}
        </Mui.Grid>
      </Mui.Grid>
    </Mui.Box >
  )
}

export default ChatroomView;