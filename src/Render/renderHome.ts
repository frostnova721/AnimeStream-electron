import {
    createNewWindow,
    fetchRecentsFromCache,
    setBackTo,
    setClickableResult,
    getLatestAnime,
    fetchLatestFromCache,
    storeLatestAnimeCache,
} from '../Core';
import { ILatestAnimes } from '../Types';

document.addEventListener('DOMContentLoaded', async () => {
    const connectedToAccount = false;

    await setBackTo('../../Public/html/home.html');

    const recentContainer = document.getElementById('recents');
    const latestContainer = document.getElementById('latest');

    if (!recentContainer || !latestContainer) throw new Error('No DIVVVVV');

    latestContainer.style.opacity = '1';
    recentContainer.style.opacity = '1';

    if (connectedToAccount) await loadRecentsFromAccount();
    else await loadRecentsFromCache();

    await loadLatestAnimes();

    recentContainer.addEventListener('wheel', (event) => {
        if (event.deltaY !== 0 && recentContainer.scrollWidth > recentContainer.clientWidth) {
            recentContainer.scrollLeft += event.deltaY / 2;
            event.preventDefault();
        }
    });

    latestContainer.addEventListener('wheel', (event) => {
        if (event.deltaY !== 0 && latestContainer.scrollWidth > latestContainer.clientWidth) {
            latestContainer.scrollLeft += event.deltaY / 2;
            event.preventDefault();
        }
    });
});

const searchBtn = document.getElementById('navigate_search');
const settingsBtn = document.getElementById('settingsBtn');
const recentDiv = document.getElementById('recents');
const latestDiv = document.getElementById('latest');

if (!searchBtn || !settingsBtn || !recentDiv || !latestDiv) throw new Error('No btn');

searchBtn.onclick = async () => {
    window.location.href = './search.html';
};

settingsBtn.onclick = async () => {
    await createNewWindow();
};

recentDiv.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    const div = target.closest('div');
    const link = div?.getAttribute('data-value');
    if (link) {
        await setClickableResult(link);
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
        if (data.name?.length >= 30) {
            name = data.name.slice(0, 30) + '...';
        } else {
            name = data.name;
        }
        const recentDiv = document.createElement('div');
        const image = document.createElement('img');
        const title = document.createElement('p');
        recentDiv.className = 'recent_div';
        recentDiv.setAttribute('data-value', data.infoLink);
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
    let latestAnimes: ILatestAnimes[] | undefined = undefined;
    const cache = await fetchLatestFromCache();
    if (cache) latestAnimes = cache;
    else {
        latestAnimes = await (await getLatestAnime()).slice(0, 50);
        await storeLatestAnimeCache(latestAnimes);
    }

    if (!latestAnimes) return;
    for (const latestAnime of latestAnimes) {
        let name = '';
        if (latestAnime.title.length >= 30) {
            name = latestAnime.title.slice(0, 30) + '...';
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
