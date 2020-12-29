let animationDuration = 450,
  scriptVersion = "1.1.1"

window.onload = () => {
  runAllTests()
  setCssVariables()
  cloneDice()
  getDOM(dom)
  dom.version.textContent = `${dom.version.textContent} / script ${scriptVersion}` 
  checkLocalStorageAndContinue(() => {
    makeTable2(dom.scoreboard)
    render(state)
    removeClass(document.getElementById('wrapper'), 'hidden')
  })
}

function checkLocalStorageAndContinue(cont) {
  let ls_online = JSON.parse(window.localStorage.getItem('online')),
    ls_state = JSON.parse(window.localStorage.getItem('state'))
  if (notUndefinedOrNull(ls_online) && notUndefinedOrNull(ls_state)) {
    if (ls_online.connected === false) {
      online = ls_online
      state = ls_state
      cont()
    } else {
      online = ls_online
      pullRequest(res => {
        state = res
        if (itsNotMyTurn()) {
          waitForMyTurn()
        }
        cont()
      })
    }
  } else {
    cont()
  }
}

//  ███████ ████████  █████  ████████ ███████ 
//  ██         ██    ██   ██    ██    ██      
//  ███████    ██    ███████    ██    █████ 
//       ██    ██    ██   ██    ██    ██    
//  ███████    ██    ██   ██    ██    ███████ 


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
  if (state.currentPlayer == 0 && state.score[0].filter(notUndefinedOrNull).length == 13) {
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
  let tempState = {
    ...state
  }
  state = freshState(state.playerCount)
  state.joinable = tempState.joinable
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

function notUndefinedOrNull(x) {
  return typeof (x) != "undefined" && x != null
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

function bigState(count) {
  state.playerCount = count
  hardReset()
  for (var pi = 0; pi < count; pi++) {
    for (var mi = 0; mi < matches.length; mi++) {
      state.score[pi][mi] = 50
    }
    state.bonus[pi] = 35;
    state.bonusFlag[pi] = 1;
  }
  render(state)
}

function stateSizeTest() {
  bigState(8)
  let str = JSON.stringify(state)
  console.log(`state size (string length) is ${str.length}`)
  render(state)
}
