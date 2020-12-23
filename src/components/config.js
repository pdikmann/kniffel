configComponent = {}

configComponent.render = (element, state) => {
  element.reset.className = isOffline() ? "button" : isGuest() ? "button hidden" : itIsMyTurn() ? "button" : "button inactive"
  let onlyOffline = isOffline() ? "button" : "button hidden"
  element.morePlayers.className = onlyOffline
  element.lessPlayers.className = onlyOffline
  element.host.className = onlyOffline
  element.join.className = onlyOffline
  element.leave.className = isOffline() ? "button hidden" : "button"
}
