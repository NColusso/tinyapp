const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i ++) {
    randomString += characters[Math.floor(Math.random() * 36)];
  }
  return randomString;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  });

  app.post("/urls/:shortURL/delete", (req, res) => {
    const shortURL = req.params.shortURL
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  });
  
  app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL
    urlDatabase[shortURL] = res.req.body.longURL;
    res.redirect("/urls");
  });

  app.post("/urls", (req, res) => {
    const newShortURL = generateRandomString();
    urlDatabase[newShortURL] = res.req.body.longURL;
    res.redirect(`/urls/${newShortURL}`);
  });
  

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
