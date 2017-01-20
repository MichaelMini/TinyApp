var express = require("express");
var app = express();
app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080

var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(function(req, res, next){
  res.locals.user = users[req.cookies.user_id];
  next();
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {};

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
  let longURL = urlDatabase[shortURL];
  console.log(longURL);
  // search urlDatabase and find longURL with shortURL as the key
  // let longURL = ...
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
	const longURL = req.body.longURL;
	const shortURL = generateRandomString(6);
	urlDatabase[shortURL] = longURL;

	res.redirect('/urls');
  // console.log(req.body);  // debug statement to see POST parameters
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, foo: 123123 };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
	const shortURL = req.params.shortURL;
  let templateVars = { username: req.cookies["username"], shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
	const shortURL = req.params.shortURL;
	const longURL = req.body.longURL;
	urlDatabase[shortURL] = longURL;

	res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Delete
app.post('/urls/:shortURL/delete', (req, res) => {
	delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Set Cookie Username
app.post('/login', (req, res) => {
	res.cookie("username", req.body.username);
	res.redirect('/urls');
});

// Clear Cookie Logout
app.post('/logout', (req, res) => {
	res.clearCookie("username", req.body.username);
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
	users[id] = {'id': id, 'email': req.body.email, 'password': req.body.password};
	res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});