/**
 * Module dependencies.
 */
 import express from 'express';
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
 const apiController = require('./server.ts');
 
 /**
  * Create Express server.
  */
 const app = express();
 
 /**
  * Express configuration.
  */
 app.set('host', '0.0.0.0');
 app.set('port', 8080);
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
//  app.post('/user', apiController.postUser);
 app.post('/api/notification/:uid:location1:location2', apiController.postNotification);
 
 /**
  * Error Handler.
  */
//  app.use(errorHandler());
 
 /**
  * Start Express server.
  */
 app.listen(app.get('port'), () => {
   console.log('%s App is running at http://localhost:%d in %s mode', app.get('port'), app.get('env'));
   console.log('  Press CTRL-C to stop\n');
 });
 
 module.exports = app;