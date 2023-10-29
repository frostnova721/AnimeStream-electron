import { Path, createNewWindow, fetchRecentsFromCache, setBackTo, setClickableResult, getLatestAnime } from "../Core";

document.addEventListener('DOMContentLoaded', async() => {
    const connectedToAccount = false

    await setBackTo(Path.join(__dirname, '../../Public/html/home.html'))

    const recentContainer = document.getElementById('recents')
    const latestContainer = document.getElementById('latest')

    if(!recentContainer || !latestContainer) throw new Error('No DIVVVVV');

    if(connectedToAccount) await loadRecentsFromAccount()
    else await loadRecentsFromCache()

    await loadLatestAnimes()

    recentContainer.addEventListener('wheel', (event) => {
        if (event.deltaY !== 0 && recentContainer.scrollWidth > recentContainer.clientWidth) {
            recentContainer.scrollLeft += event.deltaY/2
            event.preventDefault()
        }
    })

    latestContainer.addEventListener('wheel', (event) => {
        if (event.deltaY !== 0 && latestContainer.scrollWidth > latestContainer.clientWidth) {
            latestContainer.scrollLeft += event.deltaY/2
            event.preventDefault()
        }
    })
})

const searchBtn = document.getElementById('navigate_search')
const settingsBtn = document.getElementById('settingsBtn')
const recentDiv = document.getElementById('recents')
const latestDiv = document.getElementById('latest')

if( !searchBtn
    || !settingsBtn
    || !recentDiv
    || !latestDiv
    )   throw new Error('No btn') 

searchBtn.onclick = () => {
    window.location.href = "./search.html"
};

settingsBtn.onclick = async() => {
    await createNewWindow()
}

recentDiv.addEventListener('click', async(e) => {
    const target = e.target as HTMLElement
    if(!target) return
    const div = target.closest('div')
    const link = div?.getAttribute('data-value')
    if(link) {
        await setClickableResult(link)
        window.location.href = './AnimeInfo.html'
    }
})

latestDiv.addEventListener('click', async(e) => {
    const target = e.target as HTMLElement
    if(!target) return;
    const div = target.closest('div')
    const link = div?.getAttribute('data-value')
    if(link) {
        await setClickableResult(link)
        window.location.href = './AnimeInfo.html'
    }
})

async function loadRecentsFromAccount() {
    //to be programmed!
}

async function loadRecentsFromCache() {
    const datas = await fetchRecentsFromCache()
    if(!datas) {
        const element = document.createElement('p')
        element.textContent = 'No recent activity'
        element.className = 'no_act'
        const parent = document.getElementById('recents')
        if(!parent) return
        parent.appendChild(element)
        return;
    }
    for(const data of datas.reverse()) {
        let name = ''
        if(data.name.length >= 35) {
            name = data.name.slice(0,35) + '...'
        } else {
            name = data.name
        }
        const recentDiv = document.createElement('div')
        const image = document.createElement('img')
        const title = document.createElement('p')
        recentDiv.className = 'recent_div'
        recentDiv.setAttribute('data-value', data.infoLink)
        image.src = data.img
        image.draggable = false
        image.className = 'recent_img'
        title.textContent = name
        title.className = 'anime_title'
        const parentDiv = document.getElementById('recents')
        if(!parentDiv) return
        parentDiv.appendChild(recentDiv)
        recentDiv.appendChild(image)
        recentDiv.appendChild(title)
    }
}

async function loadLatestAnimes() {
    const latestAnimes = await (await getLatestAnime()).slice(0, 50)
    for(const latestAnime of latestAnimes) {
        let name = ''
        if(latestAnime.title.length >= 35) {
            name = latestAnime.title.slice(0,35) + '...'
        } else {
            name = latestAnime.title
        }
        const recentDiv = document.createElement('div')
        const image = document.createElement('img')
        const title = document.createElement('p')
        recentDiv.className = 'latest_div'
        recentDiv.setAttribute('data-value', latestAnime.infoLink)
        image.src = latestAnime.image
        image.draggable = false
        image.className = 'recent_img'
        title.textContent = name
        title.className = 'anime_title'
        const parentDiv = document.getElementById('latest')
        if(!parentDiv) return
        parentDiv.appendChild(recentDiv)
        recentDiv.appendChild(image)
        recentDiv.appendChild(title)
    }
}