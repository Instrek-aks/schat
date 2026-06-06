const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('dist') && !file.includes('build')) { 
            results = results.concat(walk(file));
        } else { 
            if (file.match(/\.(css|js|jsx|html|md)$/) && !file.includes('node_modules') && !file.includes('.git')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/Hp/scha/schat');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Replace CSS font-family
    let newContent = content.replace(/font-family:\s*[^;}\n\r]+/g, "font-family: 'Poppins', sans-serif");
    // Replace inline fontFamily in jsx if any
    newContent = newContent.replace(/fontFamily:\s*['"][^'"]+['"]/g, "fontFamily: 'Poppins'");
    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log('Updated', file);
    }
});
