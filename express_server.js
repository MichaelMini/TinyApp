var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.post("/urls/:id", (req, res) => {
	const shortURL = req.params.id;
	const longURL = req.body.longURL;
	urlDatabase[shortURL] = longURL;

	res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
	const shortURL = req.params.id;
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Delete
app.post('/urls/:id/delete', (req, res) => {
  	delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});