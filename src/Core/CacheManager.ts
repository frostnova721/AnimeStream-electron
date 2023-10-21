import * as fs from 'fs'
import { Coder } from '../Coder/codeIt'
const cachePath = '../../Cache'
const code = new Coder()

export async function storeAnimeWatchedCache (animeName: string, imageLink: string):Promise<Boolean> {
    try {
        const recPath = `${cachePath}/recents.mewmew`
        if(!fs.existsSync(recPath)) fs.writeFileSync(recPath, await code.encode('{ recents: [] }'))
        const currentData = JSON.parse(await code.decode(fs.readFileSync(recPath, 'utf8')))
        currentData.recents.push({name: animeName, img: imageLink})
        fs.writeFileSync(recPath, await code.encode(currentData))
        return true
    } catch(err) {
        console.log(err)
        throw new Error('Error while writing cache');
    }
}

export async function fetchRecentsFromCache(): Promise<{name: string, img: string}[] | undefined> {
    try {
        const recPath = `${cachePath}/recents.mewmew`
        if(!fs.existsSync(recPath)) return undefined;
        const data = fs.readFileSync(recPath, 'utf8')
        const decoded = JSON.parse(await code.decode(data))
        return decoded.recents;
    } catch(err) {
        console.log(err)
        throw new Error('Error while fetching recents')
    }
}