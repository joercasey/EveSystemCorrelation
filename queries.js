
module.exports.run = function (db, cb) {

  db.get("SELECT value FROM ServerStats WHERE key='OnlinePlayers'", 
    function(dberr, row) {
      console.log("Online Players: " + row.value);
    });

  db.each("SELECT solarSystemName, security, jumps, shipkills, podkills, npckills, (shipkills+podkills) as total FROM SolarStats ORDER BY total DESC LIMIT 3",
    function(dberr, row) {
      console.log("Deadly system: " + printStar(row));
    });

  db.each("SELECT solarSystemName, security, jumps, shipkills, podkills, npckills FROM SolarStats ORDER BY npckills DESC LIMIT 3",
    function(dberr, row) {
      console.log("Active system: " + printStar(row));
    });

  db.each("SELECT solarSystemName, security, jumps, shipkills, podkills, npckills FROM SolarStats WHERE security <= 0.45 ORDER BY npckills DESC LIMIT 3",
    function(dberr, row) {
      console.log("Active low/null system: " + printStar(row));
    });

  db.each("SELECT solarSystemName, security, jumps, shipkills, podkills, npckills FROM SolarStats WHERE security > 0.45 ORDER BY podkills DESC LIMIT 3",
    function(dberr, row) {
      console.log("Griefing (highsec only): " + printStar(row));
    });

  db.each("SELECT solarSystemName, security, jumps, shipkills, podkills, npckills FROM SolarStats ORDER BY jumps DESC LIMIT 3",
    function(dberr, row) {
      console.log("Most traveled: " + printStar(row));
    });

  db.each("SELECT solarSystemName, security, jumps, shipkills, podkills, npckills FROM SolarStats WHERE security <= 0.45 ORDER BY podkills DESC LIMIT 3",
    function(dberr, row) {
      console.log("low/null pods: " + printStar(row));
    });

  db.each("SELECT solarSystemName, security, jumps, shipkills, podkills, npckills, ((shipkills+podkills)/jumps) as total FROM SolarStats WHERE total > 0 ORDER BY total DESC LIMIT 10",
    function(dberr, row) {
      console.log("kills/jump: " + printStar(row));
    });

  cb(null, 'queries');
}

function printStar(row) {
    return row.solarSystemName + " (" + row.security.toFixed(2) + ") [kills="+ row.shipkills + "+" + row.podkills+"] [npc="+ row.npckills +"]" + " [jumps="+row.jumps+"]";
  }