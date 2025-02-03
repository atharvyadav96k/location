const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', async (req, res) => {
    let ip = req.ip;

    // If behind a proxy, check the X-Forwarded-For header for the real IP
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(',')[0]; // Get the first IP in the list
    }

    // Remove the ::ffff: prefix if present
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    // If it's a localhost IP (127.0.0.1), return a custom message
    if (ip === '127.0.0.1') {
        return res.send({
            message: 'You are accessing the server from localhost. No geolocation data is available.'
        });
    }

    try {
        const response = await fetch(`https://ipinfo.io/${ip}?token=c30788efb45483`);
        const jsonResponse = await response.json();

        if (jsonResponse.error) {
            return res.send({
                message: 'No data for this IP address',
            });
        }

        console.log(jsonResponse); // Logs all the information from the API

        res.send({
            ip: jsonResponse.ip,
            city: jsonResponse.city,
            region: jsonResponse.region,
            country: jsonResponse.country,
            loc: jsonResponse.loc,
        });
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).send('Unable to fetch address information');
    }
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
