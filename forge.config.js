module.exports = {
    packagerConfig: {
        icon: 'Assets/Icons/ICO',
        asar: true,
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                setupIcon: 'Assets/Icons/ICO.ico'
            },
        },
        {
            name: '@electron-forge/maker-wix',
            config: {
                icon: 'Assets/Icons/ICO.ico',
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
