let version = '1.0'
let cacheName = `static-${version}`;

let lang;
let cards = ["trivia-cards", "culture-cards"];
let countries = ["al", "cv", "che", "ch", "eg", "fr", "ge", "gh", "gr", "ir", "it", "pl", "pt", "sy", "uk"]

const refresh = async function () {
    lang = '';
    try {
        let keys = await caches.keys();
        await Promise.all(keys.map(key => { return caches.delete(key) }))
    }
    catch { client.postMessage({ msg: "refresh fail" }) }
}

self.onmessage = async function (event) {
    if (event.data.type == 'REFRESH') return refresh();
    if (lang == event.data.msg){ return;}
    lang = event.data.msg;
    try {
        let files = [];
        for (let x of cards) {
            for (let i of countries) {
                files.push(`https://app.culturecrossover.eu/wp-json/crossover/${lang}/${x}/${i}`)
            }
        }
        files.push(`https://app.culturecrossover.eu/wp-json/crossover/${lang}/fortune-cards`)
        Promise.reject();
        let cache = await caches.open(cacheName);
        await cache.addAll(files);
    }
    catch {
        console.log('cache failed')
        let clients = await self.clients.matchAll({type : 'window'});
        if(clients && clients.length >= 1) clients[0].postMessage({ type: "ERROR", msg: "cache fail", });
    }
}

self.oninstall = function () {
    skipWaiting();
    console.log('service worker installed');
};

self.onactivate = function (event) {
    event.waitUntil(async function () {
        let claim = await clients.claim();
        let keys = await caches.keys();
        await Promise.all(keys.map(key => { if (key !== cacheName) return caches.delete(key) }))
    }()
    );
};

const handler = async function (request) {
    let res = await caches.match(request);
    if (res){console.log('return from cache'); return res;}
    return fetch(request);
}
self.onfetch = async function (event) { event.respondWith(handler(event.request)) }


