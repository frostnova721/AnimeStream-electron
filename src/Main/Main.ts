import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import { TGlobalVar } from '../Types';
import { clearRuntimeCache } from '../Core';
import * as fs from 'fs';

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
};

const anilistData = {
    data: '' as any,
};

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
    });

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
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false,
                },
            });

            newWindow.loadFile(path.join(__dirname, '../../Public/html/Settings.html'));

            newWindow.on('close', () => {
                globalVars.subWindows--;
            });

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
};

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
