// WiiCtl — PC-side WebSocket server
// Accepts phone connections via WebSocket, routes input commands to the
// Win32 bridge engine. Also serves a QR-code page for easy phone pairing.

const http = require('http');
const { WebSocketServer } = require('ws');
const QRCode = require('qrcode');
const os = require('os');
const bridge = require('./win32/bridge.js');

const WS_PORT = parseInt(process.env.WS_PORT || '8321', 10);
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '8320', 10);

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

// --- HTTP server: QR code page ---
const qrServer = http.createServer(async (req, res) => {
  if (req.url === '/api/qr') {
    const ip = getLocalIP();
    const payload = JSON.stringify({ ip, port: WS_PORT });
    const qr = await QRCode.toString(payload, { type: 'svg', width: 300 });
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(qr);
    return;
  }
  if (req.url === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ip: getLocalIP(), port: WS_PORT }));
    return;
  }
  // Serve a simple HTML page
  const ip = getLocalIP();
  const infoJSON = JSON.stringify({ ip, port: WS_PORT });
  const qrSVG = await QRCode.toString(infoJSON, { type: 'svg', width: 250 });
  const fs = require('fs');
  let logoBase64 = '';
  try { logoBase64 = fs.readFileSync(require('path').join(__dirname, '..', '..', 'mobile', 'assets', 'logo-banner.png')).toString('base64'); } catch {}
  const logoImg = logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" style="height:80px;margin-bottom:16px" />` : '';
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>ZenRmouse</title>
<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#0d0a1a;color:#e2d9f3;flex-direction:column}
p{font-size:1.2em;color:#8b7aa8}
svg{margin:1.5em 0}.info{background:#1a1030;padding:2em 3em;border-radius:16px;text-align:center;border:1px solid #3d2060}</style></head>
<body><div class="info">${logoImg}<p>Telefonundan bu QR kodu okut veya manuel baglan:</p>
<p style="font-size:1.5em;font-weight:bold;color:#a855f7">${ip}:${WS_PORT}</p>
${qrSVG}</div></body></html>`);
});

qrServer.listen(HTTP_PORT, () => {
  const ip = getLocalIP();
  console.log('='.repeat(50));
  console.log('  ZenRmouse Sunucusu Baslatildi!');
  console.log('='.repeat(50));
  console.log(`  QR sayfasi:  http://${ip}:${HTTP_PORT}`);
  console.log(`  WebSocket:   ws://${ip}:${WS_PORT}`);
  console.log(`  Ekran boyutu: aliniyor...`);
  console.log('='.repeat(50));
});

// --- WebSocket server: phone connection ---
const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Set();

wss.on('listening', async () => {
  try {
    const s = await bridge.screen();
    console.log(`  Ekran: ${s.width}x${s.height}`);
  } catch (e) {
    console.error('  Ekran alinamadi:', e.message);
  }
});

wss.on('connection', (ws, req) => {
  const addr = req.socket.remoteAddress;
  console.log(`[ws] Baglandi: ${addr}`);
  clients.add(ws);

  ws.on('message', async (raw) => {
    let msg;
    try {
      msg = JSON.parse(String(raw));
    } catch {
      ws.send(JSON.stringify({ ok: false, error: 'invalid json' }));
      return;
    }

    try {
      const { action } = msg;
      switch (action) {
        case 'screen': {
          const s = await bridge.screen();
          ws.send(JSON.stringify({ ok: true, screen: s }));
          break;
        }
        case 'move': {
          await bridge.move(msg.x, msg.y);
          ws.send(JSON.stringify({ ok: true }));
          break;
        }
        case 'move_relative': {
          const s = await bridge.screen();
          await bridge.move(msg.x, msg.y);
          ws.send(JSON.stringify({ ok: true }));
          break;
        }
        case 'click':     { await bridge.click(msg.button || 'left');    ws.send(JSON.stringify({ ok: true })); break; }
        case 'down':      { await bridge.down(msg.button || 'left');     ws.send(JSON.stringify({ ok: true })); break; }
        case 'up':        { await bridge.up(msg.button || 'left');       ws.send(JSON.stringify({ ok: true })); break; }
        case 'scroll':    { await bridge.scroll(msg.amount || 0);        ws.send(JSON.stringify({ ok: true })); break; }
        case 'tap':       { await bridge.tapKey(msg.key);                ws.send(JSON.stringify({ ok: true })); break; }
        case 'type':      { await bridge.type(msg.text);                 ws.send(JSON.stringify({ ok: true })); break; }
        case 'hotkey':    { await bridge.hotkey(msg.mods, msg.key);      ws.send(JSON.stringify({ ok: true })); break; }
        case 'media':     { await bridge.media(msg.key);                 ws.send(JSON.stringify({ ok: true })); break; }
        default:
          ws.send(JSON.stringify({ ok: false, error: 'unknown action: ' + action }));
      }
    } catch (e) {
      ws.send(JSON.stringify({ ok: false, error: e.message }));
    }
  });

  ws.on('close', () => {
    console.log(`[ws] Baglanti kesildi: ${addr}`);
    clients.delete(ws);
  });

  ws.on('error', (e) => console.error('[ws] Hata:', e.message));
});

// --- Graceful shutdown ---
process.on('SIGINT', async () => {
  console.log('\nKapatiliyor...');
  for (const c of clients) c.close();
  await bridge.quit();
  qrServer.close();
  wss.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  for (const c of clients) c.close();
  await bridge.quit();
  qrServer.close();
  wss.close();
  process.exit(0);
});
