import {
    getDefaultStream,
    getEpisodeLink,
    getGogoStreams,
    getPaheStreams,
    gogoSearch,
    paheSearch,
    paheStreamDetails,
    stream,
    getStoredTotalEpisodes,
    getPaheStreamDetails,
    readSettings,
    downloadEpisode,
} from '../Core';
import { IStreams } from '../Types';

let localMemory: {
    server: string;
    result: string;
}[] = [];
let videoLoaded = false;
let overlayShown = false;
let autoLoadLink = '';
let loadedStreamsLink = '';
let selectedProvider: 'animepahe' | 'gogoanime' = 'gogoanime';
let playTime: number = 0;
let backLink = './AnimeInfo.html?rel=watch';
let widened = false;
let error = false;
let defaultQuality: '360p' | '480p' | '720p' | '1080p';

document.addEventListener('DOMContentLoaded', async () => {
    const backBtn = document.getElementById('backBtn');
    const video = <HTMLVideoElement>document.getElementById('videoPlayer');
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
    const serversBtn = document.getElementById('serversBtn');
    const closeBtn = document.getElementById('close');
    const overlay = document.getElementById('overlay');
    const container = document.getElementById('container');
    const subStream = document.getElementById('subStream');
    const paheButton = document.getElementById('pahe');
    const gogoButton = document.getElementById('gogo');
    const previousBtn = document.getElementById('previousEp');
    const nextBtn = document.getElementById('nextEp');
    const playerTitle = document.getElementById('playerTitle');
    const videoLoaderContainer = document.getElementById('videoLoaderContainer');
    const wideScreen = document.getElementById('widescreen');
    const playerContainer2 = <HTMLDivElement>document.getElementsByClassName('playerContainer2')[0];
    const downloadButton = document.getElementById('downloadBtn');

    if (
        !video ||
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
        !serversBtn ||
        !closeBtn ||
        !overlay ||
        !container ||
        !gogoButton ||
        !paheButton ||
        !subStream ||
        !previousBtn ||
        !nextBtn ||
        !playerTitle ||
        !videoLoaderContainer ||
        !wideScreen ||
        !downloadButton
    )
        throw new Error('err'); //typescript's OCD

    const totalEps = await getStoredTotalEpisodes();

    defaultQuality = (await readSettings()).defaultQuality;

    //to go back
    backBtn.onclick = () => {
        if (overlayShown) {
            overlay.classList.toggle('show');
            container.classList.toggle('hidden');
            overlayShown = false;
        } else {
            window.location.href = backLink;
        }
    };

    downloadButton.onclick = () => {
        if (videoLoaded) {
            downloadEpisode(autoLoadLink, 'niggaballs')
        }
    };

    //pause or play the video when play-pause icon is clicked
    playPause.onclick = () => {
        if (videoLoaded) {
            alterPlayState(video);
        }
    };

    //get fullscreen for the video
    fullScreenBtn.onclick = () => video.requestFullscreen();

    serversBtn.onclick = () => {
        overlay.classList.toggle('show');
        container.classList.toggle('hidden');
        overlayShown = true;
    };

    closeBtn.onclick = () => {
        overlay.classList.toggle('show');
        container.classList.toggle('hidden');
        overlayShown = false;
    };

    wideScreen.onclick = () => {
        widenVideo();
    };

    const queries = window.location.href.split('?')[1].split('&');

    let anime: string = '',
        ep: string = '',
        fromlatest: 'true' | 'false' | undefined,
        link: string = '';

    for (const query of queries) {
        const key = query.split('=');
        if (key[0] === 'watch') anime = key[1];
        if (key[0] === 'ep') ep = key[1];
        if (key[0] === 'fromlatest') fromlatest = key[1] as typeof fromlatest;
        if (key[0] === 'link') link = key[1];
    }

    if (fromlatest === 'true') backLink = './AnimeInfo.html?rel=latest';

    if (!anime || !ep) throw new Error('no anime name found');

    playerTitle.innerText = decodeURIComponent(`${anime} - Episode ${ep}`);

    previousBtn.onclick = () => {
        if (parseInt(ep) === 1) {
            return;
        }
        window.location.href = `./Watch.html?watch=${anime ?? ''}&ep=${parseInt(ep) - 1 ?? ''}`;
    };

    nextBtn.onclick = () => {
        if (parseInt(ep) !== parseInt(totalEps))
            window.location.href = `./Watch.html?watch=${anime ?? ''}&ep=${parseInt(ep) + 1 ?? ''}`;
    };

    selectedProvider = await getDefaultStream();

    paheButton.onclick = async () => {
        selectedProvider = 'animepahe';
        streamsLoading('enable');
        await loadCorrespondingStreams(anime ?? '', parseInt(ep));
    };

    gogoButton.onclick = async () => {
        selectedProvider = 'gogoanime';
        streamsLoading('enable');
        await loadCorrespondingStreams(anime ?? '', parseInt(ep));
    };

    await loadCorrespondingStreams(anime ?? '', parseInt(ep), link);

    const updateProgression = () => {
        progressed.style.width = `${(video.currentTime / video.duration) * 100}%`;
        point.style.marginLeft = `${(video.currentTime / video.duration) * 100 - 0.5}%`;
    };

    const streamEpisode = async (src: string) => {
        try {
            await stream(video, src);
            videoLoaded = true;
            video.addEventListener('loadedmetadata', () => {
                videoLoaderContainer.style.display = 'none';
                updateDuration(video, totalTime);
                if (playTime !== 0) video.currentTime = playTime;
                updateProgression();
            });
        } catch (err) {
            console.log(err);
            videoLoaderContainer.style.display = 'flex';
        }
    };

    //autoload 720p or 480p
    try {
        await streamEpisode(autoLoadLink);
    } catch (err) {
        console.log('Error while performing autoload');
    }

    //listen for the clicks on source to change the source
    subStream.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        if (target.id === 'source') {
            const src = target.getAttribute('data-value') ?? '';
            await streamEpisode(src);
        }
    });

    video.addEventListener('pause', () => {
        updatePlayPauseIcon(video.paused, playPauseImg);
    });

    video.addEventListener('play', () => {
        updatePlayPauseIcon(video.paused, playPauseImg);
    });

    //update the timer
    video.addEventListener('timeupdate', () => {
        if (!isNaN(video.duration) && isFinite(video.duration)) {
            totalTime.textContent = `${secondsToTime(Math.floor(video.duration))}`;
            timeCurrent.textContent = secondsToTime(Math.floor(video.currentTime));
            playTime = video.currentTime;
            progressed.style.width = `${(video.currentTime / video.duration) * 100}%`;
            point.style.marginLeft = `${(video.currentTime / video.duration) * 100 - 0.5}%`;
        }
    });

    video.onwaiting = () => {
        videoLoaderContainer.style.display = 'flex';
    };

    video.onplaying = () => {
        videoLoaderContainer.style.display = 'none';
    };

    let timeOut: NodeJS.Timeout;
    playerContainer2.addEventListener('mousemove', () => {
        if (timeOut) clearTimeout(timeOut);
        showControlsWithState(controls, true);
        timeOut = setTimeout(() => {
            showControlsWithState(controls, false);
        }, 2500);
    });

    //update the video progress on click
    progressBar.addEventListener('click', (e) => {
        const currentTarget = e.currentTarget as HTMLElement;
        const clickPercent = e.offsetX / currentTarget.offsetWidth;
        progressed.style.width = `${((video.duration * clickPercent) / video.duration) * 100}%`;
        point.style.marginLeft = `${
            ((video.duration * clickPercent) / video.duration) * 100 - 0.5
        }%`;
        video.currentTime = video.duration * clickPercent;
    });

    //pause or play or skip when space key is pressed
    let skipDuration = (await (await readSettings()).skipDuration) || 5;
    document.addEventListener('keydown', (event) => {
        if (event.key === ' ' || event.keyCode === 32 || event.which === 32) {
            event.preventDefault();
            if (videoLoaded) {
                alterPlayState(video);
            }
        }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            if (videoLoaded) {
                video.currentTime = video.currentTime + skipDuration;
                updateProgression();
            }
        }
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            if (videoLoaded) {
                video.currentTime = video.currentTime - skipDuration;
                updateProgression();
            }
        }
    });

    //pause or play when clicked on the video element
    video.addEventListener('click', () => {
        console.log('click');
        if (videoLoaded) {
            alterPlayState(video);
        }
    });
});

