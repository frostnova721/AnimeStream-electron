import {
    createNewWindow,
    fetchRecentsFromCache,
    setBackTo,
    setClickableResult,
    fetchLatestFromCache,
    storeLatestAnimeCache,
    getDataBase,
    getMALLatestAnime,
    getALLatestAnime,
    setAnilistLink,
} from '../Core';
import { ILatestAnimes, ISeasonResponse } from '../Types';

let accumulatedDelta = 0;
let isScrolling = false;

if (!navigator.onLine) {
    const offlineContainer = document.getElementById('offline');
    const contents = document.getElementById('contents');
    if (!offlineContainer || !contents) throw new Error('no containers!');
    offlineContainer.style.display = 'flex';
    contents.style.display = 'none';
    throw new Error('CRASH IT! (no network)');
}

document.addEventListener('DOMContentLoaded', async () => {
    const connectedToAccount = false;
    const db = await getDataBase();

    await setBackTo('./Home.html');

    const recentContainer = document.getElementById('recents');
    const latestContainer = document.getElementById('latest');

    if (!recentContainer || !latestContainer) throw new Error('No DIVVVVV');

    if (connectedToAccount) await loadRecentsFromAccount();
    else await loadRecentsFromCache();

    await loadLatestAnimes();

    latestContainer.style.opacity = '1';
    recentContainer.style.opacity = '1';

    recentContainer.addEventListener('wheel', (event) => {
        if (event.deltaY !== 0 && recentContainer.scrollWidth > recentContainer.clientWidth) {
            event.preventDefault();

            accumulatedDelta += event.deltaY;

            if (!isScrolling) {
                isScrolling = true;

                const updateScroll = () => {
                    recentContainer.scrollLeft += accumulatedDelta / 4.5;
                    accumulatedDelta *= 0.85;
                    if (Math.abs(accumulatedDelta) > 0.1) {
                        requestAnimationFrame(updateScroll);
                    } else {
                        isScrolling = false;
                    }
                };
                requestAnimationFrame(updateScroll);
            }
        }
    });

    latestContainer.addEventListener('wheel', (event) => {
        if (event.deltaY !== 0 && latestContainer.scrollWidth > latestContainer.clientWidth) {
            event.preventDefault();

            accumulatedDelta += event.deltaY;

            if (!isScrolling) {
                isScrolling = true;

                const updateScroll = () => {
                    latestContainer.scrollLeft += accumulatedDelta / 4.5;
                    accumulatedDelta *= 0.85;
                    if (Math.abs(accumulatedDelta) > 0.1) {
                        requestAnimationFrame(updateScroll);
                    } else {
                        isScrolling = false;
                    }
                };
                requestAnimationFrame(updateScroll);
            }
        }
    });
});

const searchBtn = document.getElementById('navigate_search');
const settingsBtn = document.getElementById('settingsBtn');
const recentDiv = document.getElementById('recents');
const latestDiv = document.getElementById('latest');
// const downloadsButton = document.getElementById('downloads')

if (!searchBtn || !settingsBtn || !recentDiv || !latestDiv ) throw new Error('No btn');

searchBtn.onclick = async () => {
    window.location.href = './search.html';
};

settingsBtn.onclick = async () => {
    await createNewWindow();
};

// downloadsButton.onclick = async() => {
//     await createNewWindow(true)
// }

recentDiv.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    const div = target.closest('div');
    const link = div?.getAttribute('data-value');
    if (link) {
        await setClickableResult(link);
        const alLink = div?.getAttribute('al-link');
        if (alLink) await setAnilistLink(alLink);
        window.location.href = './AnimeInfo.html?rel=recents';
    }
});

latestDiv.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    const div = target.closest('div');
    const link = div?.getAttribute('data-value');
    if (link) {
        await setClickableResult(link);
        window.location.href = './AnimeInfo.html?rel=latest';
    }
});

