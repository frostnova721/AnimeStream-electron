import * as fs from 'fs'
import path from 'path'
import { Coder } from '../Coder/codeIt'
import { ILatestAnimes } from '../Types'
const cachePath = path.join(__dirname, '../../Cache')
const code = new Coder()

export async function storeAnimeWatchedCache (animeName: string, imageLink: string, infoLink: string):Promise<Boolean> {
    try {
        const recPath = `${cachePath}/recents.mewmew`
        if(!fs.existsSync(recPath)) fs.writeFileSync(recPath, await code.encode('{ "recents": [] }'))
        const data = fs.readFileSync(recPath, 'utf8')
        if(data.length === 0) fs.writeFileSync(recPath, await code.encode('{ "recents": [] }'))
        const currentData = JSON.parse(await code.decode(fs.readFileSync(recPath, 'utf8')))
        currentData.recents.push({name: animeName, img: imageLink, infoLink: infoLink})
        fs.writeFileSync(recPath, await code.encode(JSON.stringify(currentData, null, 2)))
        return true
    } catch(err) {
        console.log(err)
        throw new Error('Error while writing cache');
    }
}

export async function fetchRecentsFromCache(): Promise<{name: string, img: string, infoLink: string}[] | undefined> {
    try {
        const recPath = `${cachePath}/recents.mewmew`
        if(!fs.existsSync(recPath)) return undefined;
        const data = fs.readFileSync(recPath, 'utf8')
        const decoded = JSON.parse(await code.decode(data))
        return decoded.recents;
    } catch(err) {
        return undefined;
    }
}

export async function storeLatestAnimeCache (data: ILatestAnimes[]):Promise<Boolean> {
    try {
        const recPath = `${cachePath}/runtime.mewmew`
        if(!fs.existsSync(recPath)) fs.writeFileSync(recPath, await code.encode('{ "latest": [] }'))   //add more options for more runtime caches
        const readData = fs.readFileSync(recPath, 'utf8')
        if(readData.length === 0) fs.writeFileSync(recPath, await code.encode('{ "latest": [] }'))
        const currentData = JSON.parse(await code.decode(fs.readFileSync(recPath, 'utf8')))
        currentData.latest.push(data)
        fs.writeFileSync(recPath, await code.encode(JSON.stringify(currentData, null, 2)))
        return true
    } catch(err) {
        console.log(err)
        throw new Error('Error while writing cache');
    }
}

export async function fetchLatestFromCache(): Promise<ILatestAnimes[] | undefined> {
    try {
        const recPath = `${cachePath}/runtime.mewmew`
        if(!fs.existsSync(recPath)) return undefined;
        const data = fs.readFileSync(recPath, 'utf8')
        const decoded = JSON.parse(await code.decode(data))
        return decoded.latest[0];
    } catch(err) {
        return undefined;
    }
}

export function clearCache() {
    const paths = [ `${cachePath}/recents.mewmew` ]
    for(const cPath of paths) {
        fs.writeFileSync(cPath, '')
    }
}

export function clearRuntimeCache() {
    const runtimePath = `${cachePath}/runtime.mewmew`
    fs.writeFileSync(runtimePath, '')
}