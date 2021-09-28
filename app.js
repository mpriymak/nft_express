var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var livereload = require('livereload');
var connectLivereload = require('connect-livereload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const publicDirectory = path.join(__dirname, 'public');

var liveReloadServer = livereload.createServer();
liveReloadServer.watch(publicDirectory);
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

var app = express();
app.use(connectLivereload());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(publicDirectory));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log("Starting server");





const algosdk=require('algosdk');

// const { MyAlgoWallet } = require('@randlabs/myalgo-connect');
// import MyAlgoConnect from '@randlabs/myalgo-connect';
 
// const myAlgoConnect = new myAlgoConnect();

// const accountsSharedByUser = await myAlgoConnect.connect();

const server="https://testnet-algorand.api.purestake.io/ps2";
const port="";
const token={
	"x-api-key": "PkIkrh43cz7AzG1cwNh4Z18AYkTZI9p5aiCn20SI"
};

let client=new algosdk.Algodv2(token,server,port);

let account1Mnemonic = "faith amateur account twist melody erode extra test project quit dress figure swim express random glare jealous screen achieve pave same asset produce about web";
let account2Mnemonic = "impose report into guitar cabbage rather seminar shoot sibling mean satoshi hollow torch critic drip rebel crumble cancel term jungle kiss couple abuse abstract course";
let account3Mnemonic = "umbrella moral marriage milk warm still surge member basic assist defense bracket multiply author despair insect clown cave aware scrap noble vacant blossom about party";

let account1 = algosdk.mnemonicToSecretKey(account1Mnemonic);
let account2 = algosdk.mnemonicToSecretKey(account2Mnemonic);
let account3 = algosdk.mnemonicToSecretKey(account3Mnemonic);

console.log("Account 1 address = " + account1.addr);
console.log("Account 2 address = " + account2.addr);
console.log("Account 3 address = " + account3.addr + '\n');




module.exports = app;
