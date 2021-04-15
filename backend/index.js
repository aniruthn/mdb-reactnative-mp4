//to run: use node index.js
console.log('made it');

/**
 * Module dependencies.
 */
//  import express from 'express';
const express = require("express");
//  const compression = require('compression');
//  const bodyParser = require('body-parser');
//  const logger = require('morgan');
//  const chalk = require('chalk');
//  const errorHandler = require('errorhandler');
//  const dotenv = require('dotenv');
//  const path = require('path');
//  const expressValidator = require('express-validator');
//  const expressStatusMonitor = require('express-status-monitor');
//  const sass = require('node-sass-middleware');
//  const cors = require('cors');
 
 /**
  * Load environment variables from .env file, where API keys and passwords are configured.
  */
//  dotenv.load({ path: '.env' });
 
 /**
  * Controllers (route handlers).
  */
//  import { postNotification } from './server.js';
 const serv = require('./server.js');
 const postNotification = serv.postNotification;
 
 /**
  * Create Express server.
  */
 const app = express();
 const router = express.Router();
 
 /**
  * Express configuration.
  */
 app.set('host', '0.0.0.0');
 app.set('port', 8080);
 app.use(express.json());
//  app.set('views', path.join(__dirname, 'views'));
//  app.set('view engine', 'pug');
//  app.use(cors());
//  app.use(expressStatusMonitor());
//  app.use(compression());
//  app.use(sass({
//    src: path.join(__dirname, 'public'),
//    dest: path.join(__dirname, 'public')
//  }));
//  app.use(logger('dev'));
//  app.use(bodyParser.json());
//  app.use(bodyParser.urlencoded({ extended: true }));
//  app.use(expressValidator());
 
//  app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
 
 
 /**
  * API examples routes.
  */
app.get('/', (req, resp) => {
  console.log('contacted the server.');
  resp.send({'some': 'json'});
});

//should be changed to post lmao
// each query parameter is separated with a /:
 app.get('/sendPush/:uid/:location1/:location2', (req, resp) => {
   console.log('initial reach');
   postNotification(req, resp)
  });
 
 /**
  * Error Handler.
  */
//  app.use(errorHandler());
 
 /**
  * Start Express server.
  */
 app.listen(app.get('port'), () => {
  var os = require('os');
  var networkInterfaces = os.networkInterfaces;
  console.log(networkInterfaces());
   console.log('App is running at http://localhost:%s', app.get('port'));
   console.log('  Press CTRL-C to stop\n');
 });
 
module.exports = router;

//  export default app;