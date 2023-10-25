import { createNewWindow, fetchRecentsFromCache } from "../Core";

document.addEventListener('DOMContentLoaded', async() => {
    const connectedToAccount = false

    const recentContainer = document.getElementById('recents')

    if(!recentContainer) throw new Error('No DIVVVVV');

    if(connectedToAccount) await loadRecentsFromAccount()
    else await loadRecentsFromCache()

    recentContainer.addEventListener('wheel', (event) => {
        if (event.deltaY !== 0) {
        recentContainer.scrollLeft += event.deltaY/2
        event.preventDefault()
        }
    })
})

const searchBtn = document.getElementById('navigate_search')
const settingsBtn = document.getElementById('settingsBtn')

if( !searchBtn
    || !settingsBtn
    )   throw new Error('No btn') 

searchBtn.onclick = () => {
    window.location.href = "./search.html"
};

settingsBtn.onclick = async() => {
    await createNewWindow()
}

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