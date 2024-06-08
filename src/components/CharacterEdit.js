import React from 'react';

import Message from '../components/Message';
import icons from '../shared/icons';
import mui from '../shared/mui';
import * as Remote from '../shared/remote';
import ContentEditDialog from './ContentEditDialog';
import StickerSetSelector from './StickerSetSelector';
import TTSServiceSelector from './TTSServiceSelector';

function CharacterEdit({ id, charNameInit }) {
  const [charInfo, setCharInfo] = React.useState({})
  const [messageTitle, setMessageTitle] = React.useState('')
  const [messageContent, setMessageContent] = React.useState('')
  const [messageType, setMessageType] = React.useState('success')
  const [messageOpen, setMessageOpen] = React.useState(false)

  // fields
  const [charName, setCharName] = React.useState("")
  const [charPrompt, setCharPrompt] = React.useState("")
  const [charAvatarUrl, setCharAvatarUrl] = React.useState("")
  const [pastMemories, setPastMemories] = React.useState("")
  const [exampleChats, setExampleChats] = React.useState("")
  const [useStickerSet, setUseStickerSet] = React.useState(null)
  const [useTTSService, setUseTTSService] = React.useState(null)
  const [initialized, setInitialized] = React.useState(false)


  let refreshCharInfo = () => {
    Remote.getCharacterInfo(id).then(r => {
      if (r.data.status) {
        setCharAvatarUrl(Remote.charAvatar(r.data.data.id))
        setCharName(r.data.data.charName)
        setCharPrompt(r.data.data.charPrompt)
        setPastMemories(r.data.data.pastMemories)
        setExampleChats(r.data.data.exampleChats)
        Remote.getStickerSetInfo(r.data.data.emotionPack).then(r => {
          if (r.status) {
            setUseStickerSet(r.data.data)
          }
        })
        if (r.data.data.ttsServiceId !== 0) {
          Remote.getTTSServiceInfo(r.data.data.ttsServiceId).then(r => {
            if (r.status) {
              setUseTTSService(r.data.data)
            }
          })
        } else {
          setUseTTSService({
            id: 0,
            name: "None",
            description: "Do not use TTS service during conversation"
          })
        }
        setTimeout(() => { setInitialized(true) }, 100)
      } else {
        setMessageTitle('Error')
        setMessageContent(r.data.data)
        setMessageType('error')
        setMessageOpen(true)
      }
    }).catch(e => {
      setMessageType('error')
      setMessageTitle('Error')
      setMessageContent(e.message)
      setMessageOpen(true)
    })
  }

  React.useEffect(() => {
    setInitialized(false)
    refreshCharInfo()
  }, [id, charName])

  let submitChange = (charName, charPrompt, pastMemories, exampleChats, useStickerSet, useTTSService) => {
    Remote.editCharacter(id, charName, charPrompt, pastMemories, exampleChats, useStickerSet, useTTSService).then(r => {
      if (r.status) {
        setMessageTitle('Success')
        setMessageContent('Character information updated successfully')
        setMessageType('success')
        setMessageOpen(true)
        refreshCharInfo()
      } else {
        setMessageTitle('Error')
        setMessageContent(r.data.data)
        setMessageType('error')
        setMessageOpen(true)
      }
    }).catch(e => {
      setMessageType('error')
      setMessageTitle('Error')
      setMessageContent(e.message)
      setMessageOpen(true)
    })
  }

  return <mui.Box sx={{ height: '100%', width: 'calc(100% - 30px)', marginLeft: 30 }}>
    <mui.Box sx={{ overflow: 'scroll', height: '100%' }}>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />
      {/* align avatar to center */}

      <mui.Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 'calc(100% - 30px)', padding: 20 }}>
        <mui.Avatar src={Remote.charAvatar(id)} sx={{ height: 64, width: 64 }}></mui.Avatar>
      </mui.Box>
      <mui.List>
        <ContentEditDialog
          title="Character Name"
          description={`Enter new name for ${charName}`}
          icon={<icons.Person />}
          defaultValue={charName}
          onOk={(v) => {
            setCharName(v)
            submitChange(v, charPrompt, pastMemories, exampleChats, useStickerSet.id, useTTSService.id)
          }}
        />
        <ContentEditDialog
          title="Character Prompt"
          description={`Enter the prompt for ${charName}`}
          icon={<icons.Description />}
          defaultValue={charPrompt}
          onOk={(v) => {
            setCharPrompt(v)
            submitChange(charName, v, pastMemories, exampleChats, useStickerSet.id, useTTSService.id)
          }}
        />
        <ContentEditDialog
          title="Past Memories"
          description={`Enter the past memories for ${charName}`}
          icon={<icons.Bookmark />}
          defaultValue={pastMemories}
          onOk={(v) => {
            setPastMemories(v)
            submitChange(charName, charPrompt, v, exampleChats, useStickerSet.id, useTTSService.id)
          }}
        />
        <ContentEditDialog
          title="Example Chats"
          description={`Enter example chats for ${charName}`}
          icon={<icons.ChatBubble />}
          defaultValue={exampleChats}
          onOk={(v) => {
            setExampleChats(v)
            submitChange(charName, charPrompt, pastMemories, v, useStickerSet.id, useTTSService.id)
          }}
        />
        <TTSServiceSelector
          onChange={(v) => { setUseTTSService(v); submitChange(charName, charPrompt, pastMemories, exampleChats, useStickerSet.id, v.id) }}
          defaultValue={useTTSService}
          onErr={(e) => {
            setMessageType('error')
            setMessageTitle('Error')
            setMessageContent(e)
            setMessageOpen(true)
          }}
        />
        <StickerSetSelector
          onChange={(v) => { setUseStickerSet(v); submitChange(charName, charPrompt, pastMemories, exampleChats, v.id, useTTSService.id) }}
          defaultValue={useStickerSet}
          onErr={(e) => {
            setMessageType('error')
            setMessageTitle('Error')
            setMessageContent(e)
            setMessageOpen(true)
          }}
        />

      </mui.List>
    </mui.Box>
  </mui.Box>
}

export default CharacterEdit