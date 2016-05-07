var buttons = require('sdk/ui/button/action')
var tabs = require('sdk/tabs')
var events = require('sdk/system/events')
var { Ci } = require('chrome')

events.on('http-on-modify-request', httpRequest)

function httpRequest (event) {
  var channel = event.subject.QueryInterface(Ci.nsIHttpChannel)
  try {
    console.log(channel.getRequestHeader(''))
  } catch (e) {
    console.log(e)
  }
}

buttons.ActionButton({
  id: 'DistributedWeb',
  label: 'Distributed Web',
  icon: './icon.png',
  onClick: handleClick
})

function handleClick (state) {
  tabs.open('http://127.0.0.1:8000')
}
