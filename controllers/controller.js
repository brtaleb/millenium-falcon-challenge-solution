const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const calcOdds = require('../utils/calcOdds');

const getUploadForm = (req,res) => {
  res.render('uploadForm');
}

const uploadForm = (req,res) => {
  const form = formidable();
  form.uploadDir = path.basename(path.join(__dirname, 'uploads'))

  form.parse(req, (err, fields, file) => {
    if (err) throw err;

    if(file.bouncyHunters.name !== 'empire.json'){
      res.render('errorFile');
    }
    else {
      fs.rename(file.bouncyHunters.path, `uploads/${file.bouncyHunters.name}`, err => {
        if (err) console.log(err);
        res.redirect('/odds');
      });
    }
  });
}

const getOdds = (req,res) => {
  fs.readFile('uploads/empire.json', 'utf8', (err, dataEmpire) => {
    if (err) {
      console.log("No empire file found");
      res.redirect('/')
    }else {
      let empireData = JSON.parse(dataEmpire);

      const countdown = empireData.countdown;
      const bountyHuntersOccurances = empireData.bounty_hunters;

      fs.readFile('config/millenium-falcon.json', 'utf8', (err,dataConfig) => {
        if (err) {
          console.log("No config file found");
          res.redirect('/')
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
              res.redirect('/');
            }
          });

          db.all("SELECT * FROM ROUTES", [], (err, rows) => {
            if (err) {
              console.log(err);
              res.redirect('/');
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

            res.render('oddsResult', {
              odds: odds
            });
          });
        }
      })
    }
  });
}

module.exports = {
  getUploadForm,
  uploadForm,
  getOdds
}
