const fs = require('fs');
const files = fs.readdirSync('../src/data');
const async = require('async');
const request = require('request');

const dist = '../src/assets/img/products/';

let combinedText = '';
files.forEach((file) => {
    combinedText += fs.readFileSync('../src/data/' + file).toString('utf8');
});

const links = combinedText
    .match(/\"image\"\: \"(.*)\"/gmi)
    .map(link => {
        return link.split('"')[3];
    });

const download = (uri, filename, callback) => {
  request.head(uri, (err, res, body) => {
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};


const q = async.queue((item, callback) => {
    console.log(`Downloading: ${item}`);
    const file = dist + item.split('/').pop();
    download(item, file, callback);
});

links.forEach(link => q.push(link));
