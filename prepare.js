const path = require('path');
const fs = require('fs');
const { tmpdir } = require('os')

const base = `${tmpdir()}/animestream`;
const cachePaths = [`${base}/recents.mewmew`, `${base}/runtime.mewmew`];

if(!fs.existsSync(base)) fs.mkdirSync(base)

for (const cachePath of cachePaths) {
    fs.writeFileSync(cachePath, '');
}
