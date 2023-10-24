import { ipcRenderer } from 'electron'
import { MAL, GogoStreams } from '../Lib'
import { IMALSearch, ISearchOutput, IStreamOutput } from '../Types'
import Hls from 'hls.js'

const mal = new MAL()

export async function displayResults(searchTerm: string): Promise<IMALSearch[]> {
    const results = await mal.searchForAnime(searchTerm)
    return results
}

export async function getAnimeInfo(link: string) {
    const results = mal.getAnimeDetails(link)
    return results
}

export async function setClickableResult(link: string):Promise<void> {
    ipcRenderer.invoke('setCR', link);
    return;
}

export async function readClickedResult(): Promise<string> {
    const res: string = await ipcRenderer.invoke("readCR")
    if(!res) throw new Error('couldnt read shit get a life mf')
    return res
}

export async function gogoSearch(term: string): Promise<ISearchOutput[]> {
    const gogo = new GogoStreams()
    const results = gogo.searchForAnime(term)
    return results
}

export async function getGogoStreams(episodeId: string, quality?: '360' | '480' | '720' | '1080'): Promise<IStreamOutput> {
    const gogo = new GogoStreams()
    try {
        const results = gogo.getStreams(episodeId, quality)
        return results
    } catch(err) {
        console.log(err)
        throw new Error('Couldnt get any results')
    }
}

export async function stream(videoElement: HTMLVideoElement, src: string) {
    if(!videoElement) throw new Error('ERRRRRRR')
    try {
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
        });
    }
    } catch(err) {
        throw new Error()
    }
}

export async function storeEpisodeId(epId: string): Promise<void> {
    await ipcRenderer.invoke('setEpisodeId', epId)
}

export async function getStoredEpisodeId(): Promise<string> {
    const id = ipcRenderer.invoke('getEpisodeId')
    return id;
}