const https = require('https');
const fs = require('fs');
const path = require('path');
const httpServer = require('http-server');

// Leer los archivos del certificado SSL
const options = {
    key: fs.readFileSync('localhost.key'),
    cert: fs.readFileSync('localhost.crt')
};

// Crear servidor HTTPS
const server = https.createServer(options, (req, res) => {
    // Construir la ruta del archivo solicitado
    let filePath = path.join(__dirname, 'build', req.url === '/' ? 'index.html' : req.url);
    let extname = path.extname(filePath);
    let contentType = 'text/html';

    // Asignar tipo MIME según la extensión del archivo
    switch (extname) {
        case '.js':
            contentType = 'application/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
        // otros tipos MIME si es necesario
    }

    // Leer el archivo solicitado
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Si no se encuentra el archivo, devolver un 404
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                // Para otros errores, devolver un 500
                res.writeHead(500);
                res.end('Error loading file');
            }
        } else {
            // Devolver el archivo con el tipo MIME correspondiente
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Escuchar en la IP deseada (en este caso localhost) y puerto 8080
server.listen(8080, '127.0.0.1', () => {
    console.log('HTTPS Server running on https://127.0.0.1:8080/');
});
