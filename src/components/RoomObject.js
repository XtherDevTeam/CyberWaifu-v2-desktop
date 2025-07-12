import { io } from 'socket.io-client'
import React, { useState, useEffect } from 'react'

class RoomObject {
  constructor(token, serverUrl, beginMsg) {
    this.token = token
    this.serverUrl = serverUrl
    this.socket = io(`${this.serverUrl}/chat`, {
      autoConnect: false
    })
    this.connected = false
    this.events = {
      'message': [],
      'error': []
    }
    this.socket.on('connect', () => {
      console.log('Connected to server')
      if (!this.connected) {
        this.socket.emit('initialize', {
          sessionName: this.token,
          beginMsg: beginMsg
        })
        console.log(`Sent initialize message with token ${this.token} and begin message ${beginMsg}`)
      }
      this.connected = true
    })
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.connected = false
    })
    this.socket.on('message', (data) => {
      this.events['message'].forEach(callback => callback(data))
    })
    this.socket.on('error', (data) => {
      this.events['error'].forEach(callback => callback(data))
    })
  }

  connect() {
    this.socket.connect()
  }

  on(event, callback) {
    if (this.events[event]) {
      this.events[event].push(callback)
    }
  }

  emit(event, data) {
    if (this.connected) {
      this.socket.emit(event, data)
    }
  }

  sendMessage(msgChain) {
    this.emit('message', { msgChain })
  }
}

export default RoomObject

