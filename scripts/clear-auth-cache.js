// Script to clear NextAuth session cache
const fs = require('fs');
const path = require('path');

try {
  // Define paths
  const nextjsCacheDir = path.join(process.cwd(), '.next/cache');
  
  // Check if the .next/cache directory exists
  if (fs.existsSync(nextjsCacheDir)) {
    console.log('Clearing Next.js cache...');
    
    // Find and remove NextAuth session files
    const cacheFiles = fs.readdirSync(nextjsCacheDir, { recursive: true });
    
    let sessionFilesRemoved = 0;
    
    // Look for files that might be related to NextAuth
    cacheFiles.forEach(file => {
      // Only process strings (ignore other types returned by recursive read)
      if (typeof file === 'string') {
        const fullPath = path.join(nextjsCacheDir, file);
        
        if (
          file.includes('next-auth') || 
          file.includes('session') || 
          file.includes('token') ||
          file.includes('jwt')
        ) {
          try {
            // Remove the file
            if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
              fs.unlinkSync(fullPath);
              console.log(`Removed: ${file}`);
              sessionFilesRemoved++;
            }
          } catch (err) {
            console.error(`Error removing file ${file}:`, err);
          }
        }
      }
    });
    
    console.log(`NextAuth session cache cleanup complete. Removed ${sessionFilesRemoved} files.`);
  } else {
    console.log('No Next.js cache directory found.');
  }
  
  console.log('Auth cache clearing completed!');
} catch (error) {
  console.error('Error while clearing auth cache:', error);
  process.exit(1);
} 