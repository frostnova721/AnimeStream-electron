import { app, BrowserWindow, nativeImage, Menu, MenuItem, dialog, ipcMain } from 'electron'
import path from 'path'
import { TGlobalVar } from '../Types'

if(require('electron-squirrel-startup')) {
    app.quit()
}

const globalVars: TGlobalVar = { 
    clickedResult: '',
    episodeId: ''
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 850,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    })

    mainWindow.loadFile(path.join(__dirname, '../../Public/html/Home.html'))

    if(!app.isPackaged) {
        mainWindow.webContents.openDevTools()
    }

    Menu.setApplicationMenu(null)

    ipcMain.handle("setCR", (e, link: string) => {
        globalVars.clickedResult = link
        return null;
    })

    ipcMain.handle("readCR", (e) => {
        return globalVars.clickedResult
    })

    ipcMain.handle("setEpisodeId", (e, episodeId: string) => {
        globalVars.episodeId = episodeId
        return null
    })

    ipcMain.handle("getEpisodeId", (e) => {
        return globalVars.episodeId
    })

    // ipcMain.handle('showDialog', (e, message, title, type))
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})