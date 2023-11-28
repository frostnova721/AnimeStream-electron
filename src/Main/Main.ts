import { app, BrowserWindow, Menu, ipcMain, dialog, nativeImage } from 'electron';
import path from 'path';
import { TGlobalVar } from '../Types';
import { clearRuntimeCache } from '../Core';
import * as fs from 'fs';
import { setupTitlebar, attachTitlebarToWindow } from 'custom-electron-titlebar/main'

if (!fs.existsSync('../../Cache')) {
    fs.mkdirSync('../../Cache');
}

if (!fs.existsSync('../../settings')) {
    fs.mkdirSync('../../settings');
}

if (require('electron-squirrel-startup')) {
    app.quit();
}

const globalVars: TGlobalVar = {
    clickedResult: '',
    episodeId: '',
    subWindows: 0,
    backTo: '',
    clickedAnilistLink: '',
};

const anilistData = {
    data: '' as any,
};

setupTitlebar()

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 980,
        titleBarStyle: 'hidden',
        icon: appIcon,
        frame: false,
        titleBarOverlay: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    attachTitlebarToWindow(mainWindow)

    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
    mainWindow.loadFile(path.join(__dirname, '../../Public/html/Home.html'));

    // if(!app.isPackaged) {
    mainWindow.webContents.openDevTools();
    // }

    Menu.setApplicationMenu(null);

    ipcMain.handle('dialog', (e, msg: string) => {
        dialog.showMessageBox({ message: msg, title: 'done!', type: 'none' });
    });

    ipcMain.handle('setCR', (e, link: string) => {
        globalVars.clickedResult = link;
        return null;
    });

    ipcMain.handle('readCR', (e) => {
        return globalVars.clickedResult;
    });

    ipcMain.handle('setEpisodeId', (e, episodeId: string) => {
        globalVars.episodeId = episodeId;
        return null;
    });

    ipcMain.handle('getEpisodeId', (e) => {
        return globalVars.episodeId;
    });

    ipcMain.handle('createNewWindow', (e) => {
        if (globalVars.subWindows === 0) {
            globalVars.subWindows++;

            const newWindow = new BrowserWindow({
                width: 800,
                height: 600,
                maxHeight: 600,
                maxWidth: 800,
                frame: false,
                titleBarStyle: 'hidden',
                titleBarOverlay: true,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                },
            });

            attachTitlebarToWindow(newWindow)

            newWindow.loadFile(path.join(__dirname, '../../Public/html/Settings.html'));

            newWindow.on('close', () => {
                globalVars.subWindows--;
            });

            if(!app.isPackaged)
                newWindow.webContents.openDevTools();
        }
    });

    ipcMain.handle('setBackTo', (e, to: string) => {
        globalVars.backTo = to;
        return;
    });

    ipcMain.handle('getBackTo', (e) => {
        return globalVars.backTo;
    });

    ipcMain.handle('storeAnimeData', (e, data: any) => {
        anilistData.data = JSON.parse(data);
        return;
    });

    ipcMain.handle('getStoredAnimeData', (e) => {
        return anilistData.data;
    });

    ipcMain.handle('getStoredAnilistLink', (e) => {
        return globalVars.clickedAnilistLink;
    });

    ipcMain.handle('setAnilistLink', (e, link: string) => {
        globalVars.clickedAnilistLink = link;
        return null;
    });
};

const icoPath = path.join(__dirname, '../../assets/icons/ICO.ico')
const appIcon = nativeImage.createFromPath(icoPath)

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    clearRuntimeCache();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
