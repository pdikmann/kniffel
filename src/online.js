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

function startOnlineGame(){
  online.onlineState = onlineState.Playing
  state.joinable = false
  stopInterval()
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

function waitForHost() {
  online.requestInterval = setInterval(() => {
    pullRequest(res => {
      if (res.playerCount != state.playerCount) {
        state = res
        domReset()
        render(state)
      } else {
        state = res
        render(state)
      }
    })
  }, 500)
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
      state = updatePlayerVars(state, state.playerCount)
      pushRequest(state, res => {
        console.log("Join push state ok")
      })
      window.scrollTo(0, 0)
      dom.bottomWrapper.scrollTo(0, 0)
      domReset()
      render(state)
      waitForHost()
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
      window.scrollTo(0, 0)
      dom.bottomWrapper.scrollTo(0, 0)
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
