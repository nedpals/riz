const express = require('express');
const app = express();
const cors = require('cors');
const { siteDir } = require('./utils');
const store = require('./store');
const path = require('path');

module.exports = function() {
    app.use(cors());
    app.use('/', express.static(siteDir('./dist')));
    app.get('/api/state', (req, res) => {
        res.json(JSON.stringify(store));
    });
    app.get('/__site', (req, res) => {
        res.sendFile(path.resolve(__dirname, './templates/state-explorer/index.html'));
    });
    app.listen(store.site.devServerPort, () => console.log(`Starting devserver on port 3000`));
}