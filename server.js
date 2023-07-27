const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const passport = require('passport');
const GitHubStrategy = require('passport-github2');
const cookieSession = require('cookie-session');

require('dotenv').config();

const PORT = 3000;

const authConfig = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'https://localhost:3000/auth/github/callback'
};

function verifyCallback(accessToken, refreshTocken, profile, done) {
  console.log('Github profile', profile);
  done(null, profile);
}

passport.use(new GitHubStrategy(authConfig, verifyCallback));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, id);
});

const app = express();

app.use(helmet());

app.use(cookieSession({
  name: 'session',
  maxAge: 24* 60 * 60 * 1000,
  keys: [process.env.COOKIE_KEY_1, process.env.COOKIE_KEY_2],
}));
app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIn(req, res, next) {
  console.log('Current user is:', req.user);
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn) {
    return res.status(401).json({
      error: 'You must log in!',
    });
  }
  next();
}

app.use('/auth/github',
  passport.authenticate('github', {
    scope: ['email'],
  })
);

app.use('/auth/github/callback', 
  passport.authenticate('github', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: true,
  }),
  (req, res) => {
    console.log('Github called us back!');
  }
);

app.use('/auth/logout', (req, res) => {
  req.logout();
  return res.redirect('/');
});

app.get('/secret', checkLoggedIn, (req, res) => {
  return res.send('Your personal secret value is 42!')
});

app.get('/failure', (req, res) => {
  return res.send('Failed to login!');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer(
  {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  },
  app
).listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
