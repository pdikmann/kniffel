let onlineState = {
  WaitingForPlayers: 0,
  Playing: 1,
  MAX: 1,
}

let online = {
  sessionName: "",
  connected: false,
  isHost: false,
  localPlayer: 0,
  requestInterval: {},
  onlineState: onlineState.WaitingForPlayers
  // playerRoster: [],
  // canJoin: true,
}

function isOnline() {
  return online.connected
}

function isOffline(){
  return !online.connected
}

function hostOrSinglePlayer() {
  return (online.connected && online.isHost) ||
    !online.connected
}

function itsNotMyTurn() {
  return online.connected &&
    online.onlineState == onlineState.Playing &&
    state.currentPlayer != online.localPlayer
}

function itIsMyTurn() {
  return online.connected &&
    online.onlineState == onlineState.Playing &&
    state.currentPlayer == online.localPlayer
}

function hostIsWaitingForPlayersToJoin() {
  return online.connected &&
    online.isHost &&
    online.onlineState == onlineState.WaitingForPlayers
}

function guestIsWaitingForHostToStart() {
  return online.connected &&
    !online.isHost &&
    online.onlineState == onlineState.WaitingForPlayers
}

function isGuest() {
  return online.connected &&
    !online.isHost
}

function pushStateToServer() {
  if (!online.connected) return;
  pushRequest(state, (res) => console.log("Push State ok"))
}

function startOnlineGame() {
  stopInterval()
  online.onlineState = onlineState.Playing
  state.joinable = false
  render(state)
}

function stopInterval() {
  clearInterval(online.requestInterval)
}

function waitForPlayers() {
  online.requestInterval = setInterval(() => {
    pullRequest(res => {
      if (res.playerCount != state.playerCount) {
        state = res
        domReset()
        render(state)
      }
    })
  }, 500)
}

function waitForMyTurn() {
  if (!online.connected) return;
  console.log("Waiting for my Turn")
  online.requestInterval = setInterval(() => {
    pullRequest(res => {
      state = res
      if (itIsMyTurn()) {
        console.log("It it My Turn")
        stopInterval()
      }
      render(state)
    })
  }, 500)
}

function waitForHostToStart() {
  online.requestInterval = setInterval(() => {
    pullRequest(res => {
      if (res.playerCount != state.playerCount) {
        state = res
        domReset()
        render(state)
      }
      if (!res.joinable) {
        state = res
        online.onlineState = onlineState.Playing
        stopInterval()
        waitForMyTurn()
        render(state)
      }
    })
  }, 500)
}

function leaveSession() {
  stopInterval()
  online.connected = false
  state.playerCount = 1
  hardReset()
  scrollToTop()
  render(state)
}

function joinSession() {
  pullRequest(res => {
    if (res.joinable) {
      console.log(`Joining ok`)
      online = {
        ...online,
        connected: true,
        localPlayer: state.playerCount
      }
      state = res
      state.playerCount += 1
      state = freshPlayerVars(state, state.playerCount)
      pushRequest(state, res => {
        console.log("Join push state ok")
      })
      scrollToTop()
      domReset()
      render(state)
      waitForHostToStart()
    } else {
      console.log(`Fail to join - game in progress`)
    }
  })
}

function hostSession() {
  pushRequest(state, (res) => {
    if (res.success == true) {
      console.log(`Hosting ok`);
      online = {
        ...online,
        connected: true,
        isHost: true,
        localPlayer: 0,
        onlineState: onlineState.WaitingForPlayers
      }
      scrollToTop()
      render(state)
      waitForPlayers()
    }
  })
}

function testFilePut() {
  pushRequest({
    foo: 123
  }, () => console.log("Success in testing put"))
}

function pullRequest(successfn) {
  makeRequest(false, null, successfn, genericFailCatch)
}

function pushRequest(payload, successfn) {
  makeRequest(true, payload, successfn, genericFailCatch)
}

function genericFailCatch(e, xmlhttp) {
  console.error(e);
  console.error(`Failing to parse response: ${xmlhttp.responseText}`);
}

function makeRequest(pushOrPull, payload, successfn, failfn) {
  let xmlhttp = new XMLHttpRequest()
  xmlhttp.onreadystatechange = () => {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      let res
      try {
        res = JSON.parse(xmlhttp.responseText)
      } catch (e) {
        failfn(e, xmlhttp)
        return
      }
      successfn(res)
    }
  }
  if (pushOrPull) xmlhttp.open("POST", "src/server/push.php", true)
  else xmlhttp.open("GET", "src/server/pull.php", true)
  xmlhttp.setRequestHeader('Content-type', 'application/json')
  if (pushOrPull) xmlhttp.send(JSON.stringify(payload))
  else xmlhttp.send()
}
