const fs = require('fs');
const path = require('path');

const rootDir = 'src/app/api';

function walk(dir, results) {
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            walk(file, results);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(rootDir, []);

console.log(`Found ${files.length} files to process.`);

files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    if (lines.length === 0) return;

    let processedContent = '';
    let startIndex = 0;

    // Check first line for path comment
    if (lines[0].trim().startsWith('//')) {
        processedContent += lines[0] + '\n';
        startIndex = 1;
    }

    const restContent = lines.slice(startIndex).join('\n');

    // Regex to match strings OR comments
    // 1. Strings: Double, Single, Backtick
    // 2. Comments: // until end of line
    const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\/\/.*)/g;

    const cleanRest = restContent.replace(regex, (match, stringGroup, commentGroup) => {
        if (commentGroup) {
            return ''; // Remove comment
        }
        return match; // Keep string
    });

    // Remove empty lines created by comment removal (optional but good for "cleaning")
    // If a line becomes empty (or whitespace only) due to comment removal, we might want to remove it?
    // But we need to distinguish between "was empty" and "became empty".
    // For now, let's just write valid code. The user asked to remove comments.

    // One specific fix: `cleanRest` might leave trailing spaces if `code // comment` becomes `code `.
    // We should probably trim right side of lines?
    // Let's do a quick pass to trim trailing whitespace on lines?

    const finalLines = (processedContent + cleanRest).split('\n').map(line => {
        // If line contains only whitespace, maybe we can keep it (it's formatting).
        // If it has code, trim trailing.
        return line.trimEnd();
    }).join('\n');

    // Remove double empty lines?
    // Maybe too aggressive.

    fs.writeFileSync(filePath, finalLines);
});

console.log('Finished cleaning comments.');
