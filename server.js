const http = require('http');
const fs = require('fs');
const path = require('path');
import 'leaflet/dist/leaflet.css'

const PORT = 5000;

http.createServer(function (request, response) {
    let filePath = '.' + request.url;
    if (filePath === './') {
        filePath = './index.html'; 
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
    }

    fs.readFile(filePath, function (err, content) {
        if (err) {
            if (err.code === 'ENOENT') {
                response.writeHead(404);
                response.end('File not found');
            } else {
                response.writeHead(500);
                response.end('Server error');
            }
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}).listen(PORT);

console.log("Server is now running on http://127.0.0.1:" + PORT);
