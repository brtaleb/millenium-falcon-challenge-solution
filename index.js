const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const routes = require('./routes/routes');

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

app.use((req,res) => {
  res.render('error404');
})

app.listen(4200);
