import {
    getSearchMemory,
    searchResults,
    setAnilistLink,
    setBackTo,
    setClickableResult,
    storeSearchMemory,
} from '../Core';


document.addEventListener('DOMContentLoaded', async () => {
    const btn = document.getElementById('searchBtn');
    if (!btn) throw new Error('No btn');

    await setBackTo('../../Public/html/search.html');

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

    const currentUrl = window.location.href;
    if (currentUrl.split('?')[1] === 'rel=info') {
        console.log('from info');
        const resultFromMemory: string = await getSearchMemory();
        if (resultFromMemory) resDiv.innerHTML = resultFromMemory;
    }

    resDiv.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        const link = target.closest('div')?.getAttribute('link');
        if (!link) throw new Error('Couldnt get the link');
        await setClickableResult(link);
        const alLink = target.closest('div')?.getAttribute('al-link');
        if (alLink) {
            await setAnilistLink(alLink);
        }
        window.location.href = './AnimeInfo.html?rel=search';
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

//functions

async function appendSearchResults(searchValue: string) {
    const main = document.getElementById('main');
    const loader = document.getElementById('loader');

    if (!main || !loader) return;

    main.style.display = 'none';
    loader.style.display = 'block';

    const results = await searchResults(searchValue);
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
        img.src = result.coverImage.extraLarge;
        img.className = 'anime_cover';
        img.draggable = false;

        const textElement = document.createElement('p');
        const name = result.title.english ?? result.title.romaji
        textElement.innerText = name.length > 40 ? name.slice(0,40).trim()+ '...' : name;

        if (result.infoAl) {
            newDiv.setAttribute('al-link', result.infoAl);
        }

        resultDiv.appendChild(newDiv);
        newDiv.appendChild(img);
        newDiv.appendChild(textElement);
    }

    await storeSearchMemory(resultDiv.innerHTML);
    loader.style.display = 'none';
    main.style.display = 'flex';
}
