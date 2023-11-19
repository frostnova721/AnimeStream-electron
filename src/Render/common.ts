import { Titlebar, TitlebarColor } from "custom-electron-titlebar"

document.addEventListener('DOMContentLoaded', () => {
    new Titlebar({
        backgroundColor: TitlebarColor.BLACK,
        minimizable: true,
        closeable: true,
        maximizable: true,
        titleHorizontalAlignment: 'left',
        tooltips: {
            minimize: 'minimize',
            maximize: 'maximize',
            close: 'close',
            restoreDown: 'restore'
        },

    })
})