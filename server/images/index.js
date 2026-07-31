const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});