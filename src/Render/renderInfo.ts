import { readClickedResult, getAnimeInfo, gogoSearch } from "../Core";

const pages: any = {}

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
  await renderResult()
})

async function renderResult() {
  const loader = document.getElementById('loader')
  const main = document.getElementById('main')
  if(!loader || !main) return;
  const link = await readClickedResult();
  const res = await getAnimeInfo(link);
  const imgDiv = document.getElementById("coverImage");
  if (!imgDiv) return;
  const img = document.createElement("img");
  img.src = res.cover;
  img.className = "coverPic";
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

    return void appendEpisodes(res.synonyms)
}

async function appendEpisodes(term: string) {
  const res = (await gogoSearch(term))[0]
  const epContent = document.getElementById('episodeContent')
  if(!epContent) return
  console.log(res)
  for(let i=1; i <= res.episodes; i++) {
    if(i%20 === 0) createPage(i)
    createEpisode(i, epContent)
  }
}

function createEpisode(number: number, div: HTMLElement) {
  const divElement = document.createElement('div')
    divElement.className = 'episode'

    const button = document.createElement('button')
    button.className = 'epBtn'
    button.textContent = `${number}`

    divElement.appendChild(button)
    div.appendChild(divElement)
}

function createPage(number: number) {
  const pagesContainer = document.getElementById('pages')
  const newPage = document.createElement('div')
  newPage.className = 'page'
  const p = document.createElement('p')
  p.textContent = `${number}`
  newPage.appendChild(p)
  pagesContainer?.appendChild(newPage)
}