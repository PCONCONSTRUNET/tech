const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let dirPath = path.join(dir, file);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath);
        } else if (file === 'page.tsx') {
            let content = fs.readFileSync(dirPath, 'utf8');
            let original = content;
            content = content.replace(/export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"];?/g, '');
            if (content !== original) {
                fs.writeFileSync(dirPath, content);
                console.log('Updated', dirPath);
            }
        }
    });
}

walkDir('c:\\Users\\Lucas\\.antigravity-ide\\tech\\src\\app\\(admin)\\painel');
