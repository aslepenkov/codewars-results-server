/* eslint-disable no-console */
const express = require('express');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const codewarsHelper = require('./codewars');

const app = express();
const port = process.env.PORT || 3000;

const itemsJsonPath = path.join(path.join('./', 'json'), 'items.json');

app.get('/api/items', (req, res) => {
    fs.readFile(itemsJsonPath, async (error, data) => {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json'
        });

        if (error) {
            console.log('ReadFile error');
            const d = await codewarsHelper.writeData();
            console.log('Awaited data');
            res.write(d);
        } else {
            res.write(data);
        }

        res.end();
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});

cron.schedule('*/20 * * * *', () => {
    console.log(`Fetch data on ${(new Date()).toISOString()}`);
    codewarsHelper.writeData();
});
