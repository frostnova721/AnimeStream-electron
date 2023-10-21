import { readClickedResult, getAnimeInfo } from "../Core";

document.addEventListener("DOMContentLoaded", async () => {
  const backBtn = document.getElementById('backBtn')
  if(!backBtn) return;
  backBtn.onclick = () => window.location.href = './search.html'
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
}
