let online = {
  sessionName: "",
  connected: false,
  isHost: false,
  localPlayer: 0,
  requestInterval: {},
  onlineState: OnlineState.WaitingForPlayers
}

function isOnline() {
  return online.connected
}

function isOffline() {
  return !online.connected
}

function hostOrSinglePlayer() {
  return (online.connected && online.isHost) ||
    !online.connected
}

function itsNotMyTurn() {
  return online.connected &&
    online.onlineState == OnlineState.Playing &&
    state.currentPlayer != online.localPlayer
}

function itsMyTurn() {
  return online.connected &&
    online.onlineState == OnlineState.Playing &&
    state.currentPlayer == online.localPlayer
}

function hostIsWaitingForPlayersToJoin() {
  return online.connected &&
    online.isHost &&
    online.onlineState == OnlineState.WaitingForPlayers
}

function guestIsWaitingForHostToStart() {
  return online.connected &&
    !online.isHost &&
    online.onlineState == OnlineState.WaitingForPlayers
}

function isGuest() {
  return online.connected &&
    !online.isHost
}

function pushStateToServer() {
  if (!online.connected) return;
  pushRequest(state, (res) => {
    if (res.success) {
      console.log("Push State ok")
    } else {
      console.log(`Push State fail, server reports error: ${res.error}`)
    }
  })
}

function startOnlineGame() {
  stopInterval()
  online.onlineState = OnlineState.Playing
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
      if (itsMyTurn()) {
        console.log("It is My Turn")
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
        online.onlineState = OnlineState.Playing
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
      state = res
      online = {
        ...online,
        connected: true,
        isHost: false,
        localPlayer: state.playerCount,
        onlineState: OnlineState.WaitingForPlayers
      }
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
        onlineState: OnlineState.WaitingForPlayers
      }
      scrollToTop()
      render(state)
      waitForPlayers()
    } else {
      console.error(`Hosting fail, server reports error: ${res.error}`);
    }
  })
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
  if (pushOrPull) xmlhttp.open("POST", `src/server/push.php?session=${dom.config.session.value}`, true)
  else xmlhttp.open("GET", `src/server/pull.php?session=${dom.config.session.value}`, true)
  xmlhttp.setRequestHeader('Content-type', 'application/json')
  if (pushOrPull) xmlhttp.send(JSON.stringify(payload))
  else xmlhttp.send()
}
