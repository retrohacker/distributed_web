/* global self */

self.addEventListener('install', function (event) {
  console.log('Installing!')
})

self.addEventListener('fetch', function (event) {
  console.log('Request: ' + event.request.url)
  console.log('Scope: ' + self.registration.scope)
  var request = event.request.url
  var scope = self.registration.scope
  var method = event.request.method

  if (method !== 'GET' || request.indexOf(scope) !== 0) {
    console.log('Request', request, 'is not part of scope', scope)
    console.log('Or method', method, 'is not get')
  }

  var path = request.substring(scope.length)
  path = path.split('/').reverse()
  var user = path.pop()
  var project = path.pop()
  path = path.reverse().join('/')
  console.log('Fetch request for:', path, 'from project', project, 'of user', user)
})
