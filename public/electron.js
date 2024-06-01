const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

// ipcMain
const { ipcMain } = require('electron')
const { useCookie } = require('./useCookie')

useCookie()

// keep the window object global reference to prevent it from being garbage collected when the JavaScript object is released.
let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024, height: 600, webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  if (process.platform !== 'darwin') {
    mainWindow.setMenu(null)
  }

  /* 
   * 加载应用-----  electron-quick-start中默认的加载入口
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  */
  if (process.env.YOIMIYA === 'development') {
    mainWindow.webContents.openDevTools()
    mainWindow.loadURL('http://localhost:3000')
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))
  }

  
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

// listen event on `resize-window-normal`
ipcMain.on('resize-window-normal', function (event) {
  mainWindow.setSize(1024, 600)
})

// listen event on `resize-window-login`
ipcMain.on('resize-window-login', function (event) {
  mainWindow.setSize(320, 500)
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})