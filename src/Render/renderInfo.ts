import {
    readClickedResult,
    getAnimeInfo,
    storeAnimeWatchedCache,
    getBackTo,
    getDataBase,
    getAnilistLink,
    getMalIdWithAlId,
    setAnilistLink,
    getAnilistInfo,
    storeTotalEpisodes,
    getEpisodesFromSite,
} from '../Core';
import { IAiredSiteEpisodes, IAnimeDetails } from '../Types';

let isScrolling = false;
let accumulatedDelta = 0;
let banner: string = '';
let error = false;

document.addEventListener('DOMContentLoaded', async () => {
    // const settings = await readSettings()
    const db = await getDataBase();

    let toggled = false;
    const backBtn = document.getElementById('backBtn');
    const watchBtn = document.getElementById('watchBtn');
    const epCounter = document.getElementById('episodeCounter');
    const container = document.getElementById('container');
    const closeBtn = document.getElementById('close');
    const characterContainer = document.getElementById('characters');

    if (!backBtn || !watchBtn || !epCounter || !container || !closeBtn || !characterContainer)
        return; //typescript's OCD

    //to go back
    backBtn.onclick = async () => {
        const backTo = await getBackTo();
        if (backTo.split('/').includes('search.html')) {
            window.location.href = './search.html?rel=info';
        } else {
            window.location.href = backTo;
        }
    };

    //toggle the view of episode menu
    watchBtn.onclick = () => {
        if (!toggled) {
            container.style.display = 'none';
            epCounter.style.display = 'block';
            toggled = true;
        } else {
            container.style.display = error ? 'none' : 'block';
            epCounter.style.display = 'none';
            toggled = false;
        }
    };

    //close the menu
    closeBtn.onclick = () => {
        container.style.display = error ? 'none' : 'block';
        epCounter.style.display = 'none';
        toggled = false;
    };

    let res: any = '';
    let link: string = '';
    let malLink: string;

    link = await readClickedResult();
    malLink = link;
    let fromlatest = false;
    // if(window.location.href.split('?')[1] !== 'rel=latest')
    if (db === 'anilist') {
        if (window.location.href.split('?')[1] === 'rel=latest') {
            const data = await getMalIdWithAlId(link);
            malLink = data.malLink;
            await setAnilistLink(`https://anilist.co/anime/${link}`);
            fromlatest = true;
        }
        if (
            window.location.href.split('?')[1] === 'rel=recents' ||
            window.location.href.split('?')[1] === 'rel=search'
        ) {
            const anilistLink: string = await getAnilistLink();
            link = anilistLink.split('/')[anilistLink.split('/').length - 1];
        }
    }
    if (!link) throw new Error('Couldnt get the link');

    try {
        res = await getAnimeInfo(link);
    } catch (err) {
        error = true;
        const errorScreen = document.getElementById('errorScreen');
        const loader = document.getElementById('loader');
        const main = document.getElementById('main');
        if (!errorScreen || !loader || !main) return;
        loader.style.display = 'none';
        errorScreen.style.display = 'flex';
        main.style.display = 'flex';
        container.style.display = 'none';
        console.log(err);
        return;
    }

    const alLink = await getAnilistLink();
    try {
        banner = (
            await getAnilistInfo(
                alLink.split('/').length > 1
                    ? alLink.split('/')[alLink.split('/').length - 1]
                    : alLink,
            )
        ).bannerImage;
    } catch (err) {
        console.log('couldnt get banner image');
    }
    await renderResult(res);

    const epContent = document.getElementById('episodeContent');
    if (!epContent) throw new Error('No buttons');
    //goto watch page when clicked on a episode
    epContent.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;
        const epBtn = target.closest('#epBtn');
        if (epBtn) {
            const img = res.cover;
            const title = res.title.english.length > 1 ? res.title.english : res.title.romaji;
            const al = await getAnilistLink();
            await storeAnimeWatchedCache(title, img, malLink, al);
            window.location.href = `./Watch.html?watch=${
                epContent.getAttribute('mal-title') ?? ''
            }&ep=${epBtn.getAttribute('episode')}&fromlatest=${fromlatest}&link=${
                epBtn.getAttribute('link') ?? ''
            }`;
        }
    });
});

//functions

