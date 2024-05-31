import React from 'react'

function CharacterEdit({}) {
    const [messageTitle, setMessageTitle] = React.useState('')
    const [messageContent, setMessageContent] = React.useState('')
    const [messageType, setMessageType] = React.useState('success')
    const [messageOpen, setMessageOpen] = React.useState(false)

    return <mui.Box sx={{ height: '100%', width: 'calc(100% - 30px)', marginLeft: 30 }}>
        <Message title={messageTitle} message={messageContent} type={messageType} open={messageOpen} dismiss={() => setMessageOpen(false)} />
            
    </mui.Box>
}