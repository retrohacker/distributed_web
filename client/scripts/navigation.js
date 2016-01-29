/* global history, XMLHttpRequest, $, Handlebars */

var host = document.location.host

var routes = {
  'default': {
    file: './partials/index.hbs',
    data: '/projects'
  },
  'register': {
    file: './partials/register.hbs'
  },
  'login': {
    file: './partials/login.hbs'
  }
}

// Override default behaviour of links and buttons.
// We first check to see if they are part of our domain, if so
// we avoid reload by using a pushState and triggering a reRoute
document.onclick = function delegateLink (e) {
  e = e || window.event
  var element = e.target || e.srcElement

  // If link
  if (element.tagName === 'A') {
    if (element.href.indexOf(host) !== -1) {
      // If the link is local, prevent refresh
      try {
        history.pushState({}, '', element.href)
        reRoute()
      } catch (e) {
        // Make sure we don't refresh the page
        console.log(e)
      }
      return false
    }
  }

  // If Button
  if (element.tagName === 'BUTTON') {
    var form = element.parentElement

    var inputs = $(form).find('input')
    var data = ''

    for (var i = 0; i < inputs.length; i++) {
      var value = encodeURIComponent(inputs[i].value)
      var name = encodeURIComponent(inputs[i].name)
      if (i > 0) data += '&'
      data += name + '=' + value
    }

    console.log(data)

    var sendRequest = new XMLHttpRequest()
    sendRequest.onload = function finishedRequest () {
      console.log('complete')
      reRoute()
    }
    sendRequest.open(form.method.toUpperCase(), form.action)
    sendRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    sendRequest.send(data)

    return false
  }
}

// Call to rerender page based on current document.location
function reRoute () {
  var route = document.location.pathname.split('/').slice(1)
  var routeHandler = routes
  if (route.length === 0) {
    routeHandler = routes['default']
  }
  for (var piece in route) {
    routeHandler = routeHandler[route[piece]]
    if (!routeHandler) {
      routeHandler = routes['default']
      continue
    }
  }
  render(routeHandler)
}

function render (routeHandler) {
  // Fetch page fragments
  var fetchTemplate = new XMLHttpRequest()
  fetchTemplate.onload = function loadedFragment () {
    var template = Handlebars.compile(fetchTemplate.response)
    if (routeHandler.data) {
      var fetchData = new XMLHttpRequest()
      fetchData.onload = function loadedData () {
        var parsedData = JSON.parse(fetchData.response)
        var html = template(parsedData)
        $('#body').html(html)
      }
      fetchData.open('GET', routeHandler.data)
      fetchData.overrideMimeType('application/json')
      fetchData.send()
    } else {
      var html = template({})
      $('#body').html(html)
    }
  }
  fetchTemplate.open('GET', routeHandler.file)
  fetchTemplate.overrideMimeType('text/plain')
  fetchTemplate.send()
}

reRoute()
