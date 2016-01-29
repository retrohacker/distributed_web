if (!window.navigator.serviceWorker) {
  throw new Error('No Service Worker')
}

window.navigator.serviceWorker.register('router.js').then(function (registration) {
  console.log('Registration successful')
}).catch(function (e) {
  if (e) {
    throw new Error('Service Worker Registration Failed ' + e)
  }
})

// Start torrent service
var client = window.WebTorrent()
var hash = 'magnet:?xt=urn:btih:382ea138290d2ad2c3e4bd9d13190cfba28b870c'

client.add(hash, function (torrent) {
  var files = torrent.files

  for (var file in files) {
    file = files[file]
    if (file.name !== 'index.html') {
      continue
    }
    file.getBuffer(function (e, buffer) {
      document.getElementById('torrent').innerHTML = buffer.toString()
    })
  }
})
