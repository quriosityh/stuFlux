const https = require('https');
const queries = [
  'portable power station outdoor bright',
  'hardware tools bright',
  'dslr camera desk bright',
  'microphone headphones bright',
  'clothes rack bright',
  'party speaker bright',
  'mountain bike bright'
];

async function search(q) {
  return new Promise((resolve) => {
    https.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(q)}&per_page=1`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results[0]?.urls?.raw || 'not found');
        } catch(e) { resolve('error'); }
      });
    });
  });
}

async function run() {
  for (const q of queries) {
    const url = await search(q);
    console.log(q + ' -> ' + url + '&w=300&q=80&fit=crop&crop=center');
  }
}
run();
