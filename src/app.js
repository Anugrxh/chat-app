// src/app.js
const express = require('express');
const cors = require('cors');
const v1Routes = require('./api/v1');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', v1Routes);

module.exports = app;
