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
  matches: [{}], // per player
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
    label: "einser",
    fn: simpleMatch(1)
  },
  {
    label: "zweier",
    fn: simpleMatch(2)
  }
]

function simpleMatch(n) {
  return match_([n], filterScore_(n))
}

function filterScore_(eq) {
  return actual => actual.filter(n => n == eq).reduce((a, b) => a + b, 0)
}

function match_(matches, score) {
  return actual => {
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
    if (ms.length == 0) return score(actual)
    if (as.length == 0) return 0
  }
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
  match.element.className = "done"
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
  matches: []
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
      score = matches[m].fn(diceValues(state))
    if (dom.matches[m].done) continue
    if (score == 0) {
      match.className = "zero"
    } else {
      match.className = "ok"
    }
    match.textContent = score
  }
  dom.rollButton.textContent = state.msg
}


function makeTable(parent) {
  let table = mk.table()
  let tr = mk.tr(table)
  mk.td(tr, "Spiel")
  mk.td(tr, "Spieler 1")
  for (var i = 0; i < matches.length; i++) {
    tr = mk.tr(table)
    mk.td(tr, matches[i].label)
    let match = mk.td(tr, "-_-"),
      n = i
    match.addEventListener("click", () => ui.selectMatch(n))
    dom.matches.push({
      element: match,
      done: false
    })
  }
  parent.appendChild(table)
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
  let m = match_([1, 2, 3], _ => 1)
  if (m([1, 2, 3]) != 1 ||
    m([0, 1, 2, 3, 4]) != 1 ||
    m([2, 3]) != 0 ||
    m([1, 2]) != 0) {
    console.error("match_ fails")
    return
  }
  let f = filterScore_(1)
  if (f([1, 2, 3]) != 1 ||
    f([1, 1, 1]) != 3 ||
    f([0, 2, 3]) != 0) {
    console.error("filterScore_ fails")
    return
  }
  let sm = simpleMatch(1)
  if (sm([1, 2, 3]) != 1 ||
    sm([1, 1, 1]) != 3 ||
    sm([2, 3, 4]) != 0) {
    console.error("simpleMatch fails")
    return
  }
  console.log("all tests passed")
}
