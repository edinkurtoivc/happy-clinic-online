
const { spawn } = require('child_process');
const { join } = require('path');
const { platform } = require('os');

// Determine the correct command based on the platform
const npmCmd = platform() === 'win32' ? 'npm.cmd' : 'npm';

// Run the dev server
console.log('Starting development server...');
const devServer = spawn(npmCmd, ['run', 'dev'], { 
  stdio: 'inherit',
  shell: true
});

// Start Electron when dev server is ready
setTimeout(() => {
  console.log('Starting Electron...');
  const electron = spawn(npmCmd, ['run', 'electron:start'], { 
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  electron.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    devServer.kill();
    process.exit(code);
  });
}, 5000); // Wait 5 seconds for dev server to start

// Handle process termination
process.on('SIGINT', () => {
  devServer.kill();
  process.exit(0);
});
