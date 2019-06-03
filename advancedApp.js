#!/usr/bin/env node

const https = require("https");
const prompt = require("prompt");
const fs = require("fs");

const { commands } = require("./constants");
const { errorLog, getRandomJoke } = require("./helpers");

const searchTerm = jokesData => {
  prompt.start();
  prompt.get(
    [
      {
        name: "term",
        description: "Enter the term to joke search",
        message: "Term is required",
        required: true
      }
    ],
    (err, result) => {
      if (err) {
        errorLog(err);
      }

      const req = https
        .request(
          {
            hostname: "icanhazdadjoke.com",
            port: 443,
            path: `/search?term=${result.term}`,
            method: "GET",
            protocol: "https:",
            headers: {
              Accept: "application/json"
            }
          },
          res => {
            let data = "";

            res
              .on("data", chunk => {
                data += chunk;
              })
              .on("end", () => {
                const jokes = JSON.parse(data).results;
                if (jokes.length) {
                  const randomJoke = getRandomJoke(jokes);

                  console.log(randomJoke);
                  jokesData.push(randomJoke);
                  fs.writeFile("./jokes.txt", jokesData.join("\n"), errorLog);
                } else {
                  console.log("No jokes were found for your search term");
                }
              });
          }
        )
        .on("error", errorLog);
      req.end();
    }
  );
};

const findLeaderBoard = jokes => {
  if (jokes.length) {
    let maxCount = 0;
    let count = 0;
    let mostPopularJoke;

    for (let i = 0; i < jokes.length; i++) {
      for (let j = i; j < jokes.length; j++) {
        if (jokes[i] === jokes[j]) {
          count++;
        }
        if (maxCount < count) {
          maxCount = count;
          mostPopularJoke = jokes[i];
        }
      }
      count = 0;
    }
    console.log(mostPopularJoke);
  } else {
    console.log("There are no jokes in jokes.json now");
  }
};

const initApp = () => {
  const jokesData = fs.existsSync("./jokes.txt")
    ? fs.readFileSync("./jokes.txt", "utf-8").split("\n")
    : [];

  const args = process.argv.slice(2);
  const commandName = args[0];
  const argument = args[1];

  switch (commandName) {
    case commands.LEADER_BOARD:
      findLeaderBoard(jokesData);
      break;
    case commands.SEARCH_TEARM:
      searchTerm(jokesData);
      break;
    default:
      console.log(`command ${commandName} is not exists`);
      break;
  }
};

initApp();
