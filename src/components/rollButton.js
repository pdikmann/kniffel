rollButtonComponent = {}

rollButtonComponent.render = (element, state) => {
  element.className = (state.turnState == TurnState.MatchSelect) ? "inactive" : ""
  switch (state.turnState) {
    case TurnState.FirstRoll:
      element.textContent = `Spieler ${state.currentPlayer} - Wurf 1` //"Wurf 1"
      break;
    case TurnState.SecondRoll:
      element.textContent = `Spieler ${state.currentPlayer} - Wurf 2`
      break;
    case TurnState.ThirdRoll:
      element.textContent = `Spieler ${state.currentPlayer} - Wurf 3`
      break;
    case TurnState.MatchSelect:
      element.textContent = `Spieler ${state.currentPlayer} - Auswahl` //"Kategorie wählen"
      break;
  }
  if (state.gameOver) {
    element.textContent = isGuest() ? "Warte auf Spielstart" : "Neues Spiel"
    element.className = isGuest() ? "inactive" : "new-game"
  }
  if (hostIsWaitingForPlayersToJoin()) {
    element.textContent = "Spiel starten"
    element.className = "new-game"
  }
  if (guestIsWaitingForHostToStart()) {
    element.textContent = "Spiel beigetreten. Warte auf Spielstart."
    element.className = "inactive"
  }
  if (itsNotMyTurn()) element.className = "inactive"
}
