const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const LocalStragety = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

const User = require('./models/user');

mongoose.connect('mongodb://localhost/auth_demo_app', { useNewUrlParser: true });

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	require('express-session')({
		secret: 'Rusty is the best and cutest dog in the world', // secret used for encryption
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStragety(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==============
// ROUTES
// ==============

app.get('/', (req, res) => {
	res.render('home');
});

app.get('/secret', isLoggedIn, (req, res) => {
	res.render('secret');
});

// Auth Routes

app.get('/register', (req, res) => {
	res.render('register');
});

app.post('/register', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	User.register(new User({ username: username }), password, (err, user) => {
		if (err) {
			console.log(err);
			return res.render('register');
		} else {
			passport.authenticate('local')(req, res, () => {
				res.redirect('/secret');
			});
		}
	});
});

// LOGIN ROUTES
// render login form
app.get('/login', (req, res) => {
	res.render('login');
});

//login logic
// middleware -- runs before the callback of route
app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/secret',
		failureRedirect: '/login'
	}),
	(req, res) => {}
);

app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`);
});

//Run app, then load http://localhost:port in a browser to see the output.
