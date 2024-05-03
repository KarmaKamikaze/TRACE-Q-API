const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const basePath = './client-scripts'; // Base directory for static files

http.createServer(function (request, response) {
    let filePath = '.' + request.url;
    if (filePath === './') {
        filePath = './index.html'; // Default to serving index.html for '/'
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        // Add more cases for other file types if needed (e.g., CSS, images)
    }

    fs.readFile(filePath, function (err, content) {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                response.writeHead(404);
                response.end('File not found');
            } else {
                // Other error
                response.writeHead(500);
                response.end('Server error');
            }
        } else {
            // Successful response
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}).listen(PORT);

console.log("Server is now running on http://127.0.0.1:" + PORT);
