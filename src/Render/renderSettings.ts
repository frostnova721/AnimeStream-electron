import { ipcRenderer } from 'electron';
import { changeDataBase, clearCache, getDataBase } from '../Core';

const options = document.getElementById('left');

document.addEventListener('DOMContentLoaded', async () => {
    if (!options) throw new Error('errr');
    await appendGeneral();
    options.addEventListener('click', async (e) => {
        const classList = document.getElementsByClassName('selected');
        const target = e.target as HTMLElement;
        for (const c of classList) {
            c.classList.toggle('selected');
            target.closest('div')?.classList.toggle('selected');
        }
        const selectedElement = document.getElementsByClassName('selected')[0];

        if (selectedElement.getAttribute('data-value') === 'cache') {
            appendCache();
        } else if (selectedElement.getAttribute('data-value') === 'general') {
            await appendGeneral();
        }
    });
});

function appendCache() {
    clearPage();
    const right = document.getElementById('insidediv');
    if (!right) return;

    const element = document.createElement('div');
    element.id = 'cache';

    const btn = document.createElement('button');
    btn.innerText = 'clear cache';
    btn.className = 'item';
    btn.id = 'clearCache';
    btn.onclick = async () => {
        clearCache();
        ipcRenderer.invoke('dialog', 'Cache has been cleared! restart the app to avoid any issues');
    };

    const p = document.createElement('p');
    p.innerText = 'clear cache';
    p.className = 'desc';

    element.appendChild(p);
    element.appendChild(btn);
    right.appendChild(element);
}

async function appendGeneral() {
    clearPage();

    const insidediv = document.getElementById('insidediv');
    if (!insidediv) return;
    const element = document.createElement('div');
    element.className = 'db';
    const desc = document.createElement('div');
    desc.innerText = 'Database';
    const opts = document.createElement('div');
    opts.id = 'dbopts';
    opts.className = 'dboptions';
    const al = document.createElement('div');
    al.id = 'al';
    al.className = 'al';
    al.innerText = 'Anilist';
    const seperation = document.createElement('div');
    seperation.className = 'separation';
    const mal = document.createElement('div');
    mal.innerText = 'MAL';
    mal.className = 'mal';
    mal.id = 'mal';

    const currentDB = await getDataBase();
    currentDB === 'anilist' ? al.classList.add('dbselected') : mal.classList.add('dbselected');

    al.onclick = async () => {
        mal.classList.remove('dbselected');
        al.classList.add('dbselected');

        await changeDataBase('anilist');
    };
    mal.onclick = async () => {
        al.classList.remove('dbselected');
        mal.classList.add('dbselected');

        await changeDataBase('mal');
    };

    opts.appendChild(al);
    opts.appendChild(seperation);
    opts.appendChild(mal);
    element.appendChild(desc);
    element.appendChild(opts);
    insidediv.appendChild(element);
}

function clearPage() {
    const inside = document.getElementById('insidediv');
    if (!inside) return;
    inside.innerHTML = '';
}
