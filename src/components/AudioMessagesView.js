import React from 'react';

import usePrefersColorScheme from 'use-prefers-color-scheme';

import icons from '../shared/icons';
import Mui from '../shared/mui';
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
      // reset to start position
      audioRef.current.currentTime = 0
    })
    return () => {
      // remove audioRef
      audioRef.current = null
    }
  }, [audioUrl])

  return (<Mui.Paper elevation={3} style={{ padding: 10, borderRadius: 10, backgroundColor: scheme == 'light' ? theme.light.palette.surfaceContainer.main : theme.dark.palette.surfaceContainer.main }}>
    <Mui.Box display="flex" width={"100%"} flexDirection={"row"} alignItems="center">
      <Mui.IconButton size='small' color="primary" onClick={() => {
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
      </Mui.IconButton>
      <Mui.Typography variant="body2">
        {isPlaying ? `${Math.floor(progress)}s / ${Math.floor(duration)}s` : 'Voice'}
      </Mui.Typography>
    </Mui.Box>
  </Mui.Paper>)
}

export default AudioMessagesView