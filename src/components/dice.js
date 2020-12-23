diceComponent = {}

diceComponent.render = (element, state, diceState) => {
  element.className = "dice"
  if (state.turnState == TurnState.FirstRoll) {
    addClass(element, `blank`)
  } else {
    addClass(element, `d${diceState.value}`)
  }
  if (diceState.keep) {
    addClass(element, "keep")
  } else if (state.rolling) {
    addClass(element, "animate")
  }
}
