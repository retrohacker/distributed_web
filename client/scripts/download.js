if (!window.navigator.serviceWorker) {
  throw new Error('No Service Worker Available')
}

var client = new window.WebTorrent()
var torrentHashPrefix = 'magnet:?xt=urn:btih:'

function download_torrent () { // eslint-disable-line no-unused-vars
  var torrentHash = torrentHashPrefix + document.getElementById('torrent_hash').value
  console.log('Downloading: ', torrentHash)
  client.add(torrentHash, renderFromTorrent)
}

function renderFromTorrent (torrent) {
  console.log('Downloaded torrent!')
  console.log(torrent.files)
  var index = null
  for (var i = 0; i < torrent.files.length; i++) {
    var path = torrent.files[i].path
    console.log(torrent.files[i].path)
    console.log(torrent.files[i])
    console.log(path)
    if (path === 'index.html') {
      index = torrent.files[i]
    }
  }
  window.async.each(torrent.files, function (file, cb) {
    file.getBlobURL(function (e, bloburl) {
      if (e) throw e
      console.log('Adding the following to local storage:', file.path)
      window.localforage.setItem(file.path, bloburl).then(function () { cb() })
    })
  }, function (e) {
    if (e) throw e
    index.getBuffer(function (e, buffer) {
      if (e) throw Error('Oh Noes! Could not get buffer of index.html')
      document.getElementById('body').innerHTML = buffer.toString()
    })
  })
}

window.navigator.serviceWorker.register('router.js').then(function (registration) {
  console.log('Successfully registered service worker')
}).catch(function (e) {
  if (e) {
    throw new Error('Service Worker Registration Failed' + e)
  }
})
