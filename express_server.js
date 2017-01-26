const cookieSession = require('cookie-session');
const express = require("express");
const app = express();

app.set("view engine", "ejs");
const PORT = process.env.PORT || 3000;

const bcrypt = require('bcrypt');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['123'],
  maxAge: 24 * 60 * 60 * 1000
}))

app.use(function(req, res, next){
  res.locals.user = users[req.session.user_id];
  req.user = users[req.session.user_id];
  next();
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

let urlDatabase = {};
let users = {};

app.use('/urls*?', (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).send('You must <a href="/login">Sign In</a> before you can enter this page. <br><br>Or you can <a href="/register">Register Here</a>');
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

app.get("/", (req, res) => {
  if (req.user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  const userUrls = {};
  for ( let shortURL in urlDatabase ) {
    if (urlDatabase[shortURL].createdBy === req.session.user_id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  let templateVars = { urls: userUrls };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send('This shortURL does not exist.');
    return
  }
  if (urlDatabase[shortURL].createdBy !== req.session.user_id) {
    res.status(403).send('Congratulation! <br><br>Your failure attempt to edit someone\'s url is The Best Joke of the Day so far! <br><br>Please try again to see how long it will take you to break my Superior Code??? <br><br><br>Or perhaps... <br><br>NEVER!!!!!!!!!!!!!!!!!  <br><br><br>LMFAOTICBA... (go check UrbanDictionary!)');
    return
  }
  let templateVars = { username: req.session["username"], shortURL: shortURL, longURL: urlDatabase[shortURL].longUrl };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send('This shortURL does not exist. Please check your short link and type carefully.');
    return
  }
  const longURL = urlDatabase[shortURL].longUrl;
  res.redirect(longURL);
});

// Block non-user to create link
app.post("/urls", (req, res) => {
  if (req.user) {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = { 'longUrl': longURL, 'createdBy': req.session.user_id };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('login')
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send('Your shortURL does not exist.');
    return
  }
  if (urlDatabase[shortURL].createdBy !== req.session.user_id) {
    res.status(403).send('Congratulation! <br><br>Your failure attempt to edit someone\'s url is The Best Joke of the Day so far! <br><br>Please try again to see how long it will take you to break my Superior Code??? <br><br><br>Or perhaps... <br><br>NEVER!!!!!!!!!!!!!!!!!  <br><br><br>LMFAOTICBA... (go check UrbanDictionary!)');
    return
  } else {
	  urlDatabase[shortURL].longUrl = longURL;
	  res.redirect(`/urls/${shortURL}`);
  }
});

// Delete
app.post('/urls/:shortURL/delete', (req, res) => {
	if (urlDatabase[shortURL].createdBy !== req.session.user_id) {
	  res.status(403).send('Congratulation! <br><br>Your failure attempt to edit someone\'s url is The Best Joke of the Day so far! <br><br>Please try again to see how long it will take you to break my Superior Code??? <br><br><br>Or perhaps... <br><br>NEVER!!!!!!!!!!!!!!!!!  <br><br><br>LMFAOTICBA... (go check UrbanDictionary!)');
	  return
	} else {
	  delete urlDatabase[req.params.shortURL]; // line 81
	  res.redirect('/');
	}
});

// Clear Cookie Logout
app.post('/logout', (req, res) => {
  req.session.user_id = '';
  res.redirect('/');
});

// Registration Page
app.get('/register', (req, res) => {
  if (req.user) {
    res.redirect('/');
  }
  res.render('users_register');
});

// Registration Handler
app.post('/register', (req, res) => {
	let hashed_password = '';
  hashed_password = bcrypt.hashSync(req.body.password, 10);
  const checkEmail = Object.values(users).some((u) => u.email === req.body.email);
  if (checkEmail) {
    res.send('Oh no... I think someone just stole your email and registered an account already. <br>Or you may have forgotten that you had already registered with this email. <br><br>Or maybe you are trying to steal someone\'s email... <br><br>Whatever... just <a href="/register">Register </a> with a different email and we are all good. <br><br>You are welcome to <a href="/login">Sign-in<a> to your existing account. Only if you have one already...', 400);
    return
  }
  if (!req.body.email || !req.body.password) {
    res.send('OMG :(... Please Type something... perhaps an real email with at least one digit password. <br><br>Click <a href="/register">Register </a> and try again. <br><br>Or you can <a href="/login">Sign-in<a> to your existing account.', 400);
    return
  }
  const id = generateRandomString( 6 );
  req.session.user_id = id;
  users[id] = {
    'id': id,
    'email': req.body.email,
    'password': hashed_password
  };
  res.redirect('/');
});

// Login Page
app.get('/login', (req, res) => {
  if (req.user) {
    res.redirect('/');
  }
  res.render('users_login');
});

// Set Cookie Username & Login Handler
app.post('/login', (req, res) => {
  const matchUser = Object.values(users).find( (u) => u.email === req.body.email );
  if (!matchUser || !bcrypt.compareSync(req.body.password, matchUser.password)) {
    res.send('Please <a href="/login">Sign-in</a> with your correct email and password.\n Or you can <a href="/register">Register here</a> for a new account.', 401);
    return
  } else {
    req.session.user_id = matchUser.id;
    res.redirect('/');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});









