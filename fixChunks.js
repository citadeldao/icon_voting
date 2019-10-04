const fs = require('fs');
const path = require('path');

const frontendDirname = path.join(__dirname, './build');
const indexUrl = path.join(frontendDirname, '/index.html');

fs.writeFileSync(indexUrl,
    fs.readFileSync(indexUrl)
        .toString('utf-8')
        .replace(/\"\/static/g, '"./static'));

fs.readdirSync(path.join(frontendDirname, './static/css'))
    .filter(c => c.endsWith('.css'))
    .forEach(c => {
        let assetUrl = path.join(frontendDirname, '/static/css', c);
        console.log(assetUrl)
        fs.writeFileSync(assetUrl,
            fs.readFileSync(assetUrl)
                .toString('utf-8')
                .replace(/\(\/static/g, '(../../static')
                .replace(/\/SFProDisplay\-Regular\.ttf/, '../../SFProDisplay-Regular.ttf'));
    })
