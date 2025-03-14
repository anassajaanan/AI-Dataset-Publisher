const fs = require('fs');
const path = require('path');

// Base directory for file storage
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Uploads directory created at: ${UPLOAD_DIR}`);
} else {
  console.log(`Uploads directory already exists at: ${UPLOAD_DIR}`);
}

// Create a .gitignore file in the uploads directory to ignore uploaded files
// but keep the directory structure in git
const gitignorePath = path.join(UPLOAD_DIR, '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  console.log('Creating .gitignore file in uploads directory...');
  fs.writeFileSync(gitignorePath, '# Ignore all files in this directory\n*\n\n# Except this file\n!.gitignore\n');
  console.log('.gitignore file created');
} else {
  console.log('.gitignore file already exists');
}

console.log('Setup complete!'); 