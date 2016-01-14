/* global XMLHttpRequest, history, reRoute */

var User = {} // eslint-disable-line no-unused-vars

// Force user to login or register through reroute
;(function () {
  // Allow user to stay on register screen
  if (document.location.toString().contains('register')) {
    return
  }

  // Ensure user is logged in
  var request = new XMLHttpRequest()
  request.onload = function userRetrieved () {
    if (request.status !== 200) {
      history.pushState({}, '', '/login')
      return reRoute()
    }

    try {
      User = JSON.parse(request.response)
    } catch (e) {
      history.pushState({}, '', '/login')
      return reRoute()
    }
  }

  request.open('GET', '/self')
  request.overrideMimeType('application/json')
  request.send()
})()
