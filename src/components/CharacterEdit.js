import React from 'react';

import Message from '../components/Message';
import icons from '../shared/icons';
import Mui from '../shared/mui';
import * as Remote from '../shared/remote';
import ContentEditDialog from './ContentEditDialog';
import StickerSetSelector from './StickerSetSelector';
import TTSServiceSelector from './TTSServiceSelector';
import TTSModelSelector from './TTSModelSelector';

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
  const [useTTSModel, setUseTTSModel] = React.useState("None")
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
        if (r.data.data.AIDubUseModel !== "None") {
          setUseTTSModel(r.data.data.AIDubUseModel)
          console.log(r.data.data.AIDubUseModel)
        } else {
          setUseTTSModel("None")
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

  let submitChange = (charName, charPrompt, pastMemories, exampleChats, useStickerSet, useTTSModel) => {
    Remote.editCharacter(id, charName, charPrompt, pastMemories, exampleChats, useStickerSet, useTTSModel).then(r => {
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

  return <Mui.Box sx={{ height: '100%', width: 'calc(100% - 30px)', marginLeft: 30 }}>
    <Mui.Box data-overlayscrollbars-initialize sx={{ overflow: 'scroll', height: '100%' }}>
      <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />
      {/* align avatar to center */}

      <Mui.Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 'calc(100% - 30px)', padding: 20 }}>
        <Mui.Avatar src={Remote.charAvatar(id)} sx={{ height: 64, width: 64 }}></Mui.Avatar>
      </Mui.Box>
      <Mui.List>
        <ContentEditDialog
          title="Character Name"
          description={`Enter new name for ${charName}`}
          icon={<icons.Person />}
          defaultValue={charName}
          onOk={(v) => {
            setCharName(v)
            submitChange(v, charPrompt, pastMemories, exampleChats, useStickerSet.id, useTTSModel)
          }}
        />
        <ContentEditDialog
          title="Character Prompt"
          description={`Enter the prompt for ${charName}`}
          icon={<icons.Description />}
          defaultValue={charPrompt}
          onOk={(v) => {
            setCharPrompt(v)
            submitChange(charName, v, pastMemories, exampleChats, useStickerSet.id, useTTSModel)
          }}
        />
        <ContentEditDialog
          title="Past Memories"
          description={`Enter the past memories for ${charName}`}
          icon={<icons.Bookmark />}
          defaultValue={pastMemories}
          onOk={(v) => {
            setPastMemories(v)
            submitChange(charName, charPrompt, v, exampleChats, useStickerSet.id, useTTSModel)
          }}
        />
        <ContentEditDialog
          title="Example Chats"
          description={`Enter example chats for ${charName}`}
          icon={<icons.ChatBubble />}
          defaultValue={exampleChats}
          onOk={(v) => {
            setExampleChats(v)
            submitChange(charName, charPrompt, pastMemories, v, useStickerSet.id, useTTSModel)
          }}
        />
        <TTSModelSelector
          onChange={(v) => { setUseTTSModel(v); submitChange(charName, charPrompt, pastMemories, exampleChats, useStickerSet.id, v) }}
          defaultValue={useTTSModel}
          onErr={(e) => {
            setMessageType('error')
            setMessageTitle('Error')
            setMessageContent(e)
            setMessageOpen(true)
          }}
        />
        <StickerSetSelector
          onChange={(v) => { setUseStickerSet(v); submitChange(charName, charPrompt, pastMemories, exampleChats, v.id, useTTSModel) }}
          defaultValue={useStickerSet}
          onErr={(e) => {
            setMessageType('error')
            setMessageTitle('Error')
            setMessageContent(e)
            setMessageOpen(true)
          }}
        />

      </Mui.List>
    </Mui.Box>
  </Mui.Box>
}

export default CharacterEdit