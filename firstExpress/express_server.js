const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ['aishwarya'],
}));
app.set("view engine", "ejs");


//this generates a random string that will act as the short URL 'generated' in response
//to a user submitting a long URL

function generateRandomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) {
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  }
  return result;
}


app.use(bodyParser.urlencoded({extended: true}));


// 'database' object containing information about the URLs and the associated User's ID
var urlDatabase = {
    "b2xVn2": {
      id: "b2xVn2",
      longURL: "http://www.lighthouselabs.ca",
      user_id: "userID"
    },
    "9sm5xK": {
      id: "b2xVn2",
      longURL: "http://www.google.com",
      user_id: "user2ID"
    }
};

//'database' object of users who register or log back in to the application

const users = {
  "userID": {
    id: "userID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2ID": {
    id: "user2ID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

//renders registration template
app.get("/register", (req, res) => {
  res.render("register");
});

//Posts to register page
//user submitted email and password are added to users database
//password is hashed
//error generated if email or password fields are empty

app.post("/register",(req, res)=> {
  let email = req.body['email'];
  const password = req.body['password'];
  const hashed_password = bcrypt.hashSync(password, 10);
  let id = generateRandomString(6, "abcdefghijklmnopqrstuvwxyz0123456789");
  users[id] = {
    id,
    email,
    hashed_password
  };

  if(email === '' || password === '') {
    res.status(400).send('ERROR: Please enter a valid email and password');
  }

  req.session.user_id = id;
  res.redirect("/urls");

});

// renders login template -> Goes to login page
app.get("/login", (req, res) => {
  res.render("login");
});

//identify if a user's inputted email matches any emails within the database
function findUserByEmail(email){
  return Object.keys(users).map((key) => users[key]).find((user) => user.email === email)
}

//login permitted ONLY if user inputted email and password match the corresponding database items
// IE: already existing user
//Error generated if inputted email/password doesn't match existing email/password in db


app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = findUserByEmail(email);

  if(!user){
    res.status(403).send('ERROR: Please register your email');
    return;
  }
  if(bcrypt.compareSync(password, user.hashed_password)){
    req.session.user_id = user.id;
  }
  else{
    res.status(403).send('ERROR: Incorrect Password <a href = "/login"><button> Login! </button> </a>');
  return;
  }
  res.redirect("/urls");

});

//ends the cookie session generated during login
//user redirected to login page

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//renders template to submit long URLs to be converted
//Permitted only if logged in, else redirected to login page

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  }
  if(users[req.session.user_id]){
    res.render("urls_new", templateVars);
  }
  else{
    res.redirect("/login");
  }
});

//posts the longURL & corresponding short URL received from user and adds them to db
app.post("/urls", (req, res) => {
  var shortURL = generateRandomString(6, "abcdefghijklmnopqrstuvwxyz0123456789");
  var longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    id: shortURL,
    user_id: req.session.user_id
  };
  console.log(urlDatabase[shortURL]);
  res.redirect("http://localhost:8080/urls/" + shortURL);

});

//redirects user to actual website when input is short URL

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


//function returns the subset of the URL database
//that belongs to only the logged in user

function urlsForUser(user_id){
  var results = {};
  Object.keys(urlDatabase).forEach(function(key){

    if(urlDatabase[key].user_id === user_id){
      results[key] = urlDatabase[key];
    }
  });
  return results;
}

// renders a template of all URLs added and updated by a user
// database is filtered to show only the current user's URLs

app.get("/urls", (req, res) => {

  let filteredDatabase = urlsForUser(req.session.user_id);

  let templateVars = {
    user: users[req.session.user_id],
    urls: filteredDatabase
  };
  res.render("urls_index", templateVars);

});

//renders Update template and the user's short URL and corresponding URL
//ONLY if user logged in is the same as the one who posted a URL to be shortened
//Error generated if user has not logged in, or if user deletes a URL that has a different ID from theirs.

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let templateVars = {shortURL: shortURL,
                    longURL: urlDatabase[shortURL].longURL,
                     user: users[req.session.user_id]

  };

  if(req.session.user_id === undefined){
    res.status(403).send("Please log in to delete urls");
  }else if(urlDatabase[req.params.id] === undefined){
    res.status(404).send("Please log in or register to view URLS");
  }
  else if(urlDatabase[req.params.id].user_id !== req.session.user_id){
    res.status(404).send("You can only edit your URLS");
  }
  else {
    res.render("urls_show", templateVars);
  }
});

//Update request modifies longURL if user session is ongoing
//Error: When user is not logged in and tries to access URL details
//redirects the client back to "/urls".

app.post("/urls/:id", (req, res) => {
  var userId = req.session.user_id;
  var shortURL = req.params.id;
  let longURL = req.body.longURL;

  if(!req.session.user_id){
    res.status(403).send("This URL doesn't belong to you");
  }else{
    urlDatabase[shortURL].longURL = longURL;
  }

  res.redirect("/urls");

});


//removes a url from database
//if it belongs to the user who posted it

app.post("/urls/:id/delete", (req, res) => {

  if(req.session.user_id === undefined){
    res.status(403).send("Please log in to delete urls");
  }else if(urlDatabase[req.params.id] === undefined){
    res.status(404).send("You can only delete your URLS");
  }else if(urlDatabase[req.params.id].user_id !== req.session.user_id){
    res.status(404).send("You can only delete your URLS");
  }
  else {
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls")

});

//root page says 'hello'
app.get("/", (req,res) => {
  res.end('Hello!');
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//application listening on Port 8080 (const PORT declared at top)

app.listen(PORT, function(){
  console.log("Example app listening on port" + PORT);
});



