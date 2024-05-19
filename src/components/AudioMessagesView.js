import React from 'react';

import usePrefersColorScheme from 'use-prefers-color-scheme';

import icons from '../shared/icons';
import mui from '../shared/mui';
import theme from '../shared/theme';

function AudioMessagesView({ audioUrl }) {
  let scheme = usePrefersColorScheme()
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)

  const audioRef = React.useRef(null)

  React.useEffect(() => {
    console.log(audioUrl)
    audioRef.current = new Audio(audioUrl)
    // add progress listener
    audioRef.current.addEventListener('timeupdate', () => {
      // save to state
      setProgress(audioRef.current.currentTime)
      setDuration(audioRef.current.duration)
    })
    // add end listener
    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false)
    })
    return () => {
      // remove audioRef
      audioRef.current = null
    }
  }, [audioUrl])

  return (<mui.Paper elevation={3} style={{ padding: 10, borderRadius: 10, backgroundColor: scheme == 'light' ? theme.light.palette.surfaceContainer.main : theme.dark.palette.surfaceContainer.main }}>
    <mui.Box display="flex" width={"100%"} flexDirection={"row"} alignItems="center">
      <mui.IconButton size='small' color="primary" onClick={() => {
        // toggle play/pause
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          audioRef.current.play()
          setIsPlaying(true)
        }
      }}>
        {isPlaying ? <icons.Pause /> : <icons.PlayArrow />}
      </mui.IconButton>
      <mui.Typography variant="body2">
        {isPlaying ? `${Math.floor(progress)}s / ${Math.floor(duration)}s` : 'Voice'}
      </mui.Typography>
    </mui.Box>
  </mui.Paper>)
}

export default AudioMessagesView