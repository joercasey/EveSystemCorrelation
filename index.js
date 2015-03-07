
var config = require('./config');
var dataImport = require('./data-import');
var queries = require('./queries');

var async = require("async");

var fs = require("fs");
var evedbfile = "data/universeDataDx.db";
var dbfile = "data/EveSystemCorrelation.db";

var evedbExists = fs.existsSync(evedbfile);

if(!evedbExists && config.run.StaticImport) {
  console.log("ERROR: Missing static database! Cannot import system information!")
  console.log("Place the universeDataDx.db from https://developers.eveonline.com/resource/static-data-export into the data directory.");
  return;
}

var sqlite3 = require("sqlite3").verbose();
var evedb = new sqlite3.Database(evedbfile);
var db = new sqlite3.Database(dbfile);


console.log("Configuration: ");
console.log(config.run);

async.series([
    //Static data import
    function(cb) { 
      if(config.run.StaticImport) 
        dataImport.ImportStaticData(evedb, db, cb); 
      else
        cb(null);
    },
    //API data import
    function(callback) {
      async.parallel([
        //online players
        function(cb) { 
          if(config.run.OnlineImport) 
            dataImport.ImportOnlinePlayers(db, cb); 
          else 
            cb(null); 
        },
        //kill stats
        function(cb) { 
          if(config.run.KillImport) 
            dataImport.ImportKillData(db, cb); 
          else
            cb(null);
        },
        //jump stats
        function(cb) { 
          if(config.run.JumpImport) 
            dataImport.ImportJumpData(db, cb); 
          else
            cb(null);
        }
      ],
      //error callback for API data import 
      function(err, results) {
        if(err) {
          console.log("Stopped.");
          callback(err, 'api import');
        } else {
          callback(null, 'api import');
        }
      });
    },
    //queries
    function(cb) { 
      if(config.run.Queries) 
        queries.run(db, cb);
      else
        cb(null);
    }
  ],
  function(err, results) {

  });




            

