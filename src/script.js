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

let TurnState = {
  FirstRoll: 0,
  SecondRoll: 1,
  ThirdRoll: 2,
  MatchSelect: 3,
  MAX: 3
}

let state = {
  currentPlayer: 0,
  playerCount: 1,
  dice: [],
  score: [], // per player
  turnState: TurnState.FirstRoll,
  bonus: 0,
  bonusFlag: 0 // -1 for fail, 1 for success
}

function advanceTurn(state) {
  state.turnState += 1
  if (state.turnState > TurnState.MAX) nextTurn()
}

function nextTurn(state) {
  state.turnState = TurnState.FirstRoll
}

function unkeep(state) {
  state.dice.forEach((item, i) => {
    item.keep = false
  })
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


//  ██    ██ ██ 
//  ██    ██ ██ 
//  ██    ██ ██ 
//  ██    ██ ██ 
//   ██████  ██ 


let ui = {}

ui.reroll = () => {
  if (state.turnState == TurnState.MatchSelect) return
  advanceTurn(state)
  rollAll(state)
  render(state)
}

ui.keep = (n) => {
  state.dice[n].keep = !state.dice[n].keep
  render(state)
}

ui.selectMatch = (n) => {
  if (state.turnState == TurnState.FirstRoll) return
  let match = dom.matches[n]
  if (match.done) return
  match.done = true
  state.score[n] = matches[n].fn(diceValues(state))
  if (state.bonusFlag == 0) {
    if (state.score.slice(0, 6).filter(x => x == 0).length > 0) {
      state.bonusFlag = -1
    }
    if (state.score.slice(0, 6).filter(x => x > 0).length == 6) {
      state.bonusFlag = 1
      state.bonus = 35
    }
  }
  unkeep(state)
  nextTurn(state)
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
  sumTop: {},
  sumBottom: {},
  sum: {}
}

function getDOM(dom) {
  dom.dices = document.getElementsByClassName('dice')
  dom.rollButton = document.getElementById('reroll')
  dom.scoreboard = document.getElementById('scoreboard')
}

function render(state) {
  dom.rollButton.className = (state.turnState == TurnState.MatchSelect) ? "inactive" : ""
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
      // continue
    }
    match.textContent = score
    if (state.turnState == TurnState.FirstRoll && !dom.matches[m].done) {
      match.textContent = ""
      match.className = ""
    }
  }
  if (state.bonusFlag > 0) {
    dom.bonus.textContent = state.bonus
    dom.bonus.className = "ok done"
  }
  if (state.bonusFlag < 0) {
    dom.bonus.textContent = state.bonus
    dom.bonus.className = "zero done"
  }
  dom.sumTop.textContent = state.score.slice(0, 6).filter(identity).reduce(sum, 0) + state.bonus
  dom.sumBottom.textContent = state.score.slice(6).filter(identity).reduce(sum, 0)
  dom.sum.textContent = state.score.filter(identity).reduce(sum,0) + state.bonus
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
  tr = mk.tr(table)
  mk.td(tr, "Summe Oben")
  dom.sumTop = mk.td(tr, 0)
  for (var i = 6; i < matches.length; i++) { // rest of matches (bottom)
    makeMatch(table, matches[i], i)
  }
  tr = mk.tr(table)
  mk.td(tr, "Summe Unten")
  dom.sumBottom = mk.td(tr, 0)
  tr = mk.tr(table)
  mk.td(tr, "Summe")
  dom.sum = mk.td(tr, 0)
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

function sum(a, b) {
  return a + b
}

function identity(x) {
  return x
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
  let f = filterScore(1)
  if (f([1, 2, 3]) != 1 ||
    f([1, 1, 1]) != 3 ||
    f([0, 2, 3]) != 0) {
    console.error("filterScore fails")
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
