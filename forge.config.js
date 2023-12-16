module.exports = {
    packagerConfig: {
        icon: 'Assets/Icons/logo_new.ico',
        asar: true,
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                setupIcon: 'Assets/Icons/logo_new.ico',
                description: 'AnimeStream - An app to download and stream anime for free',
                exe: 'AnimeStream.exe',
                loadingGif: 'Assets/Icons/installer.gif',
                name: 'AnimeStream',
                authors: 'FrostNova'
            },
        },
        {
            name: '@electron-forge/maker-wix',
            config: {
                icon: 'Assets/Icons/logo_new.ico',
                name: 'AnimeStream',
                description: 'AnimeStream - An app to download and stream anime for free',
            }
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {},
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {},
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
    ],
};
