function launchFilePickerAsync(accept, multiple) {
  return new Promise((resolve, reject) => {
    try {
      var input = document.createElement('input')
      input.type = 'file'
      input.accept = accept ? accept : ''
      input.multiple = multiple ? multiple : false
      input.onchange = e => {
        resolve(e.target.files)
      }
      input.click()
    }
    catch (e) {
      reject(e)
    }
  })
}

function launchImagePickerAsync(multiple) {
  return launchFilePickerAsync('image/*', multiple)
}

function launchAudioPickerAsync(multiple) {
  return launchFilePickerAsync('audio/*', multiple)
}

function uploadAsync(remote, fileObject, config) {
  let body = new FormData()
  body.append('file', fileObject)
  return fetch(remote, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type':'multipart/form-data',
    },
    ...config
  })
}

export default {
  launchFilePickerAsync,
  launchImagePickerAsync,
  launchAudioPickerAsync,
  uploadAsync
}