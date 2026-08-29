// WiiCtl input engine: Node TCP server <-> PowerShell Win32 bridge
// A TCP server on 127.0.0.1:PORT is created. The PowerShell bridge
// connects as a client. Commands are sent over TCP.

const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 8322;
const PS = process.env.SystemRoot + '\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
const BRIDGE_PS = path.join(__dirname, 'bridge.ps1');

let server = null;
let bridgeProc = null;
let clientSocket = null;
let buf = '';
let queue = [];
let booted = false;

function startServer() {
  return new Promise((resolve, reject) => {
    server = net.createServer((sock) => {
      clientSocket = sock;
      sock.setEncoding('utf8');
      sock.on('data', (data) => {
        buf += data;
        let idx;
        while ((idx = buf.indexOf('\n')) !== -1) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          const job = queue.shift();
          if (job) {
            if (line.startsWith('OK:')) job.resolve(line.slice(3));
            else if (line === 'OK') job.resolve(true);
            else if (line === 'OK:bye') job.resolve('bye');
            else job.reject(new Error(line));
          }
        }
      });
      sock.on('error', () => {});
      sock.on('close', () => { clientSocket = null; });
    });
    server.listen(PORT, '127.0.0.1', () => resolve());
    server.on('error', reject);
  });
}

function spawnBridge() {
  return new Promise((resolve, reject) => {
    bridgeProc = spawn(PS, [
      '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-File', BRIDGE_PS, '-Port', String(PORT)
    ], { stdio: 'ignore' });
    bridgeProc.on('error', reject);
    bridgeProc.on('exit', () => { bridgeProc = null; });
    // Wait for C# compilation + TCP connect
    setTimeout(resolve, 3000);
  });
}

function send(line) {
  return new Promise((resolve, reject) => {
    if (!clientSocket) return reject(new Error('bridge not connected'));
    queue.push({ resolve, reject });
    clientSocket.write(line + '\n');
  });
}

async function init() {
  if (booted) return true;
  await startServer();
  await spawnBridge();
  booted = true;
  return true;
}

async function screen() {
  await init();
  const r = await send('SCREEN 0 0');
  const [w, h] = String(r).split(',');
  return { width: parseInt(w, 10), height: parseInt(h, 10) };
}

async function move(x, y)   { await init(); return send('MOVE ' + Math.round(x) + ' ' + Math.round(y)); }
async function click(b)     { await init(); return send('CLICK ' + b); }
async function down(b)      { await init(); return send('DOWN ' + b); }
async function up(b)        { await init(); return send('UP ' + b); }
async function scroll(a)    { await init(); return send('SCROLL ' + Math.round(a)); }
async function tapKey(n)    { await init(); return send('TAPK ' + n); }
async function type(t)      { await init(); return send('TYPE ' + t); }
async function hotkey(m, k) { await init(); return send('HOTKEY ' + m + ' ' + k); }
async function media(k)     { await init(); return send('MEDIA ' + k); }

async function quit() {
  try { await send('QUIT'); } catch {}
  if (bridgeProc) bridgeProc.kill();
  if (server) server.close();
}

module.exports = { init, screen, move, click, down, up, scroll, tapKey, type, hotkey, media, quit };
