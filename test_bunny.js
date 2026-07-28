const libraryId = '642831';
const videoId = 'ef5d31c0-8147-442e-9f50-e0a6faf73b70';
const securityKey = '278a7d66-fd8d-4a1d-b88e-6f2a7094a06c';
const crypto = require('crypto');

const expires = Math.floor(Date.now() / 1000) + (3600 * 6);
const hashString = securityKey + videoId + expires;
const token = crypto.createHash('sha256').update(hashString).digest('hex');

const embedUrlWithToken = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true&responsive=true&token=${token}&expires=${expires}`;
const embedUrlNoToken = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true&responsive=true`;

console.log('=== RESPOSTA DA BUNNY COM TOKEN ===');
fetch(embedUrlWithToken, {
  headers: {
    'Referer': 'https://contosdeoracao.com.br/watch/b608922f-d2d7-49f9-a2de-408ded5caa70',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  }
}).then(r => r.text()).then(html => console.log('HTML COM TOKEN:', html));

console.log('=== RESPOSTA DA BUNNY SEM TOKEN ===');
fetch(embedUrlNoToken, {
  headers: {
    'Referer': 'https://contosdeoracao.com.br/watch/b608922f-d2d7-49f9-a2de-408ded5caa70',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
  }
}).then(r => r.text()).then(html => console.log('HTML SEM TOKEN:', html));
