
// Module to control application life.
const electron = require('electron')
const {app} = electron

const {dialog} = require('electron')
const Store = require('electron-store');
const store = new Store();

var host = "https://v40.pingendo.com";

if (host.startsWith("http://")) 
  var http = require('http');
else 
  var http = require('https');

var win = false
var launch = false

var inject = new Promise(function(resolve) {
  // check in store
  var inject = store.get('main-inject.js')
  if (inject) {
    resolve(inject)
  } 
  
  // fetch
  http.get(host + "/main-inject.js").on('response', function (response) {
    var code = '';
    response.on('data', function (chunk) {
        code += chunk;
    });
    response.on('end', function () {
      store.set('main-inject.js', code)
      resolve(code);
    });
  }).on('error', (e) => {
    if (!inject) {
      dialog.showErrorBox("Error", "Pingendo can't connect to pingendo.com\nPlease, check your internet connection and retry")
      app.quit();
    }
  });

}) 

app.on("ready", function() {
  inject.then(function(code) {
    with (global) {
      eval(code);
    };
  })  
})

// WIN32 
if (process.platform == "win32" && process.argv.length > 1)  {
  launch = process.argv[1]
}
    
// OSX
app.on('open-file', function(ev, path) {
  if (win) 
    win.webContents.send('open-file',path);
  else 
    launch = path;
});

app.on('open-url', function (event, url) {
  if (win) 
    win.webContents.send('open-url',url);
  else 
    launch = url;
})

