import { ipcRenderer } from 'electron';
import { MAL, GogoStreams, AniList, Episodes } from '../Lib';
import { IMALSearch, ISearchOutput, IStreamOutput, Settings } from '../Types';
import Hls from 'hls.js';
import * as fs from 'fs';
import path from 'path';

const mal = new MAL();
const anilist = new AniList();

export async function getAnimeInfo(link: string) {
    const results = mal.getAnimeDetails(link);
    return results;
}

export async function searchResults(searchTerm: string) {
    const db = await getDataBase();
    if (db === 'anilist') {
        const res = await anilist.searchAnime(searchTerm);
        return res;
    }
    if (db === 'mal') {
        const res = await mal.jikanSearch(searchTerm);
        return res;
    }
    throw new Error('Error Finding The DataBase');
}

export async function setClickableResult(link: string): Promise<void> {
    ipcRenderer.invoke('setCR', link);
    return;
}

export async function readClickedResult(): Promise<string> {
    const res: string = await ipcRenderer.invoke('readCR');
    if (!res) throw new Error('couldnt read shit get a life mf');
    return res;
}

export async function gogoSearch(term: string): Promise<ISearchOutput[]> {
    const gogo = new GogoStreams();
    const results = gogo.searchForAnime(term);
    return results;
}

export async function getGogoStreams(
    episodeId: string,
    quality?: '360' | '480' | '720' | '1080',
): Promise<IStreamOutput> {
    const gogo = new GogoStreams();
    try {
        const results = gogo.getStreams(episodeId, quality);
        return results;
    } catch (err) {
        console.log(err);
        throw new Error('Couldnt get any results');
    }
}

export async function stream(videoElement: HTMLVideoElement, src: string) {
    if (!videoElement) throw new Error('ERRRRRRR');
    try {
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {});
        }
    } catch (err) {
        throw new Error();
    }
}

export async function storeEpisodeId(epId: string): Promise<void> {
    await ipcRenderer.invoke('setEpisodeId', epId);
}

export async function getStoredEpisodeId(): Promise<string> {
    const id = ipcRenderer.invoke('getEpisodeId');
    return id;
}

export async function createNewWindow() {
    await ipcRenderer.invoke('createNewWindow');
}

export async function readSettings() {
    const settings = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../../settings/settings.json'), 'utf8'),
    ) as Settings;
    return settings;
}

export async function writeSettings(setting: Settings) {
    const stringy = JSON.stringify(setting, null, 2);
    fs.writeFileSync(path.join(__dirname, '../../settings/settings.json'), stringy);
}

export async function setBackTo(to: string) {
    await ipcRenderer.invoke('setBackTo', to);
}

export async function getBackTo(): Promise<string> {
    return await ipcRenderer.invoke('getBackTo');
}

export const Path = path;

export async function getMALLatestAnime() {
    const res = await mal.fetchLatestAnime();
    return res;
}

export async function getALLatestAnime() {
    const res = await anilist.getThisSeason();
    return res;
}

export async function storeAnimeData(data: string) {
    await ipcRenderer.invoke('storeAnimeData', data);
}

export async function getStoredAnimeData() {
    const res = await ipcRenderer.invoke('getStoredAnimeData');
    return res;
}

export async function getDataBase() {
    const settings = await readSettings();
    return settings.database;
}

export async function getDefaultStream() {
    const settings = await readSettings();
    return settings.defaultStream;
} 

export async function changeDataBase(db: 'mal' | 'anilist') {
    const settings = await readSettings();
    settings.database = db;
    console.log(settings);
    await writeSettings(settings);
}

export async function getEpisodes(infoLink: string) {
    const ep = new Episodes();
    const eps = await ep.getAiredEpisodes(infoLink, await getDataBase());
    return eps;
}

export async function getAnilistLink() {
    const res = await ipcRenderer.invoke('getStoredAnilistLink');
    return res;
}

export async function setAnilistLink(link: string) {
    return void (await ipcRenderer.invoke('setAnilistLink', link));
}

export async function getMalIdWithAlId(id: string) {
    return await anilist.getMalIdFromAlId(parseInt(id));
}
