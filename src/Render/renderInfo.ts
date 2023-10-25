import { readClickedResult, getAnimeInfo, gogoSearch, storeEpisodeId, storeAnimeWatchedCache } from "../Core";
import { IAnimeDetails } from "../Types";

document.addEventListener("DOMContentLoaded", async () => {
  let toggled = false
  const backBtn = document.getElementById('backBtn')
  const watchBtn = document.getElementById('watchBtn')
  const epCounter = document.getElementById('episodeCounter')
  const main = document.getElementById('container')
  const closeBtn = document.getElementById('close')

  if(!backBtn || !watchBtn || !epCounter || !main || !closeBtn) return;
  backBtn.onclick = () => window.location.href = './search.html'
  watchBtn.onclick = () => {
    if(!toggled) {
      main.style.display = 'none'
      epCounter.style.display = 'block'
      toggled = true
    } else {
      main.style.display = 'block'
      epCounter.style.display = 'none'
      toggled = false
    }
  }
  closeBtn.onclick = () => {
    main.style.display = 'block'
    epCounter.style.display = 'none'
    toggled = false
  }
  const link = await readClickedResult();
  const res = await getAnimeInfo(link);
  await renderResult(res)

  
  const epContent = document.getElementById('episodeContent')
  if(!epContent) throw new Error('No buttons');
  epContent.addEventListener('click', async(e) => {
    const target = e.target as HTMLElement
    if(target.id === 'epBtn') {
      await storeEpisodeId(target.getAttribute('data-value') ?? '')
      const img = res.cover
      const title = res.names.english
      await storeAnimeWatchedCache(title, img, link)
      window.location.href = './Watch.html'
    }
  })
})


//functions

async function renderResult(res: IAnimeDetails) {
  const loader = document.getElementById('loader')
  const main = document.getElementById('main')
  if(!loader || !main) return;
  const imgDiv = document.getElementById("coverImage");
  if (!imgDiv) return;
  const img = document.createElement("img");
  img.src = res.cover;
  img.className = "coverPic";
  img.id = "coverPic";
  img.draggable = false;
  imgDiv.appendChild(img);

  const titleDiv = document.getElementById("animeName");
  if (!titleDiv) return;
  const title = document.createElement("p");
  title.innerText = res.names.english;
  titleDiv.appendChild(title);

  const basicInfo = document.getElementById("basicInfo");
  if (!basicInfo) return;
  const synopsis = document.createElement("p");
  synopsis.innerHTML = `<strong>Synopsis:</strong> <br>${res.synopsis}`;
  basicInfo.appendChild(synopsis);

  const advancedInfo = document.getElementById('advancedInfo')
  const miscInfo = document.getElementById('miscInfo')
  const characters = document.getElementById('characters')
  if(!advancedInfo || !miscInfo || !characters) return;
  const info = document.createElement('p')
  info.innerHTML =
   [
        `Title: ${res.names.english}`,
        `Japanese: ${res.names.japanese}`,
        `Episodes: ${res.episodes}`,
        `Type: ${res.type}`,
        `Genres: ${res.genres.join(', ')}, ${res.themes.join(', ')}`,
        `MAL score: ${res.score}`,
        `Status: ${res.status}`,
        `Duration: ${res.duration}`,

    ].join('<br>')

    advancedInfo.appendChild(info)

    const misc = document.createElement('p')
    misc.innerHTML = 
    [
      `Aired: ${res.aired}`,
      `Studios: ${res.studios}`,
      `Premiered: ${res.premiered}`,
      `Producers: ${res.producers.join(', ')}`,
      `Broadcast: ${res.broadcast}`
    ].join('<br>')

    miscInfo.appendChild(misc)

    for(const chara of res.characters) {
      const characterdiv = document.createElement('div')
      characterdiv.className = 'character'
      const charaImg = document.createElement('img')
      charaImg.src = chara.image
      const charaName = document.createElement('p')
      charaName.textContent = chara.name
      charaName.className = 'charaName'
      const charaRole = document.createElement('p')
      charaRole.textContent = chara.role
      charaRole.className = 'charaRole'
      characterdiv.appendChild(charaImg)
      characterdiv.appendChild(charaName)
      characterdiv.appendChild(charaRole)
      characters.appendChild(characterdiv)
    }

    loader.style.display = 'none'
    main.style.display = 'flex'

    let name: string | undefined;

    if(res.synonyms.length > 1) name = res.synonyms

    if(name) 
      return void await appendEpisodes(res.title.replace(/[,|\.]/g, ''), res.names.english)
    else
      return void await appendEpisodes(res.names.english)
}

async function appendEpisodes(term: string, term2?: string) {
  let res;
  try {
    console.log(`searching ${term}`)
    res = (await gogoSearch(term))[0]
  } catch(err) {
    if(term2){
      console.log(`searching ${term2}`)
      res = (await gogoSearch(term2))[0]
    }
    else
      throw new Error('Couldnt get any results :(')
  }
  const epContent = document.getElementById('episodeContent')
  const loaderContainer = document.getElementById('loaderContainer')
  if(!epContent || !loaderContainer) return;
  loaderContainer.style.display = 'none'
  epContent.style.display = 'flex'
  console.log(res)
  for(let i=1; i <= res.episodes; i++) {
    // if(i%20 === 0) createPage(i)
    createEpisode(i, epContent, res.episodeLink)
  }

}

function createEpisode(number: number, div: HTMLElement, episodeId: string) {
  const divElement = document.createElement('div')
    divElement.className = 'episode'

    const button = document.createElement('button')
    button.className = 'epBtn'
    button.id = 'epBtn'
    button.setAttribute('data-value', `${episodeId}${number}`)
    button.textContent = `${number}`

    divElement.appendChild(button)
    div.appendChild(divElement)
}

// function createPage(number: number) {
//   const pagesContainer = document.getElementById('pages')
//   const newPage = document.createElement('div')
//   newPage.className = 'page'
//   const p = document.createElement('p')
//   p.textContent = `${number}`
//   newPage.appendChild(p)
//   pagesContainer?.appendChild(newPage)
// }