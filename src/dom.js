let dom = freshDOM()

function freshDOM() {
  return {
    dices: [],
    rollButton: {},
    scoreboard: {},
    // all following are per player
    header: [],
    matches: [],
    bonus: [],
    sumTop: [],
    sumBottom: [],
    sum: []
  }
}

function getDOM(dom) {
  dom.dices = document.getElementsByClassName('dice')
  dom.rollButton = document.getElementById('reroll')
  dom.scoreboard = document.getElementById('scoreboard')
  dom.bottomWrapper = document.getElementById('bottom-wrapper')
  dom.config = {
    reset: document.getElementById('reset'),
    lessPlayers: document.getElementById('less-players'),
    morePlayers: document.getElementById('more-players'),
    host: document.getElementById('host'),
    join: document.getElementById('join'),
    leave: document.getElementById('leave'),
    session: document.getElementById('session'),
  }
}

function render(state) {
  if (itsMyTurn()) {
    pushStateToServer()
  }
  rollButtonComponent.render(dom.rollButton, state)
  let dices = dom.dices;
  for (var d = 0; d < dices.length; ++d) diceComponent.render(dices[d], state, state.dice[d])
  for (var pi = 0; pi < state.playerCount; pi++) {
    dom.header[pi].className = (state.currentPlayer == pi) ? "active" : ""
    for (var m = 0; m < dom.matches[pi].length; m++) {
      let match = dom.matches[pi][m].element,
        oldScore = state.score[pi][m],
        score = (oldScore == undefined) ? matches[m].fn(diceValues(state)) : oldScore
      match.className = "match"
      if (score == 0) {
        addClass(match, "zero")
      } else {
        addClass(match, "ok")
      }
      if (state.score[pi][m] != undefined) {
        // (dom.matches[pi][m].done) {
        addClass(match, "done")
      }
      if (isOnline() && pi != online.localPlayer) {
        addClass(match, "inactive")
      }
      match.textContent = (score > 0) ? score : "—"
      if ((state.currentPlayer != pi || state.turnState == TurnState.FirstRoll) &&
        //!dom.matches[pi][m].done) {
        state.score[pi][m] == undefined) {
        match.textContent = ""
        match.className = "match"
      }
    }
    if (state.bonusFlag[pi] > 0) {
      dom.bonus[pi].textContent = state.bonus[pi]
    } else if (state.bonusFlag[pi] < 0) {
      dom.bonus[pi].textContent = "—"
    } else {
      dom.bonus[pi].textContent = ""
    }
    dom.sumTop[pi].textContent = state.score[pi].slice(0, 6).filter(identity).reduce(sum, 0) + state.bonus[pi]
    dom.sumBottom[pi].textContent = state.score[pi].slice(6).filter(identity).reduce(sum, 0)
    dom.sum[pi].textContent = state.score[pi].filter(identity).reduce(sum, 0) + state.bonus[pi]
  }
  configComponent.render(dom.config, state)
}

function makeTable2(parent) {
  let table = mk.table()
  let trs = []
  trs.push("")
  for (var i = 0; i < 6; i++) trs.push(matches[i].label)
  trs.push("Bonus", "Summe\nOben")
  for (var i = 6; i < matches.length; i++) trs.push(matches[i].label)
  trs.push("Summe\nUnten", "Summe")
  let players = [],
    tds = []
  for (var i = 0; i < state.playerCount; i++) players.push(i)
  // make [] of all rows
  // then make [] of all match functions
  // then zip it up
  players.forEach((_, pi) => {
    dom.header[pi] = {}
    dom.bonus[pi] = {}
    dom.sumTop[pi] = {}
    dom.sumBottom[pi] = {}
    dom.sum[pi] = {}
    dom.matches[pi] = matches.map(_ => {})
    let td = []
    td.push((tr) => dom.header[pi] = mk.th(tr, `~ ${pi + 1} ~`))
    for (var m1 = 0; m1 < 6; m1++) mishMatch(td, m1, pi)
    td.push((tr) => dom.bonus[pi] = addClass(mk.td(tr, 0), "sum"))
    td.push((tr) => dom.sumTop[pi] = addClass(mk.td(tr, 0), "sum"))
    for (var m2 = 6; m2 < matches.length; m2++) mishMatch(td, m2, pi)
    td.push((tr) => dom.sumBottom[pi] = addClass(mk.td(tr, 0), "sum"))
    td.push((tr) => dom.sum[pi] = addClass(mk.td(tr, 0), "sum"))
    tds.push(td)
  })
  trs.forEach((row, i) => {
    let tr = mk.tr(table)
    let rowHead = mk.td(tr, row)
    rowHead.className = "row-label"
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

function addClass(dom, className) {
  dom.className = stringAdd(dom.className, className)
  return dom
}

function removeClass(dom, className) {
  dom.className = stringRemove(dom.className, className)
  return dom
}

function scrollToTop(){
  window.scrollTo(0, 0)
  dom.bottomWrapper.scrollTo(0, 0)
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