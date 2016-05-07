var orderButtons = '<button class="move_up">+</button><button class="move_down">-</button>'
var file_uuid = 0
var rootFolder = {}
var client = new window.WebTorrent()
rootFolder.name = '.'
rootFolder.parent = null
rootFolder.children = []
rootFolder.uuid = file_uuid++

function addFolder () { // eslint-disable-line no-unused-vars
  var newFolder = {}
  newFolder.name = 'new_folder'
  newFolder.uuid = file_uuid++
  newFolder.parent = rootFolder
  newFolder.children = []
  rootFolder.children.push(newFolder)
  renderTree()
}

function addFile () { // eslint-disable-line no-unused-vars
  var files = document.getElementById('upload').files
  for (var i = 0; i < files.length; i++) {
    var file = files[i]
    var newFile = {}
    newFile.name = file.name
    newFile.uuid = file_uuid++
    newFile.parent = rootFolder
    newFile.file = file
    rootFolder.children.push(newFile)
  }
  renderTree()
}

function renderTree () { // eslint-disable-line no-unused-vars
  var html = renderSubTree(rootFolder)
  document.getElementById('tree').innerHTML = html
  var up_buttons = document.getElementsByClassName('move_up')
  var down_buttons = document.getElementsByClassName('move_down')

  var i
  for (i = 0; i < up_buttons.length; i++) {
    up_buttons[i].onclick = move_up
  }
  for (i = 0; i < down_buttons.length; i++) {
    down_buttons[i].onclick = move_down
  }
}

function renderSubTree (root) {
  var html = ''
  html = '<div id="' + root.uuid + '" class="folder">'
  if (root.uuid !== 0) html += '<input type="text" value="' + root.name + '" class="folderName" oninput="update_name(this)" />' + orderButtons
  else html += '<div class="folderName">.</div>'
  for (var i = 0; i < root.children.length; i++) {
    var child = root.children[i]
    if (child.children) html += renderSubTree(child)
    else html += '<div id="' + child.uuid + '" class="file">' + '<input type="text" value="' + child.name + '" oninput="update_name(this)"/>' + orderButtons + '</div>'
  }
  html += '</div>'
  return html
}

function move_up (event) {
  var id = event.target.parentNode.id | 0
  var node = getNode(id)
  var index = node.parent.children.indexOf(node)
  if (index === 0 && node.parent.id === 0) return null
  if (index < 0) {
    throw new Error('Woah! Index is less than 0')
  } else if (index !== 0) {
    var temp = node.parent.children[index - 1]
    if (temp.children) {
      node.parent.children.splice(index, 1)
      insertIntoSibling(node, temp)
    } else {
      node.parent.children[index - 1] = node.parent.children[index]
      node.parent.children[index] = temp
    }
  } else {
    node.parent.children.splice(index, 1)
    insertIntoParent(node)
  }
  renderTree()
}

function insertIntoParent (node) {
  var parent = node.parent.parent
  var index = parent.children.indexOf(node.parent)
  var curr_index = parent.children.length
  parent.children.push(node)
  node.parent = parent
  for (var i = curr_index; i > index; i--) {
    var temp = parent.children[i - 1]
    parent.children[i - 1] = parent.children[i]
    parent.children[i] = temp
  }
}

function insertIntoSibling (node, sibling) {
  var lastChild = sibling.children[sibling.children.length - 1]
  if (!lastChild || !lastChild.children) {
    sibling.children.push(node)
    node.parent = sibling
    return null
  }
  return insertIntoSibling(node, lastChild)
}

function move_down (event) {
  var id = event.target.parentNode.id | 0
  var node = getNode(id)
  var index = node.parent.children.indexOf(node)
  var parent = node.parent

  if (index === parent.children.length - 1) {
    if (insertIntoParentDown(node, parent)) {
      parent.children.splice(index, 1)
    }
  } else {
    // Swap
    var temp = parent.children[index + 1]
    parent.children[index + 1] = parent.children[index]
    parent.children[index] = temp
  }
  renderTree()
}

function insertIntoParentDown (node, parent) {
  if (parent.uuid === 0) return null
  var index = parent.parent.children.indexOf(parent)
  if (index === parent.parent.children.length - 1) return insertIntoParentDown(node, parent.parent)
  parent.parent.children.splice(index + 1, 0, node)
  node.parent = parent.parent
  return true
}

function update_name (event) { // eslint-disable-line no-unused-vars
  var id = event.parentNode.id | 0
  var node = getNode(id)
  node.name = event.value
}

function getNode (id) {
  return findNode(rootFolder, id)
}

function findNode (root, id) {
  if (root.uuid === id) return root
  for (var i = 0; i < root.children.length; i++) {
    var child = root.children[i]
    if (child.uuid === id) return child
    if (child.children) {
      var node = findNode(child, id)
      if (node) return node
    }
  }
  return null
}

function create_torrent () { // eslint-disable-line no-unused-vars
  client.seed(getFileList(), { name: '/' }, function (torrent) {
    console.log(torrent)
    document.getElementById('hash').innerHTML = '<br><br><b>Torrent:</b> <i>' + torrent.infoHash + '</i>'
  })
}

function getFileList () {
  var files = []
  addFiles(rootFolder, '', files)
  console.log(files)
  return files
}

function addFiles (root, path, fileList) {
  for (var i = 0; i < root.children.length; i++) {
    var child = root.children[i]
    if (child.children) {
      addFiles(child, path + child.name + '/', fileList)
    } else {
      child.file.fullPath = path + child.name
      fileList.push(child.file)
    }
  }
}
