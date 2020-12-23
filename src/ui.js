let ui = {}

ui.reroll = () => {
  if (hostIsWaitingForPlayersToJoin()) {
    startOnlineGame()
    return
  }
  if (guestIsWaitingForHostToStart()) return
  if (itsNotMyTurn()) return
  if (state.rolling) return
  if (state.turnState == TurnState.MatchSelect) return
  if (state.gameOver) {
    softReset()
    render(state)
    return
  }
  state.rolling = true
  render(state)
  setTimeout(() => {
    rollAll(state)
    advanceTurn(state)
    state.rolling = false
    render(state)
  }, animationDuration)
}

ui.keep = (n) => {
  if (itsNotMyTurn()) return
  if (state.rolling) return
  if (state.turnState == TurnState.FirstRoll) return;
  state.dice[n].keep = !state.dice[n].keep
  render(state)
}

ui.selectMatch = (n, pi) => {
  if (itsNotMyTurn()) return
  if (state.rolling) return
  if (state.turnState == TurnState.FirstRoll) return
  if (state.currentPlayer != pi) return
  let match = dom.matches[pi][n]
  if (state.score[pi][n] != undefined) return
  // match.done = true
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
  pushStateToServer() // render won't push because it's not our turn anymore
  waitForMyTurn()
}

ui.reset = () => {
  if (!hostOrSinglePlayer()) return
  if (state.rolling) return
  softReset()
  scrollToTop()
  render(state)
}

ui.morePlayers = () => {
  if (online.connected) return
  if (state.rolling) return
  state.playerCount += 1
  hardReset()
  render(state)
}

ui.lessPlayers = () => {
  if (online.connected) return
  if (state.rolling) return
  state.playerCount = Math.max(1, state.playerCount - 1)
  hardReset()
  render(state)
}

ui.host = () => {
  state.playerCount = 1
  hardReset()
  hostSession()
  render(state)
}

ui.join = () => {
  joinSession()
}

ui.leave = () => {
  leaveSession()
}
