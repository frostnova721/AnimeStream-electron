import axios from 'axios'
import { load } from 'cheerio'
import { IStreams } from '../../Types';

export class StreamWish {
    constructor() {}

    public extractStreamWish = async(url: string): Promise<IStreams[]> => {
        //for awish
        if(url.startsWith('https://awish.pro/')) {
            const res = await axios.get(url)
            const $ = load(res.data)
            let streamLink!: string
            $('script').each((i,e) => {
                if(!streamLink) {
                    const regex = /file:\s*"(.*?)"/;
                    const link = $(e).html()?.match(regex)
                    if(link)
                        streamLink = link[1]
                }
            })
            if(!streamLink) throw new Error('Couldnt get any streams')
            const qualitiesStreams = await this.qualityExtractor(streamLink)
            
            const resultArray: IStreams[] = []
            for(const qualitiesStream of qualitiesStreams) {
                resultArray.push({
                    link: qualitiesStream.stream,
                    server: "streamwish",
                    quality: qualitiesStream.resolution.split('x')[1] + 'p'
                })
            }
            return resultArray;
        }

        //for alions(filelions)
        if(url.startsWith('https://alions.pro/')) {
            const res = await axios.get(url)
            const $ = load(res.data)
            let streamLink!: string, quality!: string;
            $('script').each((i,e) => {
                const html = $(e).html()
                const matched = html?.match(/eval\(function\(p,a,c,k,e,d\)/)
                if(matched && html) {
                    const data: string = eval(html.replace('eval',''))
                    const src = data.match(/\{sources:\s*\[([\s\S]*?)\]/) ?? ''
                    streamLink = src[1].replace(/{|}|\"|file:/g, '')
                }
            })
            if(!streamLink) throw new Error('Couldnt get any streams')
            const qualitiesStreams = await this.qualityExtractor(streamLink)

            const resultArray: IStreams[] = []
            for(const qualitiesStream of qualitiesStreams) {
                resultArray.push({
                    link: qualitiesStream.stream,
                    server: "filelions",
                    quality: qualitiesStream.resolution.split('x')[1] + 'p'
                })
            }
            return resultArray
        }
        throw new Error('Invalid_Link')
    }

    private qualityExtractor = async(m3u8Link: string) => {
        const res = (await axios.get(m3u8Link)).data
        const streamInf = res.split('\n\n')[0]
        const splitLines = streamInf.split('\n')
        const streamDetails = splitLines.filter((line: string) => line.startsWith('#EXT-X-STREAM-INF:'))
        const streamLines = splitLines.filter((line: string) => !line.startsWith('#EXT-X-STREAM-INF:') && !line.startsWith('#EXTM3U'))

        const data: { stream: string, resolution: string, framerate: string }[] = streamDetails.map((line: string, index: number) => {
            const resolution = (line.match(/RESOLUTION=\d+x\d+/))
            const frameRate = (line.match(/FRAME-RATE=\d+.\d+/))
            if(frameRate && resolution) {
                return { 
                    stream: `${m3u8Link.split('master.m3u8')[0]}${streamLines[index].replace('\r', '')}`,
                    resolution: resolution[0].replace("RESOLUTION=", ''),
                    framerate: frameRate[0].replace("FRAME-RATE=", '')
                }
            }
        })
        return data
    }
}