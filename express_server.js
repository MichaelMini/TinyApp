var express = require("express");
var app = express();
app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080

var cookieParser = require('cookie-parser');
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

var urlDatabase = {
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
		res.status(404).send('you must <a href="/login">sign in</a>');
	}
});

// app.use((req, res, next) => {
// 	req.user = users[req.session.user_id];
// 	next();
// });

function generateRandomString( ranLength ) {
    var s = "";
    while( s.length < ranLength && ranLength > 0 ){
        var r = Math.random();
        s+= ( r < 0.1 ? Math.floor(r*100) : String.fromCharCode( Math.floor(r*26) + (r>0.5?97:65) ) );
    }
    return s;
}

app.get("/u/:shortURL", (req, res) => {
	let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longUrl;
  console.log('longURL: ', longURL);
  console.log('urlDatabase: ', urlDatabase);
  // search urlDatabase and find longURL with shortURL as the key
  // let longURL = ...
  res.redirect(longURL);
});

app.get("/", (req, res) => {
	if (req.user) {
		res.redirect('/urls');
	} else {
		res.redirect('/login');
	}
  // res.end("Hello! " + req.cookies.user_id);
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
			// console.log('hello');
		}
		// console.log('urlDatabase: ', urlDatabase);
		// console.log('shortURL: ', shortURL);
		// console.log('urlDatabase[shortURL].createdBy: ', urlDatabase[shortURL].createdBy);
		// console.log('req.user.id: ', req.user.id);
	}
  let templateVars = { urls: userUrls, foo: 123123 };
  res.render("urls_index", templateVars);
});


// Block non-user to create link
app.post("/urls", (req, res) => {
	if (req.cookies.user_id) {
		const longURL = req.body.longURL;
		// const shortURL = generateRandomString(6);
		const shortURL = generateRandomString(6);
		urlDatabase[shortURL] = { 'longUrl': longURL, 'createdBy': req.cookies.user_id };
		// console.log(urlDatabase);

		res.redirect('/urls');
	} else {
		res.redirect('login')
	}
  // console.log(req.body);  // debug statement to see POST parameters
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => {
	const shortURL = req.params.shortURL;
  console.log('urlDatabase: ', urlDatabase);
  console.log('shortURL: ', shortURL);
  console.log('shortKey: ', urlDatabase[shortURL]);
  let templateVars = { username: req.cookies["username"], shortURL: shortURL, longURL: urlDatabase[shortURL].longUrl };
  // console.log('longUrl: ', longUrl);
  // console.log('longURL: ' longURL);
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = req.body.longURL;
	urlDatabase[shortURL].longUrl = longURL;
	res.redirect('/urls');
});
console.log(urlDatabase);

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
	const checkEmail = Object.values(users).some((u) => u.email === req.body.email);
	if (checkEmail || !req.body.email || !req.body.password) {
		res.send('OMG :(', 404);
	}
	const id = generateRandomString( 6 );
	res.cookie("user_id", id);
	users[id] = {
		'id': id,
		'email': req.body.email,
		'password': req.body.password
	};
	const userArr = Object.values(users).find( (u) => u.email === req.body.email );

	console.log('users:', users);
	console.log('userArr:', userArr);
	res.redirect('/');
});

// Login Page
app.get('/login', (req, res) => {
	res.render('users_login');
});

// Set Cookie Username & Login Handler
app.post('/login', (req, res) => {
	const matchUser = Object.values(users).find( (u) => u.email === req.body.email );
	if (!matchUser || matchUser.password !== req.body.password) {
		res.send('OMG :(', 403);
	} else {
		res.cookie("user_id", matchUser.id);
		res.redirect('/');
	}
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});










