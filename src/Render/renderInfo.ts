import {
    readClickedResult,
    getAnimeInfo,
    gogoSearch,
    storeEpisodeId,
    storeAnimeWatchedCache,
    getBackTo,
    getStoredAnimeData,
    getDataBase,
    getEpisodes,
    getAnilistLink,
} from '../Core';
import { IAnimeDetails } from '../Types';

document.addEventListener('DOMContentLoaded', async () => {
    // const settings = await readSettings()
    const db = await getDataBase();

    let toggled = false;
    const backBtn = document.getElementById('backBtn');
    const watchBtn = document.getElementById('watchBtn');
    const epCounter = document.getElementById('episodeCounter');
    const main = document.getElementById('container');
    const closeBtn = document.getElementById('close');
    const characterContainer = document.getElementById('characters');

    if (!backBtn || !watchBtn || !epCounter || !main || !closeBtn || !characterContainer) return; //typescript's OCD

    //to go back
    backBtn.onclick = async () => (window.location.href = await getBackTo());

    //toggle the view of episode menu
    watchBtn.onclick = () => {
        if (!toggled) {
            main.style.display = 'none';
            epCounter.style.display = 'block';
            toggled = true;
        } else {
            main.style.display = 'block';
            epCounter.style.display = 'none';
            toggled = false;
        }
    };

    //close the menu
    closeBtn.onclick = () => {
        main.style.display = 'block';
        epCounter.style.display = 'none';
        toggled = false;
    };

    let res: any = '';
    let link: string = '';
    let q: any = {};

    //get the queries
    const queries = window.location.href.split('?')[1]?.split('=');
    if (queries) {
        q = {
            [queries[0]]: queries[1],
        };
    }

    link = await readClickedResult();
    res = await getAnimeInfo(link);
    await renderResult(res);

    const epContent = document.getElementById('episodeContent');
    if (!epContent) throw new Error('No buttons');
    //goto watch page when clicked on a episode
    epContent.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        if (target.id === 'epBtn') {
            await storeEpisodeId(target.getAttribute('data-value') ?? '');
            const img = res.cover;
            const title = res.names?.english || res.title?.english;
            await storeAnimeWatchedCache(title, img, link);
            window.location.href = './Watch.html';
        }
    });
});

//functions

async function renderResult(res: IAnimeDetails) {
    const loader = document.getElementById('loader');
    const main = document.getElementById('main');
    if (!loader || !main) return;
    const imgDiv = document.getElementById('coverImage');
    if (!imgDiv) return;
    const img = document.createElement('img');
    img.src = res.cover;
    img.className = 'coverPic';
    img.id = 'coverPic';
    img.draggable = false;
    imgDiv.appendChild(img);

    const titleDiv = document.getElementById('animeName');
    if (!titleDiv) return;
    const title = document.createElement('p');
    title.innerText =
        res.names.english.length > 45 ? res.names.english.slice(0, 45) + '...' : res.names.english;
    titleDiv.appendChild(title);

    const basicInfo = document.getElementById('basicInfo');
    if (!basicInfo) return;
    const synopsis = document.createElement('p');
    synopsis.innerHTML = `<strong>Synopsis:</strong> <br>${res.synopsis}`;
    basicInfo.appendChild(synopsis);

    const advancedInfo = document.getElementById('advancedInfo');
    const miscInfo = document.getElementById('miscInfo');
    const characters = document.getElementById('characters');
    if (!advancedInfo || !miscInfo || !characters) return;
    const info = document.createElement('p');
    info.innerHTML = [
        `Title: ${res.names.english}`,
        `Japanese: ${res.names.japanese}`,
        `Episodes: ${res.episodes}`,
        `Type: ${res.type}`,
        `Genres: ${res.genres.join(', ')}, ${res.themes.join(', ')}`,
        `MAL score: ${res.score}`,
        `Status: ${res.status}`,
        `Duration: ${res.duration}`,
    ].join('<br>');

    advancedInfo.appendChild(info);

    const misc = document.createElement('p');
    misc.innerHTML = [
        `Aired: ${res.aired}`,
        `Studios: ${res.studios}`,
        `Premiered: ${res.premiered}`,
        `Producers: ${res.producers.join(', ')}`,
        `Broadcast: ${res.broadcast}`,
    ].join('<br>');

    miscInfo.appendChild(misc);

    for (const chara of res.characters) {
        const characterdiv = document.createElement('div');
        characterdiv.className = 'character';
        const charaImg = document.createElement('img');
        charaImg.src = chara.image;
        const charaName = document.createElement('p');
        charaName.textContent = chara.name;
        charaName.className = 'charaName';
        const charaRole = document.createElement('p');
        charaRole.textContent = chara.role;
        charaRole.className = 'charaRole';
        characterdiv.appendChild(charaImg);
        characterdiv.appendChild(charaName);
        characterdiv.appendChild(charaRole);
        characters.appendChild(characterdiv);

        characters.addEventListener('wheel', (event) => {
            if (event.deltaY !== 0) {
                characters.scrollLeft += event.deltaY / 1.8;
                event.preventDefault();
            }
        });
    }

    loader.style.display = 'none';
    main.style.display = 'flex';

    return void (await appendEpisodes(
        res.title.replace(/[,|\.]/g, ''),
        res.names.english ?? res.names.japanese,
    ));
}

async function appendEpisodes(term: string, term2?: string) {
    const db = await getDataBase()
    let l = await readClickedResult()
    if(db === 'anilist') {
        l = await getAnilistLink()
    }
    console.log(l)
    const res = await getEpisodes(l);
    // try {
    //     res = (await gogoSearch(term))[0];
    // } catch (err) {
    //     if (term2) {
    //         res = (await gogoSearch(term2))[0];
    //     } else throw new Error('Couldnt get any results :(');
    // }

    const epContent = document.getElementById('episodeContent');
    const loaderContainer = document.getElementById('loaderContainer');
    if (!epContent || !loaderContainer) return;
    loaderContainer.style.display = 'none';
    epContent.style.display = 'flex';
    // console.log(res)
    for (let i = 1; i <= res.length; i++) {
        createEpisode(i, epContent, res[i-1].episodeTitle, res[i-1].imageUrl);
    }
}

function createEpisode(number: number, div: HTMLElement, epName: string, img?: string,episodeId?: string) {
    const divElement = document.createElement('div');
    divElement.className = 'episode';

    const episode = document.createElement('div');
    episode.className = 'epBtn';
    episode.id = 'epBtn';

    if(img) {
        console.log(img)
        episode.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${img})`
    }

    const numberDiv = document.createElement('div')
    numberDiv.className = 'epNumber'
    numberDiv.textContent = `Episode ${number}`

    const nameDiv = document.createElement('div')
    nameDiv.className = 'epName'
    nameDiv.textContent = epName

    // button.setAttribute('data-value', `${episodeId}${number}`);

    episode.appendChild(numberDiv);
    episode.appendChild(nameDiv)
    divElement.appendChild(episode);
    div.appendChild(divElement);
}
