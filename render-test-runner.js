const http = require('node:http');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const port = Number(process.env.PORT ?? 10000);
const reportDirectory = path.resolve(process.cwd(), 'playwright-report');
const startedAt = new Date().toISOString();
let state = 'running';
let exitCode = null;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webm': 'video/webm',
  '.zip': 'application/zip',
};

const sendReportFile = (requestPath, response) => {
  const relativePath = requestPath === '/report/'
    ? 'index.html'
    : decodeURIComponent(requestPath.slice('/report/'.length));
  const filePath = path.resolve(reportDirectory, relativePath);

  if (!filePath.startsWith(`${reportDirectory}${path.sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end(
        state === 'running'
          ? 'The Playwright report will be available after the tests finish.'
          : 'Report file not found.',
      );
      return;
    }

    response.writeHead(200, {
      'content-type': contentTypes[path.extname(filePath)] ?? 'application/octet-stream',
    });
    fs.createReadStream(filePath).pipe(response);
  });
};

const server = http.createServer((request, response) => {
  if (request.url === '/report') {
    response.writeHead(302, { location: '/report/' }).end();
    return;
  }

  if (request.url?.startsWith('/report/')) {
    sendReportFile(request.url, response);
    return;
  }

  const isResultsRoute = request.url === '/results';
  if (isResultsRoute) {
    response.writeHead(state === 'failed' ? 500 : 200, {
      'content-type': 'application/json; charset=utf-8',
    });
    response.end(JSON.stringify({ service: 'qafunctions', state, exitCode, startedAt }));
    return;
  }

  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>QA Functions results</title>
    <style>
      body { font: 16px system-ui, sans-serif; max-width: 720px; margin: 4rem auto; padding: 0 1rem; }
      .state { font-size: 1.5rem; font-weight: 700; text-transform: uppercase; }
      a { color: #2563eb; }
    </style>
  </head>
  <body>
    <h1>QA Functions</h1>
    <p>Test state: <span class="state">${state}</span></p>
    <p>Started: ${startedAt}</p>
    <p>Exit code: ${exitCode ?? 'not available yet'}</p>
    <p>${state === 'running' ? 'Tests are running. Refresh this page shortly.' : '<a href="/report/">Open the Playwright HTML report</a>'}</p>
    <p><a href="/results">View JSON status</a></p>
  </body>
</html>`);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Test status server listening on port ${port}`);

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const tests = spawn(
    npmCommand,
    ['test', '--', '--reporter=line,html', '--workers=1'],
    { stdio: 'inherit', env: { ...process.env, CI: 'true' } },
  );

  tests.on('error', (error) => {
    state = 'failed';
    exitCode = 1;
    console.error('Unable to start Playwright:', error);
  });

  tests.on('exit', (code, signal) => {
    exitCode = code ?? 1;
    state = exitCode === 0 ? 'passed' : 'failed';
    console.log(`Playwright finished with state=${state}, signal=${signal ?? 'none'}`);
  });
});

const shutdown = () => server.close(() => process.exit(exitCode ?? 0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
