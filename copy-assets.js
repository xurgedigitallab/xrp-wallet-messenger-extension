const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const copyFile = promisify(fs.copyFile);

const sourceDirs = [
  '_locales',
  'icons'
];

const rootFiles = [
  'manifest.json',
  'options.html',
  'styles.css',
  'pin.gif',
  'option.gif'
];

const destDir = path.resolve('dist');
const excludedDirs = ['node_modules', '.git', 'dist'];

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function copyFileWithDir(src, dest) {
  await ensureDir(path.dirname(dest));
  await copyFile(src, dest);
  console.log(`Copied: ${path.relative(process.cwd(), src)} -> ${path.relative(process.cwd(), dest)}`);
}

async function copyDir(src, dest) {
  await ensureDir(dest);
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (excludedDirs.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFileWithDir(srcPath, destPath);
    }
  }
}

async function main() {
  try {
    console.log('Starting to copy assets...');
    
    // Ensure dist directory exists
    await ensureDir(destDir);

    // Copy root files
    for (const file of rootFiles) {
      if (fs.existsSync(file)) {
        await copyFileWithDir(
          path.resolve(file),
          path.join(destDir, file)
        );
      }
    }

    // Copy directories
    for (const dir of sourceDirs) {
      const srcPath = path.resolve(dir);
      const destPath = path.join(destDir, dir);
      
      if (fs.existsSync(srcPath)) {
        console.log(`Copying directory: ${dir}`);
        await copyDir(srcPath, destPath);
      }
    }
    
    console.log('All assets copied successfully!');
  } catch (error) {
    console.error('Error copying assets:', error);
    process.exit(1);
  }
}

main().catch(console.error);
