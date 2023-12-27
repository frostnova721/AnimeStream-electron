import { ipcRenderer, shell } from 'electron';
import {
    changeDataBase,
    changeDefaultStream,
    clearCache,
    getAppDetails,
    getDataBase,
    getDefaultStream,
    readSettings,
    setDefaultSkipTime,
} from '../Core';
import { Settings } from '../Types';

const defaultSettings: Settings = {
    database: 'anilist',
    defaultStream: 'gogoanime',
    skipDuration: 5,
};

//just tried making the html in js(bad idea)

const options = document.getElementById('left');

document.addEventListener('DOMContentLoaded', async () => {
    if (!options) throw new Error('errr');
    await appendGeneral();
    options.addEventListener('click', async (e) => {
        const classList = document.getElementsByClassName('selected');
        const target = e.target as HTMLElement;
        if (target.classList.contains('options')) {
            for (const c of classList) {
                c.classList.toggle('selected');
                target.closest('div')?.classList.toggle('selected');
            }
            const selectedElement = document.getElementsByClassName('selected')[0];

            if (selectedElement.getAttribute('data-value') === 'cache') {
                appendCache();
            } else if (selectedElement.getAttribute('data-value') === 'general') {
                await appendGeneral();
            } else if (selectedElement.getAttribute('data-value') === 'info') {
                await appendInfo();
            } else if (selectedElement.getAttribute('data-value') === 'player') {
                await appendPlayer();
            }
        }
    });
});

//CACHE
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

//GENERAL
async function appendGeneral() {
    clearPage();
    const insidediv = document.getElementById('insidediv');
    if (!insidediv) return;

    const arr: HTMLElement[] = [];

    arr.push(await loadDbOptions());
    arr.push(await loadStreamOptions());

    for (const ele of arr) {
        insidediv.appendChild(ele);
    }
}

function clearPage() {
    const inside = document.getElementById('insidediv');
    if (!inside) return;
    inside.innerHTML = '';
}

//streams
async function loadStreamOptions() {
    const imgPath = '../../Public/Assets/Icons/down-arrow.png';

    const element = document.createElement('div');
    element.className = 'defstream'; //unused
    element.classList.add('grp');
    const desc = document.createElement('div');
    desc.className = 'desc';
    desc.innerText = 'Default stream';
    // const optsContainer = document.createElement('div')
    // optsContainer.className = 'optsContainer'
    const opts = document.createElement('div');
    const img = document.createElement('img');
    img.src = imgPath;
    opts.id = 'streamOpts';
    opts.className = 'streamOpts';
    opts.innerText = await getDefaultStream();
    const dropdown = document.createElement('div');

    dropdown.id = 'dropdown';
    dropdown.className = 'dropdown';
    // const select = document.createElement('select')

    const streamNames = ['gogoanime', 'animepahe'];
    for (const streamName of streamNames) {
        const option = document.createElement('div');
        option.setAttribute('data-value', streamName);
        // option.className = 'streamName'
        option.onclick = async () => {
            const currentStream = await getDefaultStream();
            const selectedStream = option.getAttribute('data-value') as 'animepahe' | 'gogoanime';
            if (currentStream === selectedStream) return;
            await changeDefaultStream(selectedStream);
            opts.innerText = selectedStream;
        };
        option.innerText = streamName;
        dropdown.appendChild(option);
    }

    opts.appendChild(img);
    element.appendChild(desc);
    element.appendChild(opts);
    element.appendChild(dropdown);
    return element;
}

//dbs
async function loadDbOptions() {
    const element = document.createElement('div');
    element.className = 'db'; //unused
    element.classList.add('grp');
    const desc = document.createElement('div');
    desc.innerText = 'Database';
    desc.className = 'desc';
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

    return element;
}

//INFO
async function appendInfo() {
    clearPage();
    const html = `<h2>INFO</h2>
    <p>AnimeStream - A electron app made to stream and download anime</p><br>
    <p>Repository: <a id="repo" href=https://github.com/frostnova721/AnimeStream style="color: #caf979;">https://github.com/frostnova721/AnimeStream</a></p><br>
    <div><p>Thanks for downloading ♥</p></div><br><br>
    <div>app info:<br>
    electron version: ${process.versions.electron}<br>
    app version: ${(await getAppDetails()).version}
    </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = html;

    const insidediv = document.getElementById('insidediv');
    if (!insidediv) return;

    insidediv.appendChild(div);

    const hyperlink = document.getElementById('repo');
    if (!hyperlink) return;
    hyperlink.onclick = (e) => {
        e.preventDefault();
        shell.openExternal((e.target as HTMLAnchorElement).href);
    };
}

//PLAYER
async function appendPlayer() {
    clearPage();

    const insidediv = document.getElementById('insidediv');
    if (!insidediv) return;

    const settings = await readSettings();

    const html = `<div class="skipDurationDiv">
    <div class="skipTitle">skip duration</div>
    <input type="number" max="60" min="0" class="skipInput" id="skipInput" value="${settings.skipDuration}">s
    </div>`;

    insidediv.innerHTML = html;

    const skipInput = document.getElementById('skipInput') as HTMLInputElement;
    skipInput?.addEventListener('input', async () => {
        const enteredVal = parseInt(skipInput.value, 10);
        console.log('inp');
        if (enteredVal > 60) {
            skipInput.value = '60';
        }
        await setDefaultSkipTime(enteredVal);
    });
}
