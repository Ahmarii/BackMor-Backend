const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs')
const path = require('path')
const router = require('./Routes/routes.js')
const session = require('express-session')
const passport = require('passport')


const app = express();
const stores = new session.MemoryStore();

app.use(session({
    secret: 'cpre88',
    cookie: {maxAge: 30000000},
    resave: false,
    saveUninitialized: true,
    store: stores
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'view'))

app.use('/', router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;