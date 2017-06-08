const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.use(cookieParser());
app.set("view engine", "ejs");


function generateRandomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) {
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
}


app.use(bodyParser.urlencoded({extended: true}));



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls/new", (req, res) => {
let templateVars = {

  username: req.cookies["name"]
}

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = generateRandomString(6, "abcdefghijklmnopqrstuvwxyz0123456789");
  var longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  console.log(req.body);
  res.redirect("http://localhost:8080/urls/" + shortURL);

});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


app.get("/urls", (req, res) => {
  let templateVars = {

  username: req.cookies["name"],
  urls: urlDatabase };

  res.render("urls_index", templateVars)
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
 let templateVars = {shortURL: shortURL,
                      longURL: urlDatabase[shortURL],
                      username: req.cookies["name"]

  };
  res.render("urls_show", templateVars)
});

app.post("/urls/:id", (req, res) => {
  var shortURL = generateRandomString(6, "abcdefghijklmnopqrstuvwxyz0123456789");
  var longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  console.log(req.body);
  res.redirect("http://localhost:8080/urls/" + shortURL);

});

app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("name", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("name");
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
   delete urlDatabase[req.params.id];
   res.redirect(`/urls`);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello<b>World</b></body></html>")
});

app.get("/", (req,res) => {
  res.end('Hello!');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, function(){
  console.log("Example app listening on port" + PORT);
});





// <%=Object.values(urls) %>
//<%= Object.keys(urls)&>