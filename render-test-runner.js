const http = require('node:http');
const { spawn } = require('node:child_process');

const port = Number(process.env.PORT ?? 10000);
const startedAt = new Date().toISOString();
let state = 'running';
let exitCode = null;

const server = http.createServer((request, response) => {
  const isResultsRoute = request.url === '/results';
  const statusCode = isResultsRoute && state === 'failed' ? 500 : 200;

  response.writeHead(statusCode, { 'content-type': 'application/json' });
  response.end(
    JSON.stringify({
      service: 'qafunctions',
      state,
      exitCode,
      startedAt,
    }),
  );
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Test status server listening on port ${port}`);

  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const tests = spawn(
    npmCommand,
    ['test', '--', '--reporter=line', '--workers=1'],
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
