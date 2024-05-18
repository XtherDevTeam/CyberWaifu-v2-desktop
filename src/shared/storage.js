
function setItem(k, v, cb) {
  localStorage.setItem(k, JSON.stringify(v))
  cb(true)
}

function removeItem(k, cb) {
  // reimplementing removeItem using localStorage
  localStorage.removeItem(k)
  cb(true)
}

function inquireItem(k, cb) {
  // reimplementing inquireItem using localStorage
  const v = localStorage.getItem(k)
  if (v !== undefined && v !== null && v !== 'undefined') {
    cb(true, JSON.parse(v))
  } else {
    cb(false, undefined)
  }
}

export { inquireItem, removeItem, setItem };