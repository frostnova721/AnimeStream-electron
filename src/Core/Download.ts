import ffmpeg from 'fluent-ffmpeg'
import { EventEmitter } from 'events'

interface DownloadEvents {
    'progress': (progress: { 
        frames: string | number,
        currentFps: string | number
        currentKbps: string | number
        targetSize: string | number
        timemark: string | number
        percent: string | number 
    }) => void;
    'error': (error: Error) => void;
    'end': () => void;
    'killed': () => void;
}

export declare interface Downloader {
    on<U extends keyof DownloadEvents>(
        event: U, listener: DownloadEvents[U]
      ): this;
    
      emit<U extends keyof DownloadEvents>(
        event: U, ...args: Parameters<DownloadEvents[U]>
      ): boolean;
}

export class Downloader extends EventEmitter {
    constructor(m3u8Link: string, downloadPath: string) {
        super()
        this.m3u8Link = m3u8Link
        this.downloadPath = downloadPath
    }

    private m3u8Link: string = ''
    private downloadPath: string = ''
    private ffmpegInstance: ffmpeg.FfmpegCommand | null = null

    public downloadStream = () => {
        if(!this.m3u8Link.includes('.m3u8')) throw new Error('Stream_Is_Not_In_m3u8_Format')
        ffmpeg()
            .input(this.m3u8Link)
            .outputOptions([
                '-bsf:a aac_adtstoasc',
                '-c:v copy',
                '-c:a copy',
                '-crf 0'
            ])
            .on('end', () => this.emit('end'))
            .on('error', (err) => this.emit('error', err))
            .on('progress', (progress) => {
                this.emit('progress', progress)
            })
            .save(this.downloadPath)
    }

    public killDownloadProcess = () => {
        if(this.ffmpegInstance) {
            this.ffmpegInstance.kill('SIGINT')
            this.emit('killed')
        }
    }
}