
import * as fs from 'node:fs';
import * as process from 'node:process';

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


function podziel(inputFile, outputFile, pixelsCount, sumCount) {

    let csv = fs.readFileSync(inputFile, 'utf8');

    let tab = csv
        .split(/\r?\n/)
        .filter(line => line)
        .filter((line, index) => index > 0)
        .map(line => line
            .split(',')
            .filter((cell, index) => index > 1)
            .map(cell => parseFloat(cell.trim()))
        );

    let black = tab.reduce((p, row) => Math.min(p, row.reduce((p2, cell) => Math.min(p2, cell), Infinity)), Infinity);

    let height = tab.length;
    let width = tab.reduce((width, row) => Math.max(width, row.length), 0);
    let parts = new Array(Math.ceil(width / pixelsCount)).fill(0).map(() => []);

    console.log(`${inputFile}: ${width} kolumn (${width * height} pikseli) podzielono na ${parts.length} fragmentów po ${pixelsCount} kolumn (${pixelsCount * height} pikseli) na fragment. Poziom czarny: ${black}`);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let part = Math.floor(x / pixelsCount);
            let value = tab[y][x];
            if (value > black) {
                parts[part].push(value);
            }
        }
    }

    parts = parts.map(part => part.sort((a, b) => b - a));
    let sum = 0;
    let count = 0;

    for (let i = 0; i < parts.length; i++) {
        let sum_part = parts[i].slice(0, sumCount);
        sum += sum_part.reduce((a, b) => a + b, 0);
        count += sum_part.length;
    }

    let length = parts.reduce((p, c) => Math.max(p, c.length), 0);

    let out = [];
    for (let i = 0; i < length; i++) {
        out[i] = [];
        for (let j = 0; j < parts.length; j++) {
            out[i][j] = parts[j][i];
        }
    }

    globalOutput.push([
        `"${inputFile}"`, pixelsCount, sumCount, sum, count, black
    ]);


    out = out
        .map(row => row.join(';'))
        .join('\r\n');
    fs.writeFileSync(outputFile, out, 'utf-8');
}

function toCSV(file, data) {
    let out = data
        .map(row => row.map(x => typeof(x) == 'string' ? x : x.toString().replace('.', ',')).join(';'))
        .join('\r\n');
    fs.writeFileSync(file, out, 'utf-8');
}

async function main() {
    console.log('Pikseli na fragment:');
    let pixelsCount = parseInt((await prompt()).trim());

    console.log('Wartości do sumy:');
    let sumCount = parseFloat((await prompt()).trim());

    for (let f of fs.readdirSync('in')) {
        if (!f.startsWith('.')) {
            podziel(`in/${f}`, `out/${f}`, pixelsCount, sumCount);
        }
    }

    toCSV('wynik.csv', globalOutput);
}

let globalOutput = [
    ['"Nazwa"', '"Dlugosc przedzialu"', '"Zadana liczba maksimow"', '"Suma maksimow"', '"Liczba maksimow nie zerowych"', '"Poziom czarnego"']
];

main();
