const http = require('http');
const https = require('https');
const net = require('net');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOSTNAME || '0.0.0.0';
const INTERNAL_PORT = parseInt(process.env.INTERNAL_PORT, 10) || 30000;

// Locate SSL certificate and key
const certCandidates = [
  path.join(__dirname, 'certs', 'cert.pem'),
  path.join(__dirname, 'cert.pem'),
  '/app/certs/cert.pem',
  '/app/cert.pem',
];
const keyCandidates = [
  path.join(__dirname, 'certs', 'key.pem'),
  path.join(__dirname, 'key.pem'),
  '/app/certs/key.pem',
  '/app/key.pem',
];

const certFile = certCandidates.find((p) => fs.existsSync(p));
const keyFile = keyCandidates.find((p) => fs.existsSync(p));

let sslOptions = null;
if (certFile && keyFile) {
  try {
    sslOptions = {
      cert: fs.readFileSync(certFile),
      key: fs.readFileSync(keyFile),
    };
    console.log(`[DualServer] Loaded SSL certificates from ${certFile}`);
  } catch (err) {
    console.error('[DualServer] Failed to read SSL certificates:', err.message);
  }
} else {
  console.warn('[DualServer] Warning: SSL certificate or key not found. HTTPS will not be available.');
}

// Handler for incoming HTTP / HTTPS requests
function handleRequest(req, res) {
  const isHttps = !!(req.socket.encrypted || req.connection.encrypted);
  const proto = isHttps ? 'https' : 'http';

  const clientIp = req.socket.remoteAddress || '';
  const existingXff = req.headers['x-forwarded-for'];
  const xForwardedFor = existingXff ? `${existingXff}, ${clientIp}` : clientIp;

  const headers = {
    ...req.headers,
    'x-forwarded-proto': proto,
    'x-forwarded-for': xForwardedFor,
    'x-forwarded-host': req.headers.host || `localhost:${PORT}`,
  };

  const options = {
    hostname: '127.0.0.1',
    port: INTERNAL_PORT,
    path: req.url,
    method: req.method,
    headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const resHeaders = { ...proxyRes.headers };
    if (isHttps) {
      if (!resHeaders['strict-transport-security']) {
        resHeaders['strict-transport-security'] = 'max-age=31536000; includeSubDomains; preload';
      }
    } else {
      resHeaders['strict-transport-security'] = 'max-age=0';
    }
    res.writeHead(proxyRes.statusCode, resHeaders);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway: Next.js internal server not reachable');
    }
  });

  req.pipe(proxyReq, { end: true });
}

// Handler for WebSocket upgrades
function handleUpgrade(req, socket, head) {
  const proxySocket = net.connect(INTERNAL_PORT, '127.0.0.1', () => {
    const lines = [`${req.method} ${req.url} HTTP/${req.httpVersion}`];
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      lines.push(`${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
    }
    proxySocket.write(lines.join('\r\n') + '\r\n\r\n');
    if (head && head.length > 0) {
      proxySocket.write(head);
    }
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxySocket.on('error', () => socket.destroy());
  socket.on('error', () => proxySocket.destroy());
}

// Setup servers
const httpServer = http.createServer(handleRequest);
httpServer.on('upgrade', handleUpgrade);

let httpsServer = null;
if (sslOptions) {
  httpsServer = https.createServer(sslOptions, handleRequest);
  httpsServer.on('upgrade', handleUpgrade);
}

// TCP Multiplexer: inspect first byte to distinguish TLS from plain HTTP
const multiplexer = net.createServer((socket) => {
  socket.once('data', (buffer) => {
    socket.pause();
    socket.unshift(buffer);

    // 0x16 (22) is TLS Handshake record
    if (buffer[0] === 0x16 && httpsServer) {
      httpsServer.emit('connection', socket);
    } else {
      httpServer.emit('connection', socket);
    }

    process.nextTick(() => socket.resume());
  });

  socket.on('error', () => {
    // Ignore client socket disconnects
  });
});

// Wait for Next.js internal server to be ready
function waitForInternalServer(port, host, retries = 60, delay = 250) {
  return new Promise((resolve, reject) => {
    let count = 0;
    const check = () => {
      const s = net.connect(port, host, () => {
        s.destroy();
        resolve();
      });
      s.on('error', () => {
        count++;
        if (count >= retries) {
          reject(new Error(`Timed out waiting for Next.js internal server at ${host}:${port}`));
        } else {
          setTimeout(check, delay);
        }
      });
    };
    check();
  });
}

// Spawn Next.js standalone server
const serverScript = path.join(__dirname, 'server.js');
console.log(`[DualServer] Starting Next.js standalone process on internal port ${INTERNAL_PORT}...`);

const nextProcess = spawn(process.execPath, [serverScript], {
  env: {
    ...process.env,
    PORT: String(INTERNAL_PORT),
    HOSTNAME: '127.0.0.1',
  },
  stdio: 'inherit',
});

nextProcess.on('exit', (code) => {
  console.log(`[DualServer] Next.js process exited with code ${code}`);
  process.exit(code || 0);
});

// Start multiplexer once internal Next.js server is accepting connections
waitForInternalServer(INTERNAL_PORT, '127.0.0.1')
  .then(() => {
    multiplexer.listen(PORT, HOST, () => {
      console.log(`[DualServer] Dual HTTP/HTTPS Server is ready!`);
      console.log(`[DualServer] -> HTTP:  http://${HOST}:${PORT}`);
      if (httpsServer) {
        console.log(`[DualServer] -> HTTPS: https://${HOST}:${PORT}`);
      }
    });
  })
  .catch((err) => {
    console.error('[DualServer] Error:', err.message);
    process.exit(1);
  });

// Graceful shutdown
function shutdown() {
  console.log('[DualServer] Shutting down...');
  try {
    nextProcess.kill('SIGTERM');
  } catch (e) {}
  multiplexer.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
