import { ipcRenderer } from 'electron'
import { MAL } from '../Lib'
import { IMALSearch, ISearchOutput } from '../Types'


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