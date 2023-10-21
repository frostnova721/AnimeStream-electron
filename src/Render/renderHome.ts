import { fetchRecentsFromCache } from "../Core";

document.addEventListener('DOMContentLoaded', async() => {
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
    for(const data of datas) {
        const recentDiv = document.createElement('div')
        const image = document.createElement('img')
        const title = document.createElement('p')
        recentDiv.className = 'recent_div'
        image.src = data.img
        image.draggable = false
        image.className = 'recent_img'
        title.textContent = data.name
        title.className = 'anime_title'
        const parentDiv = document.getElementById('recents')
        if(!parentDiv) return
        parentDiv.appendChild(recentDiv)
        recentDiv.appendChild(image)
        recentDiv.appendChild(title)
    }
})

const searchBtn = document.getElementById('navigate_search')
if(!searchBtn) throw new Error('No btn') 
searchBtn.onclick = () => {
    window.location.href = "./search.html"
};