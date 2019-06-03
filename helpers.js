const getRandomJoke = jokes =>
  jokes[Math.floor(Math.random() * jokes.length)].joke;

const errorLog = err => err && console.error(err);

module.exports = {
  errorLog,
  getRandomJoke
};
