const request = require('request');
const cheerio = require('cheerio');
const async = require('async');

const result = {};

const queue = async.queue((item, callback) => {
    request({
        uri: item.uri,
        method: 'GET'
    }, function (err, raw, body) {
        console.log(item.uri);
        const dom = cheerio.load(body, { decodeEntities: false });

        const desc = dom('#mission_links').html().split('<br><br>');
        const res = {
            name: dom(dom("h1").get(1)).text(),
            image: dom("#clients").attr('src'),
            description: desc[1] ? desc[1].split('<strong')[0] : desc[0]
        };

        if (!result[item.section]) {
            result[item.section] = {
                name: item.section,
                items: []
            };
        }

        result[item.section].items.push(res);
        callback();
    });
});

queue.drain = function () {
    console.log(JSON.stringify(result));
}

// links.forEach(link => queue.push(link));

const crawLink = "add_link";

request({
    uri: crawLink,
    method: 'GET'
}, function (err, xhr, body) {
    const content = cheerio.load(body, { decodeEntities: false });
    var currentSection = null;

    content("h2, .product_holder").each(function () {
        if (content(this)[0].tagName === 'h2') {
            currentSection = content(this).text().trim();
            return;
        }

        queue.push({
            uri: cheerio(this).attr('href'),
            section: currentSection
        });
    });
});
