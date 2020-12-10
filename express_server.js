const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const e = require("express");
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
// check if user exists from email
function checkForUsername(username) {
  for (const user in users) {
    if (users[user].email === username) {
      return true;
    } 
  } 
  return false;
}

function getID(username) {
  for (const user in users) {
    if (username === users[user].email) {
      return user;
    }
  } return false;
};

function checkPassword(id, password) {
  return (users[id].password === password) 
};


const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "b6UTxQ"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "i3BoGr"}
};

const users = {
  "b6UTxQ": {
    id: "b6UTxQ",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "i3BoGr": {
    id: "i3BoGr",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.redirect("urls")
})

app.get("/urls", (req, res) => {
  const templateVars = { username: getUsername(req.cookies["user_id"]), urls: urlDatabase, users };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = { username: getUsername(req.cookies["user_id"]), users };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: getUsername(req.cookies["user_id"]), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"],users: users };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { username: getUsername(req.cookies["user_id"]), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],users: users };
  res.render("register", templateVars)
});

app.get("/login", (req, res) => {
  const templateVars = { username: getUsername(req.cookies["user_id"]), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],users: users };
  res.render("login", templateVars)
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
  let email = res.req.body.email
  let password = res.req.body.password
  // check if there is an ID for given email
  if (getID(email)) {
    // check if passwords match
    if (checkPassword(getID(email), password)) {
      res.cookie("user_id", getID(email))
      res.redirect("/urls");
    } else {
      res.status(403).send("Invalid password")
      console.log("users: ", users[getID(email)].password, "password", password)
    }
  } else {
    res.status(403).send("Invalid username")
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
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
