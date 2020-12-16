// scoreboard
// dice {value, wasRolled}
// add classes on dom elements when rendering?
// or create new elements?
// turn state machine: roll0, [roll1, roll2], selectSlot
// create table, store score td for each match
// on render check matches for current dice and current player
window.onload = () => {
  runAllTests()
  getDOM(dom)
  makeTable(dom.scoreboard)
  rollAll(state)
  render(state)
}

//  ███████ ████████  █████  ████████ ███████ 
//  ██         ██    ██   ██    ██    ██      
//  ███████    ██    ███████    ██    █████ 
//       ██    ██    ██   ██    ██    ██    
//  ███████    ██    ██   ██    ██    ███████ 

let state = {
  currentPlayer: 0,
  playerCount: 1,
  dice: [],
  score: [], // per player
  msg: "reroll"
}

function rollAll(state) {
  let dice = state.dice
  for (let i = 0; i < 5; i++) {
    if (dice[i] && dice[i].keep) continue
    dice[i] = {
      value: Math.ceil(Math.random() * 6),
      lastRolled: true,
      keep: false
    }
  }
  dice.sort((a, b) => a.value - b.value)
  return state
}

function diceValues(state) {
  let values = []
  for (var d = 0; d < state.dice.length; d++) {
    values.push(state.dice[d].value)
  }
  return values
}

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
    label: "Full House TODO",
    fn: multiMatch([0], () => 25) // TODO TODO TODO
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
    fn: multiMatch([0], sumScore())
  },
]

function oneOrMoreOf(n) {
  return singleMatch([n], filterScore_(n))
}

function filterScore_(eq) {
  return actual => actual.filter(n => n == eq).reduce((a, b) => a + b, 0)
}

function sumScore(){
  return actual => actual.reduce((a, b) => a + b, 0)
}

