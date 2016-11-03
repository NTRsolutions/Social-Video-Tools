import * as express from 'express';
import { FireBase } from '../common/firebase/firebase.service';
import { resolve } from 'path';
import { config } from '../common/config';

const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

// init firebase
// const db = FireBase.database();
const fireBase = new FireBase();

// init server
const server = express();
const port = process.env.PORT || 8080;

const uploadRoutes = require('./routes/upload');
const apiRoutes = require('./routes/api');

server.set('fireBase', fireBase);
server.use(bodyParser());

let publicPath = config.workingDirectory;
server.use('/video', express.static(publicPath)); 

// when getting root, serve angular client
const pathToClient = path.join(__dirname, '../dist/dev');

console.log(pathToClient);
server.use('/', express.static(pathToClient));

const originsWhitelist = [
  'http://localhost:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    const isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
    callback(null, isWhitelisted);
  },
  credentials: true,
};

server.use(cors(corsOptions));

server.use('/upload', uploadRoutes);
server.use('/api', apiRoutes);

console.log('listening on port: ' + port);
server.listen(port);
