import { getGogoStreams, getPaheStreams, gogoSearch, paheSearch, paheStreamDetails, stream } from '../Core';

let playState = false;
let videoLoaded = false;
let localMemory;
let selectedProvider : 'animepahe' | 'gogoanime' = 'gogoanime';
let playTime: number = 0

document.addEventListener('DOMContentLoaded', async () => {
    const backBtn = document.getElementById('backBtn');
    const video = <HTMLVideoElement>document.getElementById('videoPlayer');
    // const sourcesDiv = document.getElementById('sources');
    const playPause = document.getElementById('playPause');
    const progressBar = document.getElementById('watch_progress');
    const progressed = document.getElementById('progressed');
    const point = document.getElementById('point');
    const timeCurrent = document.getElementById('current');
    const totalTime = document.getElementById('total');
    const controls = document.getElementById('controls');
    const fullScreenBtn = document.getElementById('fullScreen');
    const playPauseImg = <HTMLImageElement>document.getElementById('playPauseImg');
    const fsImg = <HTMLImageElement>document.getElementById('fsImg');
    const srcLoader = document.getElementById('srcLoader');
    const serversBtn = document.getElementById('serversBtn')
    const closeBtn = document.getElementById('close')
    const overlay = document.getElementById('overlay')
    const container = document.getElementById('container')
    // const streamDiv = document.getElementById('streams')
    const subStream = document.getElementById('subStream')
    const paheButton = document.getElementById('pahe')
    const gogoButton = document.getElementById('gogo')
    const previousBtn = document.getElementById('previousEp')
    const nextBtn = document.getElementById('nextEp')

    if (
        !video ||
        // !sourcesDiv ||
        !backBtn ||
        !playPause ||
        !progressBar ||
        !timeCurrent ||
        !totalTime ||
        !controls ||
        !fullScreenBtn ||
        !progressed ||
        !point ||
        !playPauseImg ||
        !fsImg ||
        // !srcLoader ||
        !serversBtn ||
        !closeBtn ||
        !overlay ||
        !container ||
        !gogoButton ||
        !paheButton ||
        !subStream ||
        // !streamDiv
        !previousBtn ||
        !nextBtn
    )
        throw new Error('err'); //typescript's OCD

    //to go back
    backBtn.onclick = () => (window.location.href = './AnimeInfo.html?rel=bwatch');

    //pause or play the video when play-pause icon is clicked
    playPause.onclick = () => {
        if (videoLoaded) {
            playState = updatePlayButton(playState, video, playPauseImg);
        }
    };

    //get fullscreen for the video
    fullScreenBtn.onclick = () => video.requestFullscreen();

    serversBtn.onclick = () => {
        overlay.classList.toggle('show')
        container.classList.toggle('hidden')
    }

    closeBtn.onclick = () => {
        overlay.classList.toggle('show')
        container.classList.toggle('hidden')
    }

    const queries = window.location.href.split('?')[1].split('&');

    let anime: string = '',
        ep: string  = '';

    for (const query of queries) {
        const key = query.split('=');
        if (key[0] === 'watch') anime = key[1];
        if (key[0] === 'ep') ep = key[1];
    }
    

    if (!anime || !ep) throw new Error('no anime name found');

    previousBtn.onclick = () => {
        //yet to implement
    }

    nextBtn.onclick = () => {
        //yet to implement
    }

    paheButton.onclick = async() => {
        selectedProvider = 'animepahe'
        await loadCorrespondingStreams(anime ?? '', parseInt(ep))
   }

   gogoButton.onclick = async() => {
       selectedProvider = 'gogoanime'
        await loadCorrespondingStreams(anime ?? '', parseInt(ep))
   }

    await loadCorrespondingStreams(anime ?? '', parseInt(ep))

    const updateProgression = () => {
        progressed.style.width = `${(video.currentTime / video.duration) * 100}%`;
        point.style.marginLeft = `${(video.currentTime / video.duration) * 100 - 0.5}%`;
    }

    //listen for the clicks on source to change the source
    subStream.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        if (target.id === 'source') {
            const src = target.getAttribute('data-value') ?? '';
            try {
                await stream(video, src);
                videoLoaded = true;
                video.addEventListener('loadedmetadata', () => {
                    updateDuration(video, totalTime);
                    if(playTime !== 0) video.currentTime = playTime
                    updateProgression()
                });
            } catch (err) {
                console.log(err);
            }
        }
    });

    //update the timer
    video.addEventListener('timeupdate', () => {
        if (!isNaN(video.duration) && isFinite(video.duration)) {
            totalTime.textContent = `${secondsToTime(Math.floor(video.duration))}`;
            timeCurrent.textContent = secondsToTime(Math.floor(video.currentTime));
            playTime = video.currentTime
            progressed.style.width = `${(video.currentTime / video.duration) * 100}%`;
            point.style.marginLeft = `${(video.currentTime / video.duration) * 100 - 0.5}%`;
        }
    });

    //to determine wether the left mouse is held
    // let draggable = false
    // progressBar.addEventListener('mousedown', (e) => {
    //     draggable = true
    // })
    // progressBar.addEventListener('mouseup', (e) => {
    //     draggable = false
    // })

    // progressBar.addEventListener('mouseout', (e) => {
    //     draggable = false
    // })

    //update the video progress on click
    progressBar.addEventListener('click', (e) => {
        const currentTarget = e.currentTarget as HTMLElement;
        const clickPercent = e.offsetX / currentTarget.offsetWidth;
        progressed.style.width = `${(video.duration * clickPercent / video.duration) * 100}%`;
        point.style.marginLeft = `${(video.duration * clickPercent / video.duration) * 100 - 0.5}%`;
        video.currentTime = video.duration * clickPercent;
    })
    
    //update the progressbar on cursor move
    // progressBar.addEventListener('mousemove', (e) => {
    //     if(draggable) {
    //         const currentTarget = e.currentTarget as HTMLElement;
    //         const clickPercent = e.offsetX / currentTarget.offsetWidth;
    //         progressed.style.width = `${(video.duration * clickPercent / video.duration) * 100}%`;
    //         point.style.marginLeft = `${(video.duration * clickPercent / video.duration) * 100 - 0.5}%`;
    //         video.currentTime = video.duration * clickPercent;
    //     }
    // });

    //pause or play when space key is pressed
    document.addEventListener('keydown', (event) => {
        if (event.key === ' ' || event.keyCode === 32 || event.which === 32) {
            event.preventDefault();
            if (videoLoaded) {
                playState = updatePlayButton(playState, video, playPauseImg);
            }
        }
    });

    //pause or play when clicked on the video element
    video.addEventListener('click', () => {
        if (videoLoaded) {
            playState = updatePlayButton(playState, video, playPauseImg);
        }
    });
});

