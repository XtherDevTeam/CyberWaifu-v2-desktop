import axios from 'axios';

import * as storage from './storage';

let serverUrl = ""

axios.defaults.withCredentials = true

function refreshServerUrl() {
  storage.inquireItem("serverAddress", (r, v) => {
    if (!r) {
      serverUrl = null
    } else {
      serverUrl = v
    }
  })
}

refreshServerUrl()

function checkIfLoggedIn() {
  return axios.get(`${serverUrl}/api/v1/service/info`).then(r => {
    if (r.data.data.authenticated_session === -1) {
      storage.removeItem('loginStatus', r => { })
    }
    return r.data.data.authenticated_session !== -1
  }).catch(r => {
    return false;
  })
}

function getUserName() {
  return axios.get(`${serverUrl}/api/v1/service/info`).then(r => {
    return r.data.data.session_username
  }).catch(r => {
    return 'guest'
  })
}


function getServiceInfo() {
  return axios.get(`${serverUrl}/api/v1/service/info`)
}

function updateUserPersona(persona) {
  return axios.post(`${serverUrl}/api/v1/update_persona`, {persona})
}

function checkIfInitialized() {
  return axios.get(`${serverUrl}/api/v1/service/info`).then(r => {
    return r.data.data.initialized
  }).catch(r => { throw r })
}

function initialize(username, password) {
  return axios.post(`${serverUrl}/api/v1/initialize`, {
    userName: username,
    password
  })
}

function signIn(password) {
  return axios.post(`${serverUrl}/api/v1/user/login`, {
    password
  }, { withCredentials: true }).then(r => {
    if (r.data.status) {
      storage.setItem('loginStatus', true, r => { })
    }
    return r
  })
}

function characterList() {
  return axios.post(`${serverUrl}/api/v1/char_list`)
}

function chatEstablish(charName, msgChain) {
  return axios.post(`${serverUrl}/api/v1/chat/establish`, {
    charName,
    msgChain
  })
}

function chatMessage(session, msgChain) {
  return axios.post(`${serverUrl}/api/v1/chat/message`, {
    session,
    msgChain
  })
}

function chatTerminate(session) {
  return axios.post(`${serverUrl}/api/v1/chat/terminate`, {
    session
  })
}

function attachmentUploadAudio() {
  return `${serverUrl}/api/v1/attachment/upload/audio`
}

function attachmentUploadImage() {
  return `${serverUrl}/api/v1/attachment/upload/image`
}

function attachmentDownload(attachmentId) {
  return `${serverUrl}/api/v1/attachment/${attachmentId}`
}

function attachmentUrl(attachmentId) {
  return `/api/v1/attachment/${attachmentId}`
}

function charAvatar(charId) {
  // console.log(`${serverUrl}/api/v1/char/${charId}/avatar`)
  return `${serverUrl}/api/v1/char/${charId}/avatar`
}

function charHistory(charId, offset = 0) {
  return axios.post(`${serverUrl}/api/v1/char/${charId}/history/${offset}`)
}

function charNew(charName, useTTSService, useStickerSet, charPrompt, pastMemories, exampleChats) {
  return axios.post(`${serverUrl}/api/v1/char/new`, {
    charName,
    useTTSService,
    useStickerSet,
    charPrompt,
    pastMemories,
    exampleChats
  })
}

function getAvatar() {
  return `${serverUrl}/api/v1/avatar`
}

function createStickerSet(setName) {
  return axios.post(`${serverUrl}/api/v1/sticker/create_set`, { setName })
}

function deleteStickerSet(setId) {
  return axios.post(`${serverUrl}/api/v1/sticker/delete_set`, { setId })
}

function addStickerToSet(setId, stickerName) {
  return `${serverUrl}/api/v1/sticker/add?setId=${encodeURIComponent(setId)}&stickerName=${encodeURIComponent(stickerName)}`
}

function deleteSticker(stickerId) {
  return axios.post(`${serverUrl}/api/v1/sticker/delete`, { stickerId })
}

function renameStickerSet(setId, newSetName) {
  return axios.post(`${serverUrl}/api/v1/sticker/rename_set`, { setId, newSetName })
}

function stickerGet(setId, name) {
  return `${serverUrl}/api/v1/sticker/get?setId=${encodeURIComponent(setId)}&name=${encodeURIComponent(name)}`
}

function stickerSetList() {
  return axios.post(`${serverUrl}/api/v1/sticker/set_list`)
}

function stickerList(setId) {
  return axios.post(`${serverUrl}/api/v1/sticker/list`, { setId })
}

