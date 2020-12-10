const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session")
app.use(cookieSession({
  name: "session",
  keys: ["key"]
}));

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
// return username based on userID from database
function getUsername(userID, database) {
  for (const user in database) {
    if (user === userID) {
      return database[user].email
    }
  }
};
// check if user exists in database from email
function checkForUsername(username, database) {
  for (const user in database) {
    if (database[user].email === username) {
      return true;
    } 
  } 
  return false;
}

function getID(username, database) {
  for (const user in database) {
    if (username === database[user].email) {
      return user;
    }
  } return false;
};

function urlsForUser(id, database) {
  const usersURLs = {};
  for (const url in database) {
    if (database[url]["userID"] === id) {
      usersURLs[url] = database[url];
    }
  } return usersURLs;
}

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "user1"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2"}
};

const users = {
  "user1": {
    id: "user1",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

app.get("/", (req, res) => {
  res.redirect("urls")
})

app.get("/urls", (req, res) => {
  const templateVars = { users, username: getUsername(req.session["user_id"], users), urls: urlsForUser(req.session["user_id"], urlDatabase) };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session["user_id"]) {
    const templateVars = { users, username: getUsername(req.session["user_id"], users) };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Tiny URL does not exist")
  }
  if (req.session["user_id"] && req.session["user_id"] === urlDatabase[shortURL]["userID"]) {
    const templateVars = { users, username: getUsername(req.session["user_id"], users), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"] };
    res.render("urls_show", templateVars);
  } else {
    res.status(401).send("Cannot view - you either do not own this short URL or are not logged in.")
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { users, username: getUsername(req.session["user_id"], users), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("register", templateVars)
});

app.get("/login", (req, res) => {
  const templateVars = { users, username: getUsername(req.session["user_id"], users), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("login", templateVars)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  if (req.session["user_id"] && req.session["user_id"] === urlDatabase[shortURL]["userID"]) {
      delete urlDatabase[shortURL];
      res.redirect("/urls");
  } else {
    res.status(401).send("Cannot delete - you do not own this short URL.")
  }
});
  
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL].longURL = res.req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  const newURL = {longURL: res.req.body.longURL, userID: req.session["user_id"]}
  urlDatabase[newShortURL] = newURL;
  res.redirect(`/urls/${newShortURL}`);
});

app.post("/login", (req, res) => {
  let email = res.req.body.email;
  let password = req.body.password;
  // check if there is an ID for given email and if so that passwords match
  if (getID(email, users) && bcrypt.compareSync(password, users[getID(email, users)].password)) {
    req.session["user_id"] = getID(email, users)
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid username or password")
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  // check if username exists or is empty, if true respond with error code
  if (checkForUsername(email, users) || email === "") {
    res.status(400).send("Error with username - either user exists or no email entered.")
  } else {
    const id = generateRandomString();
    // create object for new user info to be added to users
    let newUserInfo = {id, email, password: hashedPassword};
    // add new user to user object
    users[id] = newUserInfo;
    // set cookie with new user ID
    req.session["user_id"] = id;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
