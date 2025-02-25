
const fs = require('fs');
const Reader = require('@maxmind/geoip2-node').Reader;


process.title = 'geoip_lookup';

const dbBuffer = fs.readFileSync('./GeoLite2-Country.mmdb');

const reader = Reader.openBuffer(dbBuffer);

console.time('geoip-query');
response = reader.country('2800:2285:9000:2de:5c41:b317:808a:38d7');
console.timeEnd('geoip-query');

console.log(response.country);

setInterval(() => { }, 1000);
