configComponent = {}

configComponent.render = (element, state) => {
  element.reset.className = offline() ? "button" : isGuest() ? "button hidden" : itIsMyTurn() ? "button" : "button inactive"
  let onlyOffline = offline() ? "button" : "button hidden"
  element.morePlayers.className = onlyOffline
  element.lessPlayers.className = onlyOffline
  element.host.className = onlyOffline
  element.join.className = onlyOffline
  element.leave.className = offline() ? "button hidden" : "button"
}
