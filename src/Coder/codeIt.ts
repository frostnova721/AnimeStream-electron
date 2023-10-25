import * as fs from 'fs'
import path from 'path'

export class Coder {
    constructor() {}

    private loadKeys = async() => {
        const keys = JSON.parse(fs.readFileSync(path.join(__dirname, '../../keys/keymap.json'), 'utf8'))
        return keys;
    }

    /**
     * 
     * @param text text to encode/encrypt
     * @returns encoded text
     */
    public encode = async (text: string) => {
        const keys = await this.loadKeys()
        const translatedText = []
        for(const char of text) {
            const key = keys[char]
            translatedText.push(key)
        }
        const encoded = translatedText.join('')
        return encoded
    }

    /**
     * 
     * @param encoded encoded string
     * @returns decoded string
     */
    public decode = async (encoded: string) => {
        const keys = await this.loadKeys()
        const parsed = encoded.match(/.{1,8}/g)
        let decodedArray = [];
        if(!parsed) throw new Error('No data');
        const getKey = (value: string) => {
            return Object.keys(keys).find(key => keys[key] === value)
        }
        for(const set of parsed) {
            decodedArray.push(getKey(set))
        }
        const decoded = decodedArray.join('')
        return decoded;
    }

    public fromPath = async(path: string, task: 'enc' | 'dec' ) => {
        if(!path && !task) throw new Error('Args missing')
        if(!fs.existsSync(path)) throw new Error('invalid Path')
        if(task === 'enc') {
            const string = fs.readFileSync(path, 'utf8')
            const encoded = await this.encode(string)
            return encoded
        }
        if(task === 'dec') {
            const string = fs.readFileSync(path, 'utf8')
            const decoded = await this.decode(string)
            return decoded
        }
    }
}