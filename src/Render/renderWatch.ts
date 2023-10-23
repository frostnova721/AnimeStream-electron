import { getGogoStreams, getStoredEpisodeId, stream } from "../Core";

let playState = false

document.addEventListener('DOMContentLoaded', async() => {
    const backBtn = document.getElementById('backBtn')
    const video = <HTMLVideoElement>document.getElementById('videoPlayer')
    const sourcesDiv = document.getElementById('sources')
    const playPause = document.getElementById('playPause')
    const progressBar = <HTMLProgressElement>document.getElementById('watch_progress')

    if(!video || !sourcesDiv || !backBtn || !playPause || !progressBar) throw new Error('err');

    backBtn.onclick = () => window.location.href = './AnimeInfo.html'
    playPause.onclick = () => {
        if(!playState) {
            video.play()
            console.log('playing')
            playState = true
        } else {
            video.pause()
            console.log('paused')
            playState = false
        }
    }

    const sources = (await getGogoStreams(await getStoredEpisodeId())).sources
    for(const source of sources) {
        const child = document.createElement('button')
        child.className = 'source'
        child.id = 'source'
        child.setAttribute('data-value', source.link)
        child.textContent = source.quality ?? ''

        sourcesDiv.appendChild(child)
    }

    sourcesDiv.addEventListener('click', async(e) => {
        const target = e.target as HTMLElement
        if(target.id === 'source') {
            const src = target.getAttribute('data-value') ?? ''
            await stream(video, src)
        }
    })

    video.addEventListener('timeupdate', () => {
        console.log('changed')
        if (!isNaN(video.duration) && isFinite(video.duration)) {
            progressBar.value = (video.currentTime / video.duration) * 100;
        }
    })

    progressBar.addEventListener('click', (e) => {
        const currentTarget = e.currentTarget as HTMLElement
        video.currentTime = (e.clientX * video.duration) / currentTarget.offsetWidth
    })
})