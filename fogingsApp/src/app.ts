var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

app.use(favicon(path.join(__dirname, 'httpdocs', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'httpdocs')));

const nm_dependencies = ['three', 'lil-gui', 'jquery', 'es-module-shims',]; // keep adding required node_modules to this array.
nm_dependencies.forEach(dep => {
  app.use(`/scripts/${dep}`, express.static(path.resolve(`node_modules/${dep}`)));
});

module.exports = app;
