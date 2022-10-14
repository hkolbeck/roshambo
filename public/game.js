const forceDirections = {
  "🪨": {
    "🪨": 0,
    "✂️": -1,
    "📜": 1,
  },
  "✂️": {
    "🪨": 1,
    "✂️": 0,
    "📜": -1,
  },
  "📜": {
    "🪨": -1,
    "✂️": 1,
    "📜": 0,
  },
};
const forceMult = 5;
const maxVelocity = 1;
const playerCount = 100;

const stepsToRestart = 100;
let restartIn = stepsToRestart;

let players = [];
if (typeof window === "undefined") {
  players = initialState(playerCount);
}

function initialState(playerCount) {
  const arr = new Array(playerCount);

  function randPlayer() {
    const rand = Math.random();
    if (rand < 0.33333333) {
      return "🪨";
    } else if (rand < 0.66666666) {
      return "📜";
    } else {
      return "✂️";
    }
  }

  for (let i = 0; i < playerCount; i++) {
    arr[i] = {
      xPos: Math.random() * 600,
      yPos: Math.random() * 600,
      xVelocity: Math.random() * 2 - 1,
      yVelocity: Math.random() * 2 - 1,
      player: randPlayer(),
    };
  }

  return arr;
}

function cap(n, max) {
  if (n > max) {
    return max;
  } else if (n < -max) {
    return -max;
  } else {
    return n;
  }
}

function interaction(a, b) {
  let forceDirection = forceDirections[a.player][b.player];

  const xDist = a.xPos - b.xPos;
  const yDist = a.yPos - b.yPos;
  const distSquared = xDist * xDist + yDist * yDist;
  if (forceDirection === 1 && distSquared < 64) {
    a.player = b.player;
  }

  if (xDist !== 0) {
    a.xVelocity +=
      forceDirection *
      forceMult *
      cap(100.0 / (xDist * distSquared), maxVelocity);
  }

  if (yDist !== 0) {
    a.yVelocity +=
      forceDirection *
      forceMult *
      cap(100.0 / (yDist * distSquared), maxVelocity);
  }
}

let scoreReturned = false;
function serverStep() {
  if (restartIn <= 0) {
    players = initialState(playerCount);
    restartIn = stepsToRestart;
    scoreReturned = false;
  }

  const scores = step();
  if (!scoreReturned) {
    for (let [player, score] of Object.entries(scores)) {
      if (score === playerCount) {
        scoreReturned = true;
        return player;
      }
    }
  }

  return null;
}

function step() {
  for (let actedUpon of players) {
    for (let acts of players) {
      interaction(actedUpon, acts);
    }
  }

  let scores = {
    "🪨": 0,
    "✂️": 0,
    "📜": 0,
  };

  for (let player of players) {
    player.xVelocity = cap(player.xVelocity, maxVelocity);
    player.xPos += player.xVelocity;
    if (player.xPos > 600 - 10) {
      player.xPos = 600 - 10;
      player.xVelocity = -player.xVelocity;
    } else if (player.xPos < 0) {
      player.xPos = 0;
      player.xVelocity = -player.xVelocity;
    }

    player.yVelocity = cap(player.yVelocity, maxVelocity);
    player.yPos += player.yVelocity;
    if (player.yPos > 600) {
      player.yPos = 600;
      player.yVelocity = -player.yVelocity;
    } else if (player.yPos < 10) {
      player.yPos = 10;
      player.yVelocity = -player.yVelocity;
    }

    scores[player.player]++;
  }

  if (scores["🪨"] === playerCount) {
    restartIn--;
  } else if (scores["📜"] === playerCount) {
    restartIn--;
  } else if (scores["✂️"] === playerCount) {
    restartIn--;
  }

  return scores;
}

if (typeof window === "undefined") {
  module.exports.step = serverStep;
  module.exports.getPlayers = () => players;
}
