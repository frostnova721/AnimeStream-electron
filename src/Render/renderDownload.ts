import { readDownload } from '../Core';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('container');

    if (!container) return;

    const downloads = await readDownload();
    if (downloads.length < 1) return;
    for (const download of downloads) {
        container.appendChild(
            createDownloadItem(download.title, download.path, download.status, download.size),
        );
    }
});

function createDownloadItem(
    title: string,
    location: string,
    status: 'downloading' | 'downloaded' | 'cancelled',
    size: number,
) {
    const downloadItem = document.createElement('div');
    downloadItem.className = 'downloadItem';
    const image = '../Assets/Icons/download.png';
    downloadItem.innerHTML = `<div class="img"><img src="${image}"></div>
    <div class="details ${status === 'downloading' ? 'active' : ''}">
        <div class="title">${title}</div>
        <a id="location" class="location">${location}</a>
        <div class="status" id="status">${status} • ${size}</div>
    </div>`;

    return downloadItem;
}
