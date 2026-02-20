const http = require('http');

const data = JSON.stringify({
    token: 'fake_access_token'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/auth/google',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.log(`STATUS: ERROR`); // Custom output
    console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(data);
req.end();
