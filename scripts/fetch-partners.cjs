const https = require('https');

https.get('https://cyberpay.asia/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find section with พันธมิตร
    const idx = data.indexOf('พันธมิตร');
    if (idx !== -1) {
      console.log('Found พันธมิตร snippet:');
      console.log(data.substring(idx - 200, idx + 4000));
    } else {
      console.log('Not found directly in HTML, searching for img tags:');
      const imgs = data.match(/<img[^>]+>/g) || [];
      console.log(imgs.slice(0, 30));
    }
  });
}).on('error', err => console.error(err));
