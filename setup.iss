[Setup]
AppName=AnimeStream
AppVersion=1.0
WizardStyle=modern
DefaultDirName={pf}\AnimeStream
OutputDir=out
SetupIconFile=Assets/Icons/logo_new.ico
OutputBaseFilename=AnimeStream-setup

[Files]
Source: "out\animestream-win32-x64\*"; DestDir: "{app}"
Source: "out\animestream-win32-x64\resources\*"; DestDir: "{app}\resources"
Source: "out\animestream-win32-x64\locales\*"; DestDir: "{app}\locales"

[Icons]
Name: "{commondesktop}\AnimeStream"; Filename: "{app}\AnimeStream.exe";