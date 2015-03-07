# EveSystemCorrelation

Node.js application that gathers queryable kill and jump data sourced from Eve's API. Uses the static data provided by CCP to resolve IDs. 

```
Online Players: 26391
Deadly system: 6X7-JO (-0.07) [kills=41+42] [npc=0] [jumps=386]
Deadly system: 36N-HZ (-0.06) [kills=39+38] [npc=0] [jumps=274]
Deadly system: MTO2-2 (-1.00) [kills=39+27] [npc=3] [jumps=77]
Active low/null system: XM-4L0 (-0.68) [kills=0+0] [npc=1188] [jumps=23]
Active low/null system: 30-D5G (-0.95) [kills=0+0] [npc=1100] [jumps=8]
Active low/null system: Y-ZXIO (-0.90) [kills=0+0] [npc=1059] [jumps=4]
low/null pods: 6X7-JO (-0.07) [kills=41+42] [npc=0] [jumps=386]
low/null pods: 36N-HZ (-0.06) [kills=39+38] [npc=0] [jumps=274]
low/null pods: MTO2-2 (-1.00) [kills=39+27] [npc=3] [jumps=77]
Griefing (highsec only): Jita (0.95) [kills=25+20] [npc=88] [jumps=2278]
Griefing (highsec only): Amarr (1.00) [kills=18+14] [npc=541] [jumps=2054]
Griefing (highsec only): Uedama (0.51) [kills=6+4] [npc=283] [jumps=1482]
Active system: Inaya (0.55) [kills=12+1] [npc=2608] [jumps=255]
Active system: Avyuh (0.57) [kills=0+0] [npc=2600] [jumps=439]
Active system: Nakugard (0.52) [kills=1+0] [npc=2599] [jumps=585]
Most traveled: Jita (0.95) [kills=25+20] [npc=88] [jumps=2278]
Most traveled: Perimeter (0.95) [kills=7+1] [npc=292] [jumps=2157]
Most traveled: Amarr (1.00) [kills=18+14] [npc=541] [jumps=2054]
kills/jump: 4O-ZRI (-0.75) [kills=1+1] [npc=0] [jumps=1]
kills/jump: Y-BIPM (-0.25) [kills=1+0] [npc=0] [jumps=1]
kills/jump: T-AKQZ (-0.70) [kills=0+1] [npc=61] [jumps=1]
kills/jump: 08S-39 (-0.85) [kills=1+0] [npc=274] [jumps=1]
```

## Installation
1. Install node.js
2. Download the static data from https://developers.eveonline.com/resource/static-data-export
3. Run `npm install` in EveSystemCorrelation directory
4. Run application with `node index.js`

## Configuration
Config.js provides toggles for the various import steps.
```
module.exports.run = {
    StaticImport: true,
    OnlineImport: true,
    KillImport: true,
    JumpImport: true,
    Queries: true
};
```

**It is recommended to change `StaticImport` to `false` after first run.**

## Queries
Run SQL queries in the `queries.js` file. The data table schema is:
```
-----------
SolarStats
------------
solarSystemID INTEGER,
solarSystemName TEXT,
security REAL,
jumps INT,
shipkills INT,
podkills INT,
npckills INT
```

There is also a simple key-value table that stores the online player count.

A simple query to find the Null-Sec system with the most kills would be:
`SELECT solarSystemName, security, jumps, shipkills, podkills, npckills, (shipkills+podkills) as total FROM SolarStats WHERE security < 0.05 ORDER BY total DESC LIMIT 1`
