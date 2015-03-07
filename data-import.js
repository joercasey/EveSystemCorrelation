var async = require("async");

exports.ImportStaticData = function(evedb, db, cb) {
  db.serialize(function() {
    db.run("DROP TABLE IF EXISTS SolarStats");
    db.run("DROP TABLE IF EXISTS OnlineCount");

    db.run("CREATE TABLE SolarStats ("
      + "solarSystemID INTEGER, "
      + "solarSystemName TEXT, "
      + "security REAL, "
      + "jumps INT, "
      + "shipkills INT, "
      + "podkills INT, "
      + "npckills INT)");

    db.run("CREATE TABLE ServerStats (key TEXT, value TEXT)");
    db.run("INSERT INTO ServerStats (key,value) VALUES ('OnlinePlayers', '0')");
  });

  console.log("Importing static system data...");
  evedb.each("SELECT solarSystemID, solarSystemName, security FROM mapSolarSystems",
    function(err, row) {
      //console.log(row.solarSystemID + ": " + row.solarSystemName + " (" + row.security + ")");
      db.run("INSERT INTO SolarStats (solarSystemID,solarSystemName,security) "
        + "VALUES ($id, $name, $sec)",
        {
          $id: row.solarSystemID,
          $name: row.solarSystemName,
          $sec: row.security
        });
    },
    function(err, numrows) {
      cb(err, 'static');
    });
}

exports.ImportOnlinePlayers = function(db, cb) {
  var libxmljs = require("libxmljs");
  var request = require("request");
  request("https://api.eveonline.com/server/ServerStatus.xml.aspx", function(err, res, xml) {
    var xmlDoc = libxmljs.parseXml(xml);
    var onlineCount = xmlDoc.get("//onlinePlayers");
    console.log("Updating Online characters: "+onlineCount.text());
    db.run("UPDATE ServerStats SET value=$online WHERE key='OnlinePlayers'", 
      { $online: onlineCount.text() },
      function(err) {
        cb(err, 'online');
      });
  });
}

exports.ImportKillData = function(db, cb) {
  var libxmljs = require("libxmljs");

  console.log("Requesting Kill data...");
  var request = require("request");
  request("https://api.eveonline.com/Map/Kills.xml.aspx", function(err, res, xml) {
    console.log("Parsing kill data.");
    var xmlDoc = libxmljs.parseXml(xml);
    var kills = xmlDoc.find("//row");
    console.log("Updating systems with kill data... "+kills.length);

    async.each(kills, function(kill, callback){
      db.run("UPDATE SolarStats SET shipkills=$shipkills, podkills=$podkills, npckills=$npckills "
        + "WHERE solarSystemID=$id",
        {
          $id: kill.attr("solarSystemID").value(),
          $shipkills: kill.attr("shipKills").value(),
          $podkills: kill.attr("podKills").value(),
          $npckills: kill.attr("factionKills").value()
        },
        function(err) {
          callback(err);
        });
    },
    function(err) {
      if(err) {
        console.log("Error occurred updating kill data.");
        cb(err, 'kills');
      } else {
        console.log("Kill data updated.");
        cb(null, 'kill');
      }
    });
  });
}

exports.ImportJumpData = function(db, cb) {
  var libxmljs = require("libxmljs");

  console.log("Requesting Jump data...");
  var request = require("request");
  request("https://api.eveonline.com/Map/Jumps.xml.aspx", function(err, res, xml) {
    console.log("Parsing Jump data.");
    var xmlDoc = libxmljs.parseXml(xml);
    var jumps = xmlDoc.find("//row");
    console.log("Updating systems with jump data... "+jumps.length);
    
    async.each(jumps,function(jump, callback){
      db.run("UPDATE SolarStats SET jumps=$jumps "
        + "WHERE solarSystemID=$id",
        {
          $id: jump.attr("solarSystemID").value(),
          $jumps: jump.attr("shipJumps").value()
        },
        function(err) {
          callback(err);
        });
    },
    function(err) {
      if(err) {
        console.log("Error occurred updating jump data.");
        cb(err, 'jumps');
      } else {
        console.log("Jump data updated.");
        cb(null, 'jumps');
      }
    });
  });
}