//functions  (Their name does the explanation(almost))

function updateDuration(videoElement: HTMLVideoElement, totalTime: HTMLElement) {
    totalTime.textContent = `${secondsToTime(Math.floor(videoElement.duration))}`;
}

function alterPlayState(video: HTMLVideoElement) {
    if (document.fullscreen) return;
    let playing = !video.paused;
    if (!playing) {
        video.play();
    } else {
        video.pause();
    }
}

function updatePlayPauseIcon(playState: boolean, playPause: HTMLImageElement) {
    if (!playState) playPause.src = '../Assets/Icons/pause-button.png';
    else playPause.src = '../Assets/Icons/play.png';
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

async function loadCorrespondingStreams(anime: string, ep: number, link?: string) {
    if (localMemory.length !== 0) {
        const arrayWithStreams = localMemory.filter((item) => item.server == selectedProvider);
        if (arrayWithStreams.length !== 0) {
            const subStream = document.getElementById('subStream');
            if (!subStream) return;
            subStream.innerHTML = arrayWithStreams[0].result;
            manageErrorScreen();
            streamsLoading('disable');
            return;
        }
    }
    switch (selectedProvider) {
        case 'gogoanime':
            return await loadGogoStreams(anime, ep, link);
        case 'animepahe':
            return await loadPaheStreams(anime, ep, link);
        default:
            return await loadGogoStreams(anime, ep, link);
    }
}

async function loadGogoStreams(anime: string, ep: number, link?: string) {
    try {
        let sources;
        if (error) {
            manageErrorScreen();
        }
        if (selectedProvider === (await getDefaultStream()) && link) {
            sources = await getGogoStreams(link);
        } else {
            const search = await gogoSearch(decodeURIComponent(anime));
            const link = await getEpisodeLink(search[0].alias);
            sources = await getGogoStreams(`https://gogoanime3.net${link.link.trim()}` + ep);
        }

        if (selectedProvider === 'gogoanime') {
            // to manage its loading incase the user change the stream in between
            const arr: { child: HTMLElement; source: string }[] = [];

            if (autoLoadLink.length < 1) {
                let src: IStreams | undefined;
                src = sources.find((item) => item.quality === defaultQuality ?? '720p');
                if (!src) src = sources[0];
                autoLoadLink = src?.link ?? '';
                console.log(`selected source: ${src?.server} ${src?.quality}`);
            }

            for (const source of sources) {
                const child = document.createElement('button');
                child.className = 'source';
                child.id = 'source';
                child.setAttribute('data-value', source.link);
                child.textContent = source.quality ?? '';
                arr.push({ child: child, source: source.server });
            }

            //group the children based on the server
            const srcs = Array.from(new Set(arr.map((obj) => obj.source)));
            const subStream = document.getElementById('subStream');
            if (subStream) subStream.innerHTML = '';
            for (const src of srcs) {
                const filteredArray = arr.filter((obj) => obj.source === src);
                createStreamGroup(src, filteredArray);
            }
            streamsLoading('disable');
            localMemory.push({
                server: 'gogoanime',
                result: subStream?.innerHTML ?? '',
            });
        }
    } catch (err) {
        console.log(err);
        manageErrorScreen();
    }
}

async function loadPaheStreams(anime: string, ep: number, link?: string) {
    try {
        let sources;
        if (error) {
            manageErrorScreen();
        }
        if (selectedProvider === (await getDefaultStream()) && link) {
            sources = await getPaheStreamDetails(link);
        } else {
            const search = await paheSearch(anime);
            sources = await paheStreamDetails(search[0].session, ep);
        }

        if (selectedProvider === 'animepahe') {
            const arr: { child: HTMLElement; source: string }[] = [];
            for (const source of sources) {
                const child = document.createElement('button');
                child.className = 'source';
                child.id = 'source';
                const data = await getPaheStreams(source.link);
                child.setAttribute('data-value', data.url);
                child.textContent = source.quality ?? '';
                arr.push({ child: child, source: source.server });
            }

            const srcs = Array.from(new Set(arr.map((obj) => obj.source)));
            if (autoLoadLink.length < 1) {
                let src: IStreams | undefined;
                src = sources.find((item) => item.quality === defaultQuality ?? '720p');
                if (!src) src = sources[0];
                autoLoadLink = src?.link ?? '';
                console.log(`selected source: ${src?.server} ${src?.quality}`);
            }
            const subStream = document.getElementById('subStream');
            if (subStream) subStream.innerHTML = '';
            for (const source of srcs) {
                const filteredArray = arr.filter((obj) => obj.source === source);
                createStreamGroup(source, filteredArray);
            }
            streamsLoading('disable');
            localMemory.push({
                server: 'animepahe',
                result: subStream?.innerHTML ?? '',
            });
        }
    } catch (err) {
        console.log(err);
        manageErrorScreen();
    }
}

function streamsLoading(action: 'disable' | 'enable') {
    const stream = document.getElementById('stream');
    const subStream = document.getElementById('subStream');
    const streamLoader = document.getElementById('streamLoader');
    if (!stream || !subStream || !streamLoader) throw new Error('hmmmm');
    if (action === 'disable') {
        stream.classList.remove('loading');
        subStream.style.display = 'block';
        streamLoader.style.display = 'none';
    } else {
        stream.classList.add('loading');
        subStream.style.display = 'none';
        streamLoader.style.display = 'block';
    }
}

function createStreamGroup(streamName: string, children: { child: HTMLElement; source: string }[]) {
    const mainDiv = document.createElement('div');
    mainDiv.className = 'streamGroup';
    const streamNameDiv = document.createElement('div');
    streamNameDiv.className = 'streamName';
    streamNameDiv.innerText = streamName;
    const streams = document.createElement('div');
    streams.id = 'streams';
    streams.className = 'streams';
    for (const child of children) {
        streams.appendChild(child.child);
    }

    mainDiv.appendChild(streamNameDiv);
    mainDiv.appendChild(streams);

    const subStream = document.getElementById('subStream');
    if (!subStream) throw new Error('E_NO_SUBSTREAM_FOUND');
    subStream.appendChild(mainDiv);

    return streams;
}

function widenVideo() {
    const player = document.getElementsByClassName('player')[0] as HTMLElement;
    const video = document.getElementById('videoPlayer');
    const controls = document.getElementById('controls');
    const playerContainer2 = document.getElementsByClassName('playerContainer2')[0] as HTMLElement;
    if (!player || !video || !controls || !playerContainer2) return;
    player.style.maxWidth = widened ? '892px' : '100%';
    video.style.maxWidth = widened ? '892px' : '100%';
    controls.style.maxWidth = widened ? '892px' : '100%';
    playerContainer2.style.width = widened ? 'auto' : '90%';
    playerContainer2.style.maxHeight = widened ? '483.75px' : '685px';
    player.style.height = widened ? '483.75px' : '685px';
    video.style.height = widened ? '483.75px' : '685px';
    widened = !widened;
}

function manageErrorScreen() {
    error = !error;
    const errorScreen = document.getElementById('errorScreen');
    const stream = document.getElementById('stream');
    const streamLoader = document.getElementById('streamLoader');
    if (!stream || !errorScreen || !streamLoader) return;
    errorScreen.style.display = error ? 'flex' : 'none';
    streamLoader.style.display = error ? 'none' : 'block';
}
