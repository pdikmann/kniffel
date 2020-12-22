function testFilePut() {
  let xmlhttp = new XMLHttpRequest()
  xmlhttp.onreadystatechange = () => {
    console.log(xmlhttp.readyState, xmlhttp.status)
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      let re = {}
      try {
        re = JSON.parse(xmlhttp.responseText)
        console.log(`Success in putting file`);
      } catch (e) {
        console.error(`Failing to parse response: ${xmlhttp.responseText}`);
        re = xmlhttp.responseText
      }
      // console.log(re);
    }
  }
  xmlhttp.open("POST", "src/server/put-state.php", true)
  xmlhttp.setRequestHeader('Content-type', 'application/json')
  xmlhttp.send(JSON.stringify({
    foo: 123
  }))
}