async function loadRecentsFromAccount() {
    //to be programmed!
}

async function loadRecentsFromCache() {
    const datas = await fetchRecentsFromCache();
    if (!datas) {
        const element = document.createElement('p');
        element.textContent = 'No recent activity';
        element.className = 'no_act';
        const parent = document.getElementById('recents');
        if (!parent) return;
        parent.appendChild(element);
        return;
    }
    const loaded: string[] = [];
    for (const data of datas.reverse()) {
        if (loaded.includes(data.name)) continue; //prevent multiple entries!
        loaded.push(data.name);
        let name = '';
        if (data.name.length > 25) {
            name = data.name.slice(0, 25).trim() + '...';
        } else {
            name = data.name;
        }
        const recentDiv = document.createElement('div');
        const image = document.createElement('img');
        const title = document.createElement('p');
        recentDiv.className = 'recent_div';
        recentDiv.setAttribute('data-value', data.infoLink);
        recentDiv.setAttribute('al-link', data.anilistLink);
        image.src = data.img;
        image.draggable = false;
        image.className = 'recent_img';
        title.textContent = name;
        title.className = 'anime_title';
        const parentDiv = document.getElementById('recents');
        if (!parentDiv) return;
        parentDiv.appendChild(recentDiv);
        recentDiv.appendChild(image);
        recentDiv.appendChild(title);
    }
}

async function loadLatestAnimes() {
    const db = await getDataBase();
    if (db === 'mal') {
        let latestAnimes: ILatestAnimes[];
        const cache = await fetchLatestFromCache();
        if (cache) latestAnimes = cache as ILatestAnimes[];
        else {
            latestAnimes = await (await getMALLatestAnime()).slice(0, 50);
            await storeLatestAnimeCache(latestAnimes);
        }

        if (!latestAnimes) return;
        for (const latestAnime of latestAnimes) {
            let name = '';
            if (latestAnime.title.length > 25) {
                name = latestAnime.title.slice(0, 25).trim() + '...';
            } else {
                name = latestAnime.title;
            }
            const latestDiv = document.createElement('div');
            const image = document.createElement('img');
            const title = document.createElement('p');
            latestDiv.className = 'latest_div';
            latestDiv.setAttribute('data-value', latestAnime.infoLink);
            image.src = latestAnime.image;
            image.draggable = false;
            image.className = 'recent_img';
            title.textContent = name;
            title.className = 'anime_title';
            const parentDiv = document.getElementById('latest');
            if (!parentDiv) return;
            parentDiv.appendChild(latestDiv);
            latestDiv.appendChild(image);
            latestDiv.appendChild(title);
        }
    }
    if (db === 'anilist') {
        let latestAnimes: ISeasonResponse[];
        const cache = await fetchLatestFromCache();
        if (cache) latestAnimes = cache as ISeasonResponse[];
        else {
            latestAnimes = await (await getALLatestAnime()).slice(0, 50);
            await storeLatestAnimeCache(latestAnimes);
        }
        if (!latestAnimes) return;
        for (const latestAnime of latestAnimes) {
            const animeTitle = latestAnime.title.english ?? latestAnime.title.romaji;
            let name = '';
            if (animeTitle.length > 25) {
                name = animeTitle.slice(0, 25).trim() + '...';
            } else {
                name = animeTitle;
            }
            const latestDiv = document.createElement('div');
            const image = document.createElement('img');
            const title = document.createElement('p');
            latestDiv.className = 'latest_div';
            latestDiv.setAttribute('data-value', `${latestAnime.id}`);
            image.src = latestAnime.coverImage.large;
            image.draggable = false;
            image.className = 'recent_img';
            title.textContent = name;
            title.className = 'anime_title';
            const parentDiv = document.getElementById('latest');
            if (!parentDiv) return;
            parentDiv.appendChild(latestDiv);
            latestDiv.appendChild(image);
            latestDiv.appendChild(title);
        }
    }
}
