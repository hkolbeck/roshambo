const path = require("path");
const fs = require("fs");

const fastify = require("fastify")({
  logger: false,
});

const game = require("./public/game.js");

setInterval(() => {
  const winner = game.step()
  if (winner) {
    const allTime = getAllTime()
    allTime[winner]++
    saveAllTime(allTime)
  }
}, 50);

function getAllTime() {
  let scores;

  try {
    scores = JSON.parse(fs.readFileSync(".data/all_time.js"))
  } catch (e) {
    scores = {
      "🪨": 0,
      "✂️": 0,
      "📜": 0,
    };
  }

  return scores;
}

function saveAllTime(allTime) {
  fs.writeFileSync(".data/all_time.js", JSON.stringify(allTime));
}

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/",
});

fastify.get("/", function (request, reply) {
  reply.sendFile("index.html");
});

fastify.get("/game.js", function (request, reply) {
  reply.sendFile("game.js");
});

fastify.get("/state", function (request, reply) {
  const resp = {
    players: game.getPlayers(),
    all_time: getAllTime(),
  };

  reply.status(200).send(resp);
});

// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
    fastify.log.info(`server listening on ${address}`);
  }
);
