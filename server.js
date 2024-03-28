const express = require('express');
const routes = require('./routes');
const sequelize = require('./config/connection');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Turn on routes
app.use(routes);

// Turn on connection to db and server
app.listen(PORT, () => {
  sequelize.sync({ force: false }).then(() => {
    console.log('Database synced');
  });
  console.log(`App listening on port ${PORT}!`);
});
