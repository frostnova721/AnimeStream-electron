import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import path from 'path'
import { TGlobalVar } from '../Types'

if(require('electron-squirrel-startup')) {
    app.quit()
}

const globalVars: TGlobalVar = { 
    clickedResult: '',
    episodeId: '',
    subWindows: 0
}

const createWindow = () => {

    // const iconPath = path.join(__dirname, '../../Icons/animestream.ico')
    // const appIcon = nativeImage.createFromPath(iconPath)

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

    ipcMain.handle("createNewWindow", (e) => {
        if(globalVars.subWindows === 0) {
            globalVars.subWindows++

            const newWindow = new BrowserWindow({
                width: 800,
                height: 600,
                webPreferences: {
                    nodeIntegration: true,
                },
            })

            newWindow.loadFile(path.join(__dirname, '../../Public/html/Settings.html'))

            newWindow.on('close', () => {
                globalVars.subWindows--
            })
        }
    })

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