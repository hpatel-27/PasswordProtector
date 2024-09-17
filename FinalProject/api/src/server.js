const express = require('express');

const app = express();
const PORT = process.env.PORT || 80;

const apiRouter = require('./APIRouter');
app.use(apiRouter);

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));