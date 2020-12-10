// generate a random 6 character string - for userIDs and shortURLs
function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i ++) {
    randomString += characters[Math.floor(Math.random() * 36)];
  }
  return randomString;
}
// return username based on userID from database
function getUsername(userID, database) {
  for (const user in database) {
    if (user === userID) {
      return database[user].email;
    }
  }
}
// check if user exists in database from email
function checkForUsername(username, database) {
  for (const user in database) {
    if (database[user].email === username) {
      return true;
    }
  }
  return false;
}
// return userID from given email
function getUserByEmail(username, database) {
  for (const user in database) {
    if (username === database[user].email) {
      return user;
    }
  } return false;
}
// return only URLs for specific user
function urlsForUser(id, database) {
  const usersURLs = {};
  for (const url in database) {
    if (database[url]["userID"] === id) {
      usersURLs[url] = database[url];
    }
  } return usersURLs;
}

module.exports = {
  generateRandomString,
  getUsername,
  checkForUsername,
  getUserByEmail,
  urlsForUser
};