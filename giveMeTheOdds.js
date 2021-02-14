const calcOdds = require('./utils/calcOdds');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

export function giveMeTheOdds(args) {
  const configFile = args[2];
  const empireFile = args[3];

  if(!configFile || !empireFile) {
    console.log("File(s) not found.");
  }
  else {
    fs.readFile(empireFile, 'utf8', (err, dataEmpire) => {
      if (err) {
        console.log("No empire file found");
      }else {
        let empireData = JSON.parse(dataEmpire);

        const countdown = empireData.countdown;
        const bountyHuntersOccurances = empireData.bounty_hunters;

        fs.readFile(configFile, 'utf8', (err,dataConfig) => {
          if (err) {
            console.log("No config file found");
          }
          else {
            let configData = JSON.parse(dataConfig);

            const autonomy = configData.autonomy;
            const departure = configData.departure;
            const arrival = configData.arrival;
            const dbRoute = configData.routes_db;

            let db = new sqlite3.Database(dbRoute, (err) => {
              if (err) {
                console.log("DB not found.");
              }
            });

            db && db.all("SELECT * FROM ROUTES", [], (err, rows) => {
              if (err) {
                console.log(err);
              }

              const edges = rows.map(row => {
                return {
                  origin: row.origin,
                  destination: row.destination,
                  travelTime: row.travel_time
                }
              })

              let odds = calcOdds(
                autonomy,
                departure,
                arrival,
                edges,
                countdown,
                bountyHuntersOccurances
              );

              console.log(odds);
            });
          }
        })
      }
    });
  }
}
