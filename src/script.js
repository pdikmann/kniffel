// scoreboard
// dice {value, wasRolled}
// add classes on dom elements when rendering?
// or create new elements?
// turn state machine: roll0, [roll1, roll2], selectSlot
// create table, store score td for each match
// on render check matches for current dice and current player
let animationDuration = 450
window.onload = () => {
  runAllTests()
  // testFilePut()
  setCssVariables()
  cloneDice()
  getDOM(dom)
  makeTable2(dom.scoreboard)
  render(state)
  removeClass(document.getElementById('wrapper'), 'hidden')
}

function setCssVariables() {
  let fullheight = window.innerHeight,
    fullwidth = Math.min(window.innerWidth, 375),
    unit = Math.min(fullheight, fullwidth) / 13,
    tableMargin = 2 * (unit / 2),
    trMargin = unit / 8,
    rowHead = unit,
    rowHeight = unit * 1.5,
    tableContentHeight = tableMargin + rowHead + 17 * (rowHeight + trMargin), //unit * 29.625,
    topContentHeight = unit * 4.5,
    bottomWrapperHeight = Math.min(fullheight - topContentHeight, tableContentHeight)
  document.documentElement.style.setProperty('--bottom-wrapper-height', `${bottomWrapperHeight}px`)
  document.documentElement.style.setProperty('--animation-duration', `${animationDuration}ms`)
}

function cloneDice() {
  let originalDice = document.getElementsByClassName('dice')[0]
  for (var i = 1; i < 5; i++) {
    let cloneDice = originalDice.cloneNode(true),
      n = i
    cloneDice.addEventListener('click', () => ui.keep(n))
    document.getElementById('dices').appendChild(cloneDice)
  }
  originalDice.addEventListener('click', () => ui.keep(0))
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
  let s = {
    currentPlayer: 0,
    playerCount: playerCount,
    dice: [],
    rolling: false,
    gameOver: false,
    turnState: TurnState.FirstRoll,
    // online features
    joinable: true,
    // all following per player
    score: [],
    bonus: [0],
    bonusFlag: [0], // -1 for fail, 1 for success
  }
  s = freshPlayerVars(s, playerCount)
  rollAll(s)
  return s
}

function freshPlayerVars(state, playerCount) {
  let ps = []
  for (var i = 0; i < playerCount; i++) ps.push(i)
  let s = {
    ...state,
    playerCount: playerCount
  }
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
  if (state.currentPlayer == 0 && state.score[0].filter(notUndefined).length == 13) {
    state.gameOver = true
  }
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
      keep: false
    }
  }
  // dice.sort((a, b) => a.value - b.value)
  return state
}

function diceValues(state) {
  let values = []
  for (var d = 0; d < state.dice.length; d++) {
    values.push(state.dice[d].value)
  }
  values.sort()
  return values
}

function softReset() {
  state = freshPlayerVars(state, state.playerCount)
}


function hardReset() {
  state = freshState(state.playerCount)
  domReset()
}

function domReset() {
  dom.scoreboard.removeChild(dom.scoreboard.lastChild)
  dom = freshDOM()
  getDOM(dom)
  makeTable2(dom.scoreboard)
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

function notUndefined(x) {
  return typeof(x) != "undefined"
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