async function renderResult(res: IAnimeDetails) {
    const loader = document.getElementById('loader');
    const main = document.getElementById('main');
    const titleDiv = document.getElementById('animeName');
    const imgDiv = document.getElementById('coverImage');
    const basicInfo = document.getElementById('basicInfo');
    const advancedInfo = document.getElementById('advancedInfo');
    const miscInfo = document.getElementById('miscInfo');
    const characters = document.getElementById('characters');
    const titlesContainer = document.getElementById('titlesContainer');
    const titleInfoDiv = document.getElementById('title');
    const nativeTitleInfoDiv = document.getElementById('nativeTitle');

    if (
        !loader ||
        !main ||
        !imgDiv ||
        !titleDiv ||
        !basicInfo ||
        !advancedInfo ||
        !miscInfo ||
        !characters ||
        !titleInfoDiv ||
        !nativeTitleInfoDiv ||
        !titlesContainer
    )
        return;

    const img = document.createElement('img');
    img.src = res.cover;
    img.className = 'coverPic';
    img.id = 'coverPic';
    img.draggable = false;
    imgDiv.appendChild(img);

    const title = document.createElement('p');
    const englishTitle = res.title.english;
    title.innerText =
        englishTitle.length > 1
            ? englishTitle.length > 45
                ? englishTitle.slice(0, 45) + '...'
                : englishTitle
            : '';
    titleDiv.appendChild(title);

    const synopsis = document.createElement('p');
    synopsis.innerHTML = `<strong>Synopsis:</strong> <br>${res.synopsis}`;
    basicInfo.appendChild(synopsis);

    titlesContainer.style.display = 'flex';

    titleInfoDiv.innerText = res.title.english ?? res.title.romaji;
    if (res.title.native.length > 1) nativeTitleInfoDiv.innerText = res.title.native;
    else nativeTitleInfoDiv.style.display = 'none';

    const info = document.createElement('p');
    info.innerHTML = [
        `Episodes: ${res.episodes}`,
        `Type: ${res.type}`,
        `Genres: ${res.genres.join(', ')}`,
        `Rating: ${res.rating}/10`,
        `Status: ${res.status}`,
        `Duration: ${res.duration}`,
    ].join('<br>');

    advancedInfo.appendChild(info);

    const misc = document.createElement('p');
    misc.innerHTML = [
        `Aired: ${res.aired.start ?? '??'} to ${res.aired.end ?? '??'}`,
        `Studios: ${res.studios}`,
    ].join('<br>');

    miscInfo.appendChild(misc);

    for (const chara of res.characters) {
        const characterdiv = document.createElement('div');
        characterdiv.className = 'character';
        const charaImg = document.createElement('img');
        charaImg.draggable = false;
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
    }

    characters.addEventListener('wheel', (event) => {
        // if (event.deltaY !== 0) {
        //     event.preventDefault();
        //     if(timeOut) clearTimeout(timeOut)
        //     timeOut = setTimeout(() => {
        //         characters.scrollLeft += event.deltaY / 2.5;
        //     }, 50)
        // }
        if (event.deltaY !== 0) {
            event.preventDefault();

            accumulatedDelta += event.deltaY;

            if (!isScrolling) {
                isScrolling = true;

                const updateScroll = () => {
                    characters.scrollLeft += accumulatedDelta / 9;
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

    loader.style.display = 'none';
    main.style.display = 'flex';
    const titleForEp = res.title.english ? res.title.english : res.title.romaji;
    return void (await appendEpisodes(
        titleForEp.replace(/[,|\.]/g, ''),
        // res.names.english ?? res.names.japanese,
    ));
}

async function appendEpisodes(term: string) {
    const epContent = document.getElementById('episodeContent');
    const loaderContainer = document.getElementById('loaderContainer');
    if (!epContent || !loaderContainer) return;
    try {
        const db = await getDataBase();
        let l = await readClickedResult();
        if (db === 'anilist' && window.location.href.split('?')[1] !== 'rel=latest') {
            const link = await getAnilistLink();
            l = link.split('/')[link.split('/').length - 1];
        }
        // const res = await getEpisodes(l); not reliable
        const res = await getEpisodesFromSite(term);

        loaderContainer.style.display = 'none';
        epContent.style.display = 'grid';

        await storeTotalEpisodes(`${res.length}`);

        epContent.setAttribute('mal-title', term);
        for (let i = 1; i <= res.length; i++) {
            createEpisode(i, epContent, res);
        }
    } catch (err) {
        loaderContainer.style.display = 'none';
        epContent.innerHTML = `<div class="epError" id="epError">
        <div>💔</div>
        <div>Had some issues getting the episodes</div>
        </div>`;
        epContent.style.display = 'flex';
        epContent.style.justifyContent = 'center';
        epContent.style.alignItems = 'center';
    }
}

function createEpisode(
    number: number,
    div: HTMLElement,
    // epName?: string,
    // img?: string,
    res?: IAiredSiteEpisodes[],
) {
    const divElement = document.createElement('div');
    divElement.className = 'episode';

    const episode = document.createElement('div');
    episode.className = 'epBtn';
    episode.id = 'epBtn';
    episode.setAttribute('episode', `${number}`);

    episode.setAttribute('link', res ? res[number - 1].link ?? '' : '');

    if (banner || (res && res[number - 1].img)) {
        episode.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url(${
            res ? res[number - 1].img ?? banner : ''
        })`;
    }

    const numberDiv = document.createElement('div');
    numberDiv.className = 'epNumber';
    numberDiv.textContent = `Episode ${number}`;

    if (res && res[number - 1].title) {
        const nameDiv = document.createElement('div');
        nameDiv.className = 'epName';
        nameDiv.textContent = res[number - 1].title ?? '';
    }

    episode.appendChild(numberDiv);
    // episode.appendChild(nameDiv);
    divElement.appendChild(episode);
    div.appendChild(divElement);
}
