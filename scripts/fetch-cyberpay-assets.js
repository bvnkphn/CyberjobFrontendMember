const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const html = await get('https://cyberpay.asia/');
  const chunkMatches = html.match(/\/static\/chunks\/[^"']+/g) || html.match(/\/_next\/static\/chunks\/[^"']+/g) || [];
  console.log('Found chunks:', chunkMatches.length);

  for (const chunk of chunkMatches) {
    const chunkUrl = 'https://cyberpay.asia' + chunk;
    const code = await get(chunkUrl);
    if (code.includes('พันธมิตร') || code.includes('ออมสิน') || code.includes('SCB') || code.includes('KBank')) {
      console.log('Match in chunk:', chunk);
      const imgs = code.match(/["'][^"']*\.(?:png|jpg|jpeg|svg|webp)["']/gi) || [];
      console.log('Images in chunk:', imgs);
      // Print snippet around พันธมิตร
      const pIdx = code.indexOf('พันธมิตร');
      if (pIdx !== -1) {
        console.log('Snippet:');
        console.log(code.substring(pIdx - 100, pIdx + 1500));
      }
    }
  }
}

run().catch(console.error);
