
import * as fs from 'fs';

async function prompt() {
    let l = '';
    process.stdin.setEncoding('utf8');
    do {
        process.stdin.pause();
        let v = process.stdin.read();
        if (v === null) {
            await new Promise(resolve => setTimeout(resolve, 100));
        } else {
            l += v;
        }
    } while (l.indexOf('\n') < 0 && l.indexOf('\r') < 0);
    return l;
}

async function main() {

    let csv = fs.readFileSync('input.csv', 'utf8');

    let tab = csv
        .split(/\r?\n/)
        .filter(line => line)
        .filter((line, index) => index > 0)
        .map(line => line
            .split(',')
            .filter((cell, index) => index > 1)
            .map(cell => cell.trim())
            );

    console.log('Pikseli na fragment:');
    let count = parseInt((await prompt()).trim());

    console.log('Procent do sumy:');
    let perc = parseFloat((await prompt()).trim());

    console.log('Czarny:');
    let black = parseFloat((await prompt()).trim());

    let height = tab.length;
    let width = tab.reduce((width, row) => Math.max(width, row.length), 0);
    let parts = new Array(Math.ceil(width / count)).fill(0).map(() => []);

    console.log(`${width} kolumn (${width * height} pikseli) podzielono na ${parts.length} fragmentów po ${count} kolumn (${count * height} pikseli) na fragment.`);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let part = Math.floor(x / count);
            let value = parseFloat(tab[y][x]);
            if (value > black) {
                parts[part].push(value);
            }
        }
    }

    parts = parts.map(part => part.sort((a, b) => b - a));
    let sums = parts.map(() => 0);
    let counts = parts.map(() => 0);

    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        counts[i] = Math.round(part.length * perc / 100);
        sums[i] = part.slice(0, counts[i]).reduce((a, b) => a + b, 0);
    }

    let out = [];
    for (let i = 0; i < parts[0].length; i++) {
        out[i] = [];
        for (let j = 0; j < parts.length; j++) {
            out[i][j] = parts[j][i];
        }
    }

    out.unshift(sums.map(() => ''));
    out.unshift(counts);
    out.unshift(sums);

    out = out
        .map(row => row.join(';'))
        .join('\r\n');
    fs.writeFileSync('output.csv', out, 'utf-8');
}

main();
