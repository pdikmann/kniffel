let matches = [{
    label: "Einser",
    fn: oneOrMoreOf(1)
  },
  {
    label: "Zweier",
    fn: oneOrMoreOf(2)
  },
  {
    label: "Dreier",
    fn: oneOrMoreOf(3)
  },
  {
    label: "Vierer",
    fn: oneOrMoreOf(4)
  },
  {
    label: "Fünfer",
    fn: oneOrMoreOf(5)
  },
  {
    label: "Sechser",
    fn: oneOrMoreOf(6)
  },
  {
    label: "Dreierpasch",
    fn: multiMatch([0, 0, 0], sumScore())
  },
  {
    label: "Viererpasch",
    fn: multiMatch([0, 0, 0, 0], sumScore())
  },
  {
    label: "Full House",
    fn: fullHouseMatch(() => 25)
  },
  {
    label: "Kleine Straße",
    fn: multiMatch([0, 1, 2, 3], () => 30)
  },
  {
    label: "Große Straße",
    fn: multiMatch([0, 1, 2, 3, 4], () => 40)
  },
  {
    label: "Kniffel",
    fn: multiMatch([0, 0, 0, 0, 0], () => 50)
  },
  {
    label: "Chance",
    fn: anyMatch(sumScore())
  },
]

function oneOrMoreOf(n) {
  return singleMatch([n], filterScore(n))
}

function filterScore(eq) {
  return actual => actual.filter(n => n == eq).reduce((a, b) => a + b, 0)
}

function sumScore() {
  return actual => actual.reduce((a, b) => a + b, 0)
}

function fullHouseMatch(score) {
  let matches = []
  for (var i = 1; i < 7; i++) {
    for (var j = i + 1; j < 7; j++) {
      matches.push([i, i, j, j, j], [i, i, i, j, j])
    }
  }
  return actual => {
    let matching = matches
      .map(ms => exactMatch(ms, actual))
      .filter(x => x)
      .length > 0
    if (matching) return score(actual)
    else return 0
  }
}

function anyMatch(score) {
  return actual => {
    return score(actual)
  }
}

function multiMatch(relativeMatches, score) {
  let specificMatches = []
  for (var i = 1; i < 7; i++) {
    specificMatches.push(specifyRelativeMatch(relativeMatches, i))
  }
  specificMatches = specificMatches.filter(inRange)
  return actual => {
    let matching = specificMatches
      .map(ms => exactMatch(ms, actual))
      .filter(x => x)
      .length > 0
    if (matching) return score(actual)
    else return 0
  }
}

function inRange(matches) {
  matches.sort()
  if (matches[0] >= 1 &&
    matches.slice(-1) <= 6) return true
  return false
}

function specifyRelativeMatch(relativeMatches, n) {
  let specificMatch = []
  for (var i = 0; i < relativeMatches.length; i++) {
    specificMatch.push(relativeMatches[i] + n)
  }
  return specificMatch
}

function singleMatch(matches, score) {
  return actual => {
    let matching = exactMatch(matches, actual)
    if (matching) return score(actual)
    else return 0
  }
}

function exactMatch(matches, actual) {
  let ms = [...matches]
  let as = [...actual]
  while (ms.length > 0 && as.length > 0) {
    if (ms[0] == as[0]) {
      ms.shift()
      as.shift()
    } else {
      as.shift()
    }
  }
  if (ms.length == 0) return true
  if (as.length == 0) return false
}
