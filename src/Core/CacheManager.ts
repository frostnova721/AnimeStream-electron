import * as fs from 'fs'
import path from 'path'
import { Coder } from '../Coder/codeIt'
const cachePath = path.join(__dirname, '../../Cache')
const code = new Coder()

export async function storeAnimeWatchedCache (animeName: string, imageLink: string, infoLink: string):Promise<Boolean> {
    try {
        const recPath = `${cachePath}/recents.mewmew`
        if(!fs.existsSync(recPath)) fs.writeFileSync(recPath, await code.encode('{ "recents": [] }'))
        const data = fs.readFileSync(recPath, 'utf8')
        if(data.length === 0) fs.writeFileSync(recPath, await code.encode('{ "recents": [] }'))
        const currentData = JSON.parse(await code.decode(fs.readFileSync(recPath, 'utf8')))
        console.log(currentData)
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