function editCharacter(id, charName, charPrompt, pastMemories, exampleChats, useStickerSet, useTTSService) {
  return axios.post(`${serverUrl}/api/v1/char/${id}/edit`, {
    useStickerSet,
    charName,
    charPrompt,
    pastMemories,
    exampleChats,
    useTTSService
  })
}

function getCharacterInfo(id) {
  return axios.post(`${serverUrl}/api/v1/char/${id}/info`)
}

function getStickerSetInfo(setId) {
  return axios.post(`${serverUrl}/api/v1/sticker/set_info`, {setId})
}

function stt() {
  return `${serverUrl}/api/v1/stt`
}

function updateAvatar() {
  return `${serverUrl}/api/v1/avatar/update`
}

function updateCharacterAvatar(id) {
  return `${serverUrl}/api/v1/char/${id}/avatar/update`
}

function splitEmotionAndText(emotions, text) {
  text = '' + text; // Convert to string if not already, don't even know why this is necessary
  // Construct the regular expression pattern
  const pattern = new RegExp("\\((?:" + emotions.join("|") + ")\\)", "g");

  // Split the text using the pattern
  const splited = text.split(pattern);

  // Create the result array
  const result = [];
  let resultIndex = 0;

  // Iterate through matches and add to the result
  for (const match of text.matchAll(pattern)) {
    result.push(`text:${splited[resultIndex]}`);
    result.push(`emo:${match[0].substring(1, match[0].length - 1)}`); // Extract the emotion without parentheses
    resultIndex++;
  }
  if (resultIndex < splited.length) {
    result.push(`text:${splited[resultIndex]}`);
  }

  return result;
}

function createTTSService(name, description, url, ttsInferYamlPath) {
  return axios.post(`${serverUrl}/api/v1/tts/service/create`, {
    name,
    description,
    url,
    ttsInferYamlPath,
  })
}

function addTTSReferenceAudio(serviceId, name, text, path, language) {
  return axios.post(`${serverUrl}/api/v1/tts/ref_audio/add`, {
    serviceId,
    name,
    text,
    path,
    language,
  })
}

function deleteTTSReferenceAudio(id) {
  return axios.post(`${serverUrl}/api/v1/tts/ref_audio/delete`, {
    id,
  })
}

function getTTSServiceList() {
  return axios.post(`${serverUrl}/api/v1/tts/service/list`)
}

function getTTSServiceInfo(id) {
  return axios.post(`${serverUrl}/api/v1/tts/service/${id}`)
}

function deleteTTSService(id) {
  return axios.post(`${serverUrl}/api/v1/tts/service/delete`, {
    id,
  })
}

function updateTTSService(id, name, description, url, ttsInferYamlPath) {
  return axios.post(`${serverUrl}/api/v1/tts/service/update`, {
    id,
    name,
    description,
    url,
    ttsInferYamlPath,
  })
}

function chatKeepAlive(session) {
  return axios.post(`${serverUrl}/api/v1/chat/keep_alive`, {
    session,
  })
}

function updateUserName(userName) {
  return axios.post(`${serverUrl}/api/v1/update_username`, {
    userName})
}

function updatePassword(password) {
  return axios.post(`${serverUrl}/api/v1/update_password`, {
    password
  })
}

function rtVcEstablish(charName) {
  return axios.post(`${serverUrl}/api/v1/rtvc/establish`, {
    charName
  })
}

function rtVcTerminate(session) {
  return axios.post(`${serverUrl}/api/v1/rtvc/terminate`, {
    session
  })
}

export {
  addStickerToSet,
  addTTSReferenceAudio,
  attachmentDownload,
  attachmentUploadAudio,
  attachmentUploadImage,
  attachmentUrl,
  characterList,
  charAvatar,
  charHistory,
  charNew,
  chatEstablish,
  chatKeepAlive,
  chatMessage,
  chatTerminate,
  checkIfInitialized,
  checkIfLoggedIn,
  createStickerSet,
  createTTSService,
  deleteSticker,
  deleteStickerSet,
  deleteTTSReferenceAudio,
  deleteTTSService,
  editCharacter,
  getAvatar,
  getCharacterInfo,
  getStickerSetInfo,
  getTTSServiceInfo,
  getTTSServiceList,
  getUserName,
  initialize,
  refreshServerUrl,
  renameStickerSet,
  rtVcEstablish,
  rtVcTerminate,
  signIn,
  splitEmotionAndText,
  stickerGet,
  stickerList,
  stickerSetList,
  stt,
  updateAvatar,
  updateCharacterAvatar,
  updatePassword,
  updateTTSService,
  updateUserName,
  getServiceInfo,

  updateUserPersona,
};