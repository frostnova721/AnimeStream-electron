const path = require('path');
const fs = require('fs');

const base = './Cache';
const cachePaths = [`${base}/recents.mewmew`, `${base}/runtime.mewmew`];

for (const cachePath of cachePaths) {
    fs.writeFileSync(cachePath, '');
}
