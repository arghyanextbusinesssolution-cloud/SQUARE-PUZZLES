import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

function run(command, cwd = rootDir, env = {}) {
    console.log(`Running: ${command} in ${cwd}`);
    execSync(command, {
        cwd,
        stdio: 'inherit',
        env: { ...process.env, ...env }
    });
}

try {
    console.log('--- Starting Unified Build (Hostinger Mode) ---');

    // 1. Install dependencies for all parts
    console.log('Installing dependencies for frontend (my-app)...');
    run('npm install', path.join(rootDir, 'my-app'));

    console.log('Installing dependencies for backend...');
    run('npm install', path.join(rootDir, 'backend'));

    console.log('Building frontend (Next.js)...');
    const myAppDir = path.join(rootDir, 'my-app');

    // Log environment for debugging
    console.log(`NEXT_STATIC_EXPORT: ${process.env.NEXT_STATIC_EXPORT || 'not set'}`);

    // Clear Next.js build cache and output
    const nextDir = path.join(myAppDir, '.next');
    const outDir = path.join(myAppDir, 'out');
    if (fs.existsSync(nextDir)) {
        console.log(`Clearing ${nextDir}...`);
        fs.rmSync(nextDir, { recursive: true, force: true });
    }
    if (fs.existsSync(outDir)) {
        console.log(`Clearing ${outDir}...`);
        fs.rmSync(outDir, { recursive: true, force: true });
    }

    run('npm run build', myAppDir, {
        NEXT_STATIC_EXPORT: 'true',
        NODE_ENV: 'production'
    });

    // 2. Ensure backend/public directory exists
    const publicDir = path.join(rootDir, 'backend', 'public');
    if (!fs.existsSync(publicDir)) {
        console.log('Creating backend/public directory...');
        fs.mkdirSync(publicDir, { recursive: true });
    } else {
        // Clear existing files
        console.log('Clearing existing backend/public files...');
        fs.readdirSync(publicDir).forEach(file => {
            if (file !== '.gitkeep') {
                fs.rmSync(path.join(publicDir, file), { recursive: true, force: true });
            }
        });
    }

    // 3. Copy frontend output to backend/public
    outDir = path.join(rootDir, 'my-app', 'out');
    console.log(`Copying files from ${outDir} to ${publicDir}...`);

    // Polyfill for recursive copy if needed, but fs.cpSync is available in modern Node
    if (fs.cpSync) {
        fs.cpSync(outDir, publicDir, { recursive: true });
    } else {
        // Fallback for older node versions
        if (process.platform === 'win32') {
            run(`xcopy /E /I /Y "${outDir}" "${publicDir}"`);
        } else {
            run(`cp -rf "${outDir}/." "${publicDir}"`);
        }
    }

    console.log('--- Build Completed Successfully ---');
} catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
}
