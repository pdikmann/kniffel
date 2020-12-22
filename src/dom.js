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
}

function render(state) {
  if (online.connected && online.isHost && online.onlineState == onlineState.Playing) {
    pushRequest(state, (res) => console.log("Push State ok"))
  }
  dom.rollButton.className = (state.turnState == TurnState.MatchSelect) ? "inactive" : ""
  switch (state.turnState) {
    case TurnState.FirstRoll:
      dom.rollButton.textContent = `Spieler ${state.currentPlayer} - Wurf 1` //"Wurf 1"
      break;
    case TurnState.SecondRoll:
      dom.rollButton.textContent = `Spieler ${state.currentPlayer} - Wurf 2`
      break;
    case TurnState.ThirdRoll:
      dom.rollButton.textContent = `Spieler ${state.currentPlayer} - Wurf 3`
      break;
    case TurnState.MatchSelect:
      dom.rollButton.textContent = `Spieler ${state.currentPlayer} - Auswahl` //"Kategorie wählen"
      break;
  }
  if (state.gameOver) {
    dom.rollButton.textContent = "Neues Spiel"
    dom.rollButton.className = "new-game"
  }
  if (online.connected && online.isHost && online.onlineState == onlineState.WaitingForPlayers) {
    dom.rollButton.textContent = "Warte auf Spieler ... Spiel starten"
    dom.rollButton.className = "new-game"
  }
  if (online.connected && !online.isHost && online.onlineState == onlineState.WaitingForPlayers) {
    dom.rollButton.textContent = "Spiel beigetreten. Warte auf Spielstart von Host."
    dom.rollButton.className = "inactive"
  }
  let dices = dom.dices;
  for (var d = 0; d < dices.length; ++d) {
    // dices[d].textContent = state.dice[d].value
    dices[d].className = "dice"
    if (state.turnState == TurnState.FirstRoll) {
      addClass(dices[d], `blank`)
    } else {
      addClass(dices[d], `d${state.dice[d].value}`)
    }
    if (state.dice[d].keep) {
      addClass(dices[d], "keep")
    } else if (state.rolling) {
      addClass(dices[d], "animate")
    }
  }
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
      // dom.bonus[pi].className = "bonus ok done"
    } else if (state.bonusFlag[pi] < 0) {
      dom.bonus[pi].textContent = "—"
      // dom.bonus[pi].className = "bonus zero done"
    } else {
      dom.bonus[pi].textContent = ""
    }
    dom.sumTop[pi].textContent = state.score[pi].slice(0, 6).filter(identity).reduce(sum, 0) + state.bonus[pi]
    dom.sumBottom[pi].textContent = state.score[pi].slice(6).filter(identity).reduce(sum, 0)
    dom.sum[pi].textContent = state.score[pi].filter(identity).reduce(sum, 0) + state.bonus[pi]
  }
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
    td.push((tr) => dom.header[pi] = mk.th(tr, `${pi}`))
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