//functions  (Their name does the explanation)

function updateDuration(videoElement: HTMLVideoElement, totalTime: HTMLElement) {
    totalTime.textContent = `${secondsToTime(Math.floor(videoElement.duration))}`;
}

function updatePlayButton(playState: boolean, video: HTMLVideoElement, img: HTMLImageElement) {
    if (!playState) {
        video.play();
        img.src = '../Assets/Icons/pause-button.png';
        playState = true;
        return playState;
    } else {
        video.pause();
        img.src = '../Assets/Icons/play.png';
        playState = false;
        return playState;
    }
}

//hide the controls when mouse isnt moved while inside the video element (couldnt figure out the logic :( )
function showControlsWithState(control: HTMLElement, state: boolean) {
    if (!state) control.style.opacity = '0';
    else control.style.opacity = '1';
}

function secondsToTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(remainingSeconds).padStart(2, '0');

    return `${hours > 0 ? `${hoursStr}:` : ''}${minutesStr}:${secondsStr}`;
}

async function loadCorrespondingStreams(anime: string, ep: number) {
    const subStream = document.getElementById('subStream')
    if(!subStream) throw new Error('E_NO_SUBSTREAM_DIV')
    subStream.innerHTML = ''
    switch(selectedProvider) {
        case 'gogoanime': 
            return await loadGogoStreams(anime, ep);
        case 'animepahe': 
            return await loadPaheStreams(anime, ep);
        default: 
            return await loadGogoStreams(anime, ep);
    }
}

async function loadGogoStreams(anime: string, ep: number) {
    const sources = await (
        await getGogoStreams((await gogoSearch(decodeURIComponent(anime)))[0].episodeLink + ep)
    ).sources;

    const arr: {child: HTMLElement, source: string}[] = []

    for (const source of sources) {
        const child = document.createElement('button');
        child.className = 'source';
        child.id = 'source';
        child.setAttribute('data-value', source.link);
        child.textContent = source.quality ?? '';
        arr.push({ child: child, source: source.server })  
    }
    
    //group the children- we can hardcode it since there are only 2 streams
    const vidstream = arr.filter((obj) => obj.source === 'vidstreaming')
    const backup = arr.filter((obj) => obj.source === 'vidstreaming backup')

    createStreamGroup(vidstream[0].source, vidstream)
    createStreamGroup(backup[0].source,  backup)
}

async function loadPaheStreams(anime: string, ep: number) {
    const search = await paheSearch(anime)
    const streamDetails = await paheStreamDetails(search[0].session, ep)
    const arr: { child: HTMLElement, source: string }[] = []
    for (const source of streamDetails) {
        const child = document.createElement('button');
        child.className = 'source';
        child.id = 'source';
        const data = await getPaheStreams(source.link)
        child.setAttribute('data-value', data.url);
        child.textContent = source.quality ?? '';
        arr.push({ child: child, source: source.server })
    }

    const srcs = Array.from(new Set(arr.map(obj => obj.source)))
    for(const source of srcs) {
        const filteredArray = arr.filter((obj) => obj.source === source)
        createStreamGroup(source, filteredArray)
    }
}

function createStreamGroup (streamName: string, children: { child: HTMLElement, source: string}[]) {
    const mainDiv = document.createElement('div')
    mainDiv.className = 'streamGroup'
    const streamNameDiv = document.createElement('div')
    streamNameDiv.className = 'streamName'
    streamNameDiv.innerText = streamName
    const streams = document.createElement('div')
    streams.id = 'streams'
    streams.className = 'streams'
    for(const child of children) {
        streams.appendChild(child.child)
    }

    mainDiv.appendChild(streamNameDiv)
    mainDiv.appendChild(streams)

    const subStream = document.getElementById('subStream')
    if(!subStream) throw new Error('E_NO_SUBSTREAM_FOUND');
    subStream.appendChild(mainDiv)

    return streams
}