#!/usr/bin/env node

const https = require("https");
const fs = require("fs");

const { commands } = require("./constants");
const { errorLog, getRandomJoke } = require("./helpers");

const searchTerm = (term, jokesData) => {
  if (term) {
    const req = https
      .request(
        {
          hostname: "icanhazdadjoke.com",
          port: 443,
          path: `/search?term=${term}`,
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
                jokesData.jokes.push(randomJoke);
                fs.writeFile(
                  "./jokes.json",
                  JSON.stringify(jokesData),
                  errorLog
                );
              } else {
                console.log("No jokes were found for your search term");
              }
            });
        }
      )
      .on("error", errorLog);
    req.end();
  } else {
    console.log("term is required for search");
  }
};

const findLeaderBoard = ({ jokes }) => {
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
  const jokesData = fs.existsSync("./jokes.json")
    ? JSON.parse(fs.readFileSync("./jokes.json"))
    : { jokes: [] };

  const args = process.argv.slice(2);
  const commandName = args[0];
  const argument = args[1];

  switch (commandName) {
    case commands.LEADER_BOARD:
      findLeaderBoard(jokesData);
      break;
    case commands.SEARCH_TEARM:
      searchTerm(argument, jokesData);
      break;
    default:
      console.log(`command ${commandName} is not exists`);
      break;
  }
};

initApp();