function multiMatch(relativeMatches, score) {
  // instantiate matches for every possible value
  // test all matches against actual
  // return score
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

//  ██    ██ ██ 
//  ██    ██ ██ 
//  ██    ██ ██ 
//  ██    ██ ██ 
//   ██████  ██ 


let ui = {}

ui.reroll = () => {
  rollAll(state)
  render(state)
}

ui.keep = (n) => {
  state.dice[n].keep = !state.dice[n].keep
  render(state)
}

ui.selectMatch = (n) => {
  let match = dom.matches[n]
  if (match.done) return
  match.done = true
  state.score[n] = matches[n].fn(diceValues(state))
  render(state)
}

//  ██████   ██████  ███    ███ 
//  ██   ██ ██    ██ ████  ████ 
//  ██   ██ ██    ██ ██ ████ ██ 
//  ██   ██ ██    ██ ██  ██  ██ 
//  ██████   ██████  ██      ██ 

let dom = {
  dices: [],
  rollButton: {},
  scoreboard: {},
  matches: [],
  bonus: {},
}

function getDOM(dom) {
  dom.dices = document.getElementsByClassName('dice')
  dom.rollButton = document.getElementById('reroll')
  dom.scoreboard = document.getElementById('scoreboard')
}

function render(state) {
  let dices = dom.dices;
  for (var d = 0; d < dices.length; ++d) {
    dices[d].textContent = state.dice[d].value
    dices[d].className = "dice" + (state.dice[d].keep ? " keep" : "")
  }
  for (var m = 0; m < dom.matches.length; m++) {
    let match = dom.matches[m].element,
      oldScore = state.score[m],
      score = (oldScore == undefined) ? matches[m].fn(diceValues(state)) : oldScore
    if (score == 0) {
      match.className = "zero"
    } else {
      match.className = "ok"
    }
    if (dom.matches[m].done) {
      addClass(match, "done")
      continue
    }
    match.textContent = score
  }
  if (state.score.slice(0, 6).filter(x => x > 0).length == 6) {
    dom.bonus.textContent = "35"
    dom.bonus.className = "ok done"
  }
  if (state.score.slice(0, 6).filter(x => x == 0).length > 0) {
    dom.bonus.textContent = "0"
    dom.bonus.className = "zero done"
  }
  // let bonus = 0,
  //   getBonus = true,
  //   failBonus = false
  // for (var i = 0; i < 6; i++) {
  //   if (!dom.matches[i].done) {
  //     getBonus = false
  //     break
  //   }
  //   if (state.score[i] == 0) {
  //     failBonus = true
  //     break
  //   }
  // }
  // if (failBonus) dom.bonus.textContent = "failed"
  // if (!getBonus) dom.bonus.textContent = "..."
  // if (getBonus) dom.bonus.textContent = "35"
  dom.rollButton.textContent = state.msg
}


function makeTable(parent) {
  let table = mk.table()
  let tr = mk.tr(table)
  mk.td(tr, "Spiel")
  mk.td(tr, "Spieler 1")
  for (var i = 0; i < 6; i++) { // first 6 matches (top)
    makeMatch(table, matches[i], i)
  }
  tr = mk.tr(table)
  mk.td(tr, "Bonus")
  dom.bonus = mk.td(tr, 0)
  for (var i = 6; i < matches.length; i++) { // rest of matches (bottom)
    makeMatch(table, matches[i], i)
  }
  parent.appendChild(table)
}

function makeMatch(parent, match, n) {
  tr = mk.tr(parent)
  mk.td(tr, match.label)
  let m = mk.td(tr, "-_-")
  m.addEventListener("click", () => ui.selectMatch(n))
  dom.matches.push({
    element: m,
    done: false,
  })
}

function addClass(dom, className) {
  dom.className = stringAdd(dom.className, className)
  return dom
}

function removeClass(dom, className) {
  dom.className = stringRemove(dom.className, className)
  return dom
}

//  ███    ███  █████  ██   ██ ███████ 
//  ████  ████ ██   ██ ██  ██  ██      
//  ██ ████ ██ ███████ █████   █████ 
//  ██  ██  ██ ██   ██ ██  ██  ██    
//  ██      ██ ██   ██ ██   ██ ███████ 

let mk = {}
mk.create = (elm) => document.createElement(elm)
mk.table = () => mk.create("table")
mk.createIn = (target, elm, txt) => {
  let e = mk.create(elm)
  e.textContent = txt
  target.appendChild(e)
  return e
}
mk.tr = (target) => mk.createIn(target, "tr")
mk.td = (target, txt) => mk.createIn(target, "td", txt)


//  ██    ██ ████████ ██ ██      ███████ 
//  ██    ██    ██    ██ ██      ██      
//  ██    ██    ██    ██ ██      ███████ 
//  ██    ██    ██    ██ ██           ██ 
//   ██████     ██    ██ ███████ ███████ 

function stringAdd(original, additional) {
  let s = original.split(" ")
  s.push(additional)
  return s.join(" ")
}

function stringRemove(original, removal) {
  let s = original.split(" ")
  return s.filter(x => x != removal).join(" ")
}

//  ████████ ███████ ███████ ████████ 
//     ██    ██      ██         ██    
//     ██    █████   ███████    ██ 
//     ██    ██           ██    ██ 
//     ██    ███████ ███████    ██ 

function runAllTests() {
  let sa = stringAdd("foo bar", "baz")
  if (sa != "foo bar baz") {
    console.error("stringAdd fails")
    return
  }
  let sr = stringRemove("foo bar baz", "bar")
  if (sr != "foo baz") {
    console.error("stringRemove fails")
    return
  }
  let m = singleMatch([1, 2, 3], _ => 1)
  if (m([1, 2, 3]) != 1 ||
    m([0, 1, 2, 3, 4]) != 1 ||
    m([2, 3]) != 0 ||
    m([1, 2]) != 0) {
    console.error("singleMatch fails")
    return
  }
  let f = filterScore_(1)
  if (f([1, 2, 3]) != 1 ||
    f([1, 1, 1]) != 3 ||
    f([0, 2, 3]) != 0) {
    console.error("filterScore_ fails")
    return
  }
  let sm = oneOrMoreOf(1)
  if (sm([1, 2, 3]) != 1 ||
    sm([1, 1, 1]) != 3 ||
    sm([2, 3, 4]) != 0) {
    console.error("oneOrMoreOf fails")
    return
  }
  console.log("all tests passed")
}
