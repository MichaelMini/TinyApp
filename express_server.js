const express = require("express");
const app = express();
app.set("view engine", "ejs");
const PORT = process.env.PORT || 8080; // default port 8080

const bcrypt = require('bcrypt');
// const password = "purple-monkey-dinosaur"; // you will probably this from req.params
let hashed_password = '';
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(function(req, res, next){
	// Makes user useable in ejs files
  res.locals.user = users[req.cookies.user_id];
  // Make req.user avable in routes
  req.user = users[req.cookies.user_id];
  next();
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

let urlDatabase = {
  "b2xVn2": {
  	longUrl: "http://www.lighthouselabs.ca",
  	createdBy: 'uvwxyz'
  },
  "9sm5xK": {
  	longUrl: "http://www.google.com",
  	createdBy: 'abcdefg'
  }
};
let users = {
	'asdfjk': {
		id: 'asdfjk',
		email: "joe@example.com",
		password: "asdf"
	}
};
app.use('/urls*?', (req,res, next) => {
	if (req.user) {
		next();
	} else {
		res.status(404).send('You must <a href="/login">sign in</a>');
	}
});

function generateRandomString( ranLength ) {
  let s = "";
  while( s.length < ranLength && ranLength > 0 ){
      let r = Math.random();
      s+= ( r < 0.1 ? Math.floor(r*100) : String.fromCharCode( Math.floor(r*26) + (r>0.5?97:65) ) );
  }
  return s;
}

app.get("/u/:shortURL", (req, res) => {
	let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longUrl;
  res.redirect(longURL);
});

app.get("/", (req, res) => {
	if (req.user) {
		res.redirect('/urls');
	} else {
		res.redirect('/login');
	}
});

app.get("/urls/new", (req, res) => {
	if (req.cookies.user_id) {
	  res.render("urls_new");
  } else {
  	res.redirect('/urls');
  }
});

app.get("/urls", (req, res) => {
	const userUrls = {};
	for ( let shortURL in urlDatabase ) {
		if (urlDatabase[shortURL].createdBy === req.user.id) {
			userUrls[shortURL] = urlDatabase[shortURL];
		}
	}
  let templateVars = { urls: userUrls, foo: 123123 };
  res.render("urls_index", templateVars);
});


// Block non-user to create link
app.post("/urls", (req, res) => {
	if (req.cookies.user_id) {
		const longURL = req.body.longURL;
		const shortURL = generateRandomString(6);
		urlDatabase[shortURL] = { 'longUrl': longURL, 'createdBy': req.cookies.user_id };
		res.redirect('/urls');
	} else {
		res.redirect('login')
	}
});

app.get("/urls/:shortURL", (req, res) => {
	const shortURL = req.params.shortURL;
  let templateVars = { username: req.cookies["username"], shortURL: shortURL, longURL: urlDatabase[shortURL].longUrl };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = req.body.longURL;
	urlDatabase[shortURL].longUrl = longURL;
	res.redirect('/urls');
});

// Delete
app.post('/urls/:shortURL/delete', (req, res) => {
	delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Clear Cookie Logout
app.post('/logout', (req, res) => {
	res.clearCookie("user_id", req.body.username);
	res.redirect('/urls');
});

// Registration Page
app.get('/register', (req, res) => {
	res.render('users_register');
});

// Registration Handler
app.post('/register', (req, res) => {
	// you will probably this from req.params // Need to know req.params
	hashed_password = bcrypt.hashSync(req.body.password, 10);
	const checkEmail = Object.values(users).some((u) => u.email === req.body.email);
	if (checkEmail || !req.body.email || !req.body.password) {
		res.send('OMG :(... Please <a href="/register">Register </a> a different email and a proper password\n Or you can <a href="/login">Sign-in<a> to your existing account.', 404);
	}
	const id = generateRandomString( 6 );
	res.cookie("user_id", id);
	users[id] = {
		'id': id,
		'email': req.body.email,
		'password': hashed_password
	};
	// const userArr = Object.values(users).find( (u) => u.email === req.body.email );
	res.redirect('/');
});

// Login Page
app.get('/login', (req, res) => {
	res.render('users_login');
});

// Set Cookie Username & Login Handler
app.post('/login', (req, res) => {
	const matchUser = Object.values(users).find( (u) => u.email === req.body.email );// I need to know this
	if (!matchUser || !bcrypt.compareSync(req.body.password, matchUser.password)) {
		res.send('Please <a href="/login">Sign-in</a> with your correct email and password.\n Or you can <a href="/register">Register here</a> for a new account.', 403);
	} else {
		res.cookie("user_id", matchUser.id);
		res.redirect('/');
	}
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});









