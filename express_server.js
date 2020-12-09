const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
// generate a random 6 character string - for userIDs and shortURLs
function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i ++) {
    randomString += characters[Math.floor(Math.random() * 36)];
  };
  return randomString;
};
// return username based on userID from users object
function getUsername(userID) {
  for (const user in users) {
    if (user === userID) {
      return users[user].email
    }
  }
};

function checkForUsername(username) {
  for (const user in users) {
    if (users[user].email === username) {
      return true;
    } 
  } 
  return false;
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/urls", (req, res) => {
  const templateVars = { username: getUsername(req.cookies["user_id"]), urls: urlDatabase, users: users };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: getUsername(req.cookies["user_id"]), users: users }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: getUsername(req.cookies["user_id"]), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],users: users };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("register")
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

app.post("/login", (req, res) => {
  res.cookie("username", res.req.body.username)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  // check if username exists or is empty, if true respond with error code
  if (checkForUsername(email) || email === "") {
    res.status(400).send("Error with username - either user exists or no email entered.")
  } else {
    let id = generateRandomString();
    // create object for new user info to be added to users
    let newUserInfo = {id, email, password};
    // add new user to user object
    users[id] = newUserInfo;
    // set cookie with new user ID
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
