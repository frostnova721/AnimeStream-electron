

const options = document.getElementById('left')

document.addEventListener('DOMContentLoaded', async() => {
    if(!options) throw new Error('errr');
    console.log('loaded')
    options.addEventListener('click', (e) => {
        console.log('click')
        const classList = document.getElementsByClassName('selected')
        const target = e.target as HTMLElement
        for(const c of classList) {
            c.classList.toggle('selected')
            target.classList.toggle('selected')
        }
    })
})