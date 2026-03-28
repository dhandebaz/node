const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modified = 0;
let methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

walkDir(path.join(__dirname, 'src', 'app', 'api'), function(filePath) {
  if (filePath.endsWith('route.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already wrapped
    if (content.includes('withErrorHandler')) return;

    let changed = false;
    let importAdded = false;

    // Use regex to locate: export async function GET(request: NextRequest) {
    const regex = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(([^)]*)\)\s*\{/g;
    
    let newContent = content.replace(regex, (match, method, args) => {
        changed = true;
        return `export const ${method} = withErrorHandler(async function(${args}) {`;
    });

    if (changed) {
        // Find all export async function replacements and make sure to close the bracket?
        // Wait! The regex above only replaces the function definition. Since it's changing it from a function declaration to a const, the closing `}` is not matched!
        // `withErrorHandler(async function(req) { ... })` needs a closing `})` instead of `}`.
        // It's very difficult to reliably find the matching closing bracket with regex.
    }
  }
});
