// scoreboard
// dice {value, wasRolled}
// add classes on dom elements when rendering?
// or create new elements?
// turn state machine: roll0, [roll1, roll2], selectSlot
// create table, store score td for each match
// on render check matches for current dice and current player
window.onload = () => {
  let fullheight = window.innerHeight
  document.documentElement.style.setProperty('--fullheight', `${fullheight}px`)
  runAllTests()
  getDOM(dom)
  makeTable2(dom.scoreboard)
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

let state = freshState(1)

function freshState(playerCount) {
  let ps = []
  for (var i = 0; i < playerCount; i++) ps.push(i)
  let s = {
    currentPlayer: 0,
    playerCount: playerCount,
    dice: [],
    // all following per player
    score: [],
    turnState: TurnState.FirstRoll,
    bonus: [0],
    bonusFlag: [0] // -1 for fail, 1 for success
  }
  rollAll(s)
  s.score = ps.map(_ => [])
  s.bonus = ps.map(_ => 0)
  s.bonusFlag = ps.map(_ => 0)
  return s
}

function advanceTurn(state) {
  state.turnState += 1
  if (state.turnState > TurnState.MAX) nextTurn()
}

function nextTurn(state) {
  state.turnState = TurnState.FirstRoll
  state.currentPlayer = (state.currentPlayer + 1) % state.playerCount
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
  if (state.turnState == TurnState.FirstRoll) return;
  state.dice[n].keep = !state.dice[n].keep
  render(state)
}

ui.selectMatch = (n, pi) => {
  if (state.turnState == TurnState.FirstRoll) return
  if (state.currentPlayer != pi) return
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

ui.reset = () => {
  dom.scoreboard.removeChild(dom.scoreboard.lastChild)
  state = freshState(state.playerCount)
  dom = freshDOM()
  getDOM(dom)
  makeTable2(dom.scoreboard)
  render(state)
}

ui.morePlayers = () => {
  state.playerCount += 1
  ui.reset()
}

ui.lessPlayers = () => {
  state.playerCount = Math.max(1, state.playerCount - 1)
  ui.reset()
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
mk.th = (target, txt) => mk.createIn(target, "th", txt)


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
