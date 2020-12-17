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
  makeTable2(dom.scoreboard)
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
  playerCount: 4,
  dice: [],
  score: [
    [],
    [],
    [],
    []
  ], // per player
  turnState: TurnState.FirstRoll,
  bonus: [0, 0, 0, 0],
  bonusFlag: [0, 0, 0, 0] // -1 for fail, 1 for success
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

ui.selectMatch = (n, pi) => {
  if (state.turnState == TurnState.FirstRoll) return
  let match = dom.matches[pi][n]
  if (match.done) return
  match.done = true
  state.score[pi][n] = matches[n].fn(diceValues(state))
  if (state.bonusFlag[pi] == 0) {
    if (state.score[pi].slice(0, 6).filter(x => x == 0).length > 0) {
      state.bonusFlag[pi] = -1
    }
    if (state.score[pi].slice(0, 6).filter(x => x > 0).length == 6) {
      state.bonusFlag[pi] = 1
      state.bonus[pi] = 35
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
  bonus: [],
  sumTop: [],
  sumBottom: [],
  sum: []
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
  for (var pi = 0; pi < state.playerCount; pi++) {
    for (var m = 0; m < dom.matches[pi].length; m++) {
      let match = dom.matches[pi][m].element,
        oldScore = state.score[pi][m],
        score = (oldScore == undefined) ? matches[m].fn(diceValues(state)) : oldScore
      if (score == 0) {
        match.className = "zero"
      } else {
        match.className = "ok"
      }
      if (dom.matches[pi][m].done) {
        addClass(match, "done")
      }
      match.textContent = score
      if (state.turnState == TurnState.FirstRoll && !dom.matches[pi][m].done) {
        match.textContent = ""
        match.className = ""
      }
    }
    if (state.bonusFlag[pi] > 0) {
      dom.bonus[pi].textContent = state.bonus[pi]
      dom.bonus[pi].className = "ok done"
    }
    if (state.bonusFlag[pi] < 0) {
      dom.bonus[pi].textContent = state.bonus[pi]
      dom.bonus[pi].className = "zero done"
    }
    dom.sumTop[pi].textContent = state.score[pi].slice(0, 6).filter(identity).reduce(sum, 0) + state.bonus[pi]
    dom.sumBottom[pi].textContent = state.score[pi].slice(6).filter(identity).reduce(sum, 0)
    dom.sum[pi].textContent = state.score[pi].filter(identity).reduce(sum, 0) + state.bonus[pi]
  }
}

function makeTable2(parent) {
  let table = mk.table()
  let trs = []
  trs.push("Kategorie")
  for (var i = 0; i < 6; i++) trs.push(matches[i].label)
  trs.push("Bonus", "Summe Oben")
  for (var i = 6; i < matches.length; i++) trs.push(matches[i].label)
  trs.push("Summe Unten", "Summe")
  let players = [],
    tds = []
  for (var i = 0; i < state.playerCount; i++) players.push(i)
  // make [] of all rows
  // then make [] of all match functions
  // then zip it up
  players.forEach((_, pi) => {
    dom.bonus[pi] = {}
    dom.sumTop[pi] = {}
    dom.sumBottom[pi] = {}
    dom.sum[pi] = {}
    dom.matches[pi] = matches.map(_ => {})
    let td = []
    td.push((tr) => mk.td(tr, `Spieler ${pi}`))
    for (var m1 = 0; m1 < 6; m1++) mishMatch(td, m1, pi)
    td.push((tr) => dom.bonus[pi] = mk.td(tr, 0))
    td.push((tr) => dom.sumTop[pi] = mk.td(tr, 0))
    for (var m2 = 6; m2 < matches.length; m2++) mishMatch(td, m2, pi)
    td.push((tr) => dom.sumBottom[pi] = mk.td(tr, 0))
    td.push((tr) => dom.sum[pi] = mk.td(tr, 0))
    tds.push(td)
  })
  trs.forEach((row, i) => {
    let tr = mk.tr(table)
    mk.td(tr, row)
    players.forEach((player, j) => {
      tds[j][i](tr)
    })
  })
  parent.appendChild(table)
}

function mishMatch(td, mi, pi) {
  td.push((tr) => {
    let m = mk.td(tr, "UwU")
    m.addEventListener("click", () => ui.selectMatch(mi, pi))
    dom.matches[pi][mi] = {
      element: m,
      done: false
    }
  })
}

// function makeTd2(parent, txt) {
//   let dom = mk.td(parent, txt)
//   return
// }

// function makeTable(parent) {
//   let table = mk.table()
//   let tr = mk.tr(table)
//   mk.td(tr, "Kategorie")
//   for (var i = 0; i < state.playerCount; i++) {
//     mk.td(tr, `Spieler ${i}`)
//   }
//   for (var i = 0; i < 6; i++) { // first 6 matches (top)
//     makeMatch(table, matches[i], i)
//   }
//   tr = mk.tr(table)
//   mk.td(tr, "Bonus")
//   dom.bonus = mk.td(tr, 0)
//   tr = mk.tr(table)
//   mk.td(tr, "Summe Oben")
//   dom.sumTop = mk.td(tr, 0)
//   for (var i = 6; i < matches.length; i++) { // rest of matches (bottom)
//     makeMatch(table, matches[i], i)
//   }
//   tr = mk.tr(table)
//   mk.td(tr, "Summe Unten")
//   dom.sumBottom = mk.td(tr, 0)
//   tr = mk.tr(table)
//   mk.td(tr, "Summe")
//   dom.sum = mk.td(tr, 0)
//   parent.appendChild(table)
// }
//
// function makeMatch(parent, match, n) {
//   tr = mk.tr(parent)
//   mk.td(tr, match.label)
//   let m = mk.td(tr, "-_-")
//   m.addEventListener("click", () => ui.selectMatch(n))
//   dom.matches.push({
//     element: m,
//     done: false,
//   })
// }

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
