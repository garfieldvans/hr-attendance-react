const net = require('node:net');
const { spawn } = require('node:child_process');

require('dotenv').config({ quiet: true });

const services = [
  { name: 'gateway', script: 'dev:gateway', color: '\x1b[35m' },
  { name: 'auth', script: 'dev:auth', color: '\x1b[36m' },
  { name: 'core', script: 'dev:core', color: '\x1b[32m' },
];

const reset = '\x1b[0m';
const children = [];

const canConnect = (host, port) =>
  new Promise((resolve) => {
    const socket = net.connect({ host, port });
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });

const waitForDatabase = async (host, port, attempts) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (await canConnect(host, port)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
};

const ensureDatabase = async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT || 3306);

  if (await canConnect(host, port)) {
    return;
  }

  console.log(`MySQL tidak aktif di ${host}:${port}, menjalankan docker compose...`);

  const docker = spawn('docker', ['compose', 'up', '-d'], { stdio: 'inherit' });
  const code = await new Promise((resolve) => docker.on('exit', resolve));

  if (code !== 0) {
    console.log('Container MySQL gagal dijalankan, periksa Docker lalu coba lagi.');
    return;
  }

  if (await waitForDatabase(host, port, 60)) {
    console.log('MySQL siap.');
  } else {
    console.log('MySQL belum menerima koneksi, service akan mencoba menyambung sendiri.');
  }
};

const createWriter = (name, color) => {
  let buffer = '';

  return (chunk) => {
    buffer += String(chunk);
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (line.trim()) {
        process.stdout.write(`${color}[${name}]${reset} ${line}\n`);
      }
    }
  };
};

const stopAll = (signal) => {
  for (const child of children) {
    if (child.exitCode !== null) {
      continue;
    }

    if (process.platform === 'win32') {
      child.kill(signal);
    } else {
      process.kill(-child.pid, signal);
    }
  }
};

const start = (service) => {
  const child = spawn('npm', ['run', service.script], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
  });

  const write = createWriter(service.name, service.color);
  child.stdout.on('data', write);
  child.stderr.on('data', write);

  child.on('exit', (code, signal) => {
    if (signal || code === 0) {
      return;
    }

    console.log(`[${service.name}] berhenti dengan kode ${code}, mematikan service lain...`);
    stopAll('SIGTERM');
    process.exitCode = code;
  });

  children.push(child);
};

process.on('SIGINT', () => {
  stopAll('SIGTERM');
  process.exit();
});

process.on('SIGTERM', () => {
  stopAll('SIGTERM');
  process.exit();
});

process.on('SIGHUP', () => {
  stopAll('SIGTERM');
  process.exit();
});

const main = async () => {
  await ensureDatabase();

  for (const service of services) {
    start(service);
  }

  console.log('Menjalankan gateway :3000, auth :3001, core :3002. Tekan Ctrl+C untuk berhenti.');
};

void main();
