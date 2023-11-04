import {
    displayResults,
    setBackTo,
    setClickableResult,
    aniListSearch,
    readSettings,
    storeAnimeData,
    getDataBase,
} from '../Core';

document.addEventListener('DOMContentLoaded', async () => {
    const btn = document.getElementById('searchBtn');
    if (!btn) throw new Error('No btn');

    await setBackTo('../../Public/html/search.html');
    // const settings = await readSettings()
    const db = await getDataBase();

    btn.onclick = async () => {
        const searchbar = <HTMLInputElement>document.getElementById('searchBar');
        if (!searchbar) return;
        if (!searchbar.value) return;
        await appendSearchResults(searchbar.value);
    };

    const backBtn = document.getElementById('backBtn');
    if (!backBtn) return;
    backBtn.onclick = () => (window.location.href = './Home.html');

    const resDiv = document.getElementById('results');
    if (!resDiv) throw new Error('haaa'); //error wont happen
    resDiv.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        if (db === 'mal') {
            const link = target.closest('div')?.getAttribute('link');
            if (!link) throw new Error('Couldnt get the link');
            await setClickableResult(link);
        } else if (db === 'anilist') {
            const data = target.closest('div')?.getAttribute('data-anime');
            if (!data) throw new Error('No data');
            await storeAnimeData(data);
        }
        window.location.href = './AnimeInfo.html';
    });

    const searchBar = <HTMLInputElement>document.getElementById('searchBar');
    if (!searchBar) return;
    searchBar.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            if (!searchBar.value) return;
            event.preventDefault();
            await appendSearchResults(searchBar.value);
        }
    });
});

async function appendMALSearchResults(searchValue: string) {
    const main = document.getElementById('main');
    const loader = document.getElementById('loader');

    if (!main || !loader) return;

    main.style.display = 'none';
    loader.style.display = 'block';

    const results = await displayResults(searchValue);
    const resultDiv = document.getElementById('results');
    if (!resultDiv) return;
    const imgDiv = document.getElementsByClassName('div_anime_cover');
    while (imgDiv.length > 0) {
        imgDiv[0].parentNode?.removeChild(imgDiv[0]);
    }
    for (const result of results) {
        const newDiv = document.createElement('div');
        newDiv.className = 'div_anime_cover';
        newDiv.id = 'div_anime_cover';
        newDiv.setAttribute('link', result.infoLink);

        const img = document.createElement('img');
        img.src = result.image;
        img.className = 'anime_cover';
        img.draggable = false;

        const textElement = document.createElement('p');
        textElement.innerText = result.name;

        resultDiv.appendChild(newDiv);
        newDiv.appendChild(img);
        newDiv.appendChild(textElement);
    }

    loader.style.display = 'none';
    main.style.display = 'flex';
}

async function appendAnilistSearchResults(searchValue: string) {
    const main = document.getElementById('main');
    const loader = document.getElementById('loader');

    if (!main || !loader) return;

    main.style.display = 'none';
    loader.style.display = 'block';

    const results = await aniListSearch(searchValue);
    const resultDiv = document.getElementById('results');
    if (!resultDiv) return;
    const imgDiv = document.getElementsByClassName('div_anime_cover');
    while (imgDiv.length > 0) {
        imgDiv[0].parentNode?.removeChild(imgDiv[0]);
    }
    for (const result of results) {
        const newDiv = document.createElement('div');
        newDiv.className = 'div_anime_cover';
        newDiv.id = 'div_anime_cover';
        newDiv.setAttribute('link', 'NoLinkMf');
        newDiv.setAttribute('data-anime', JSON.stringify(result));

        const img = document.createElement('img');
        img.src = result.coverImage.large;
        img.className = 'anime_cover';
        img.draggable = false;

        const textElement = document.createElement('p');
        textElement.innerText = result.title.english ?? result.title.romaji ?? '';

        resultDiv.appendChild(newDiv);
        newDiv.appendChild(img);
        newDiv.appendChild(textElement);
    }

    loader.style.display = 'none';
    main.style.display = 'flex';
}

async function appendSearchResults(searchValue: string) {
    if (!searchValue) return;
    const settings = await readSettings();
    if (settings.database === 'anilist') {
        return await appendAnilistSearchResults(searchValue);
    }
    if (settings.database === 'mal') {
        return await appendMALSearchResults(searchValue);
    }
}
