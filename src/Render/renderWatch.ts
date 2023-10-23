import { getGogoStreams, getStoredEpisodeId, stream } from "../Core";

let playState = false

document.addEventListener('DOMContentLoaded', async() => {
    const backBtn = document.getElementById('backBtn')
    const video = <HTMLVideoElement>document.getElementById('videoPlayer')
    const sourcesDiv = document.getElementById('sources')
    const playPause = document.getElementById('playPause')
    const progressBar = <HTMLProgressElement>document.getElementById('watch_progress')
    const timeCurrent = document.getElementById('current')
    const totalTime = document.getElementById('total')
    const controls = document.getElementById('controls')

    if(!video 
        || !sourcesDiv 
        || !backBtn 
        || !playPause 
        || !progressBar 
        || !timeCurrent 
        || !totalTime 
        || !controls
        )   throw new Error('err');

    backBtn.onclick = () => window.location.href = './AnimeInfo.html'
    playPause.onclick = () => {
        if(!playState) {
            video.play()
            playState = true
        } else {
            video.pause()
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
        if (!isNaN(video.duration) && isFinite(video.duration)) {
            timeCurrent.textContent = Math.floor(video.currentTime).toString()
            progressBar.value = (video.currentTime / video.duration) * 100;
        }
    })

    video.addEventListener('mouseenter', () => {
        controls.style.display = 'block';
    });
    
    video.addEventListener('mouseleave', () => {
        progressBar.style.display = 'none';
    });

    progressBar.addEventListener('click', (e) => {
        const currentTarget = e.currentTarget as HTMLElement
        const clickPercent = e.offsetX / currentTarget.offsetWidth
        video.currentTime = video.duration * clickPercent
    })
})

function showControlsWithState(control: HTMLElement, state: boolean) {
    if(!state) control.style.opacity = '0'
    else control.style.opacity = '1'
}