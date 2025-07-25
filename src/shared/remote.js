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

function chatEstablish(charName) {
  return axios.post(`${serverUrl}/api/v1/chat/establish`, {
    charName
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

function charNew(charName, useTTSModel, useStickerSet, charPrompt, pastMemories, exampleChats, tha4Service) {
  return axios.post(`${serverUrl}/api/v1/char/new`, {
    charName,
    useTTSModel,
    useStickerSet,
    charPrompt,
    pastMemories,
    exampleChats,
    tha4Service
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

function editCharacter(id, charName, charPrompt, pastMemories, exampleChats, useStickerSet, useTTSModel, tha4Service) {
  return axios.post(`${serverUrl}/api/v1/char/${id}/edit`, {
    useStickerSet,
    charName,
    charPrompt,
    pastMemories,
    exampleChats,
    useTTSModel,
    tha4Service
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

// gpt_sovits_middleware/info
function getMiddlewareInfo() {
  return axios.post(`${serverUrl}/api/v1/gpt_sovits_middleware/info`)
}

// gpt_sovits_middleware/run_training
function runTraining(enabled_char_names, sources_to_fetch) {
  return axios.post(`${serverUrl}/api/v1/gpt_sovits_middleware/run_training`, {
    enabled_char_names,
    sources_to_fetch,
  })
}

// gpt_sovits_middleware/track
function trackTask(id) {
  return axios.post(`${serverUrl}/api/v1/gpt_sovits_middleware/track`, {
    id,
  })
}

// gpt_sovits_middleware/tasks
function getMiddlewareTasks() {
  return axios.post(`${serverUrl}/api/v1/gpt_sovits_middleware/tasks`)
} 


// gpt_sovits_middleware/set_url
function setMiddlewareUrl(url) {
  return axios.post(`${serverUrl}/api/v1/gpt_sovits_middleware/set_url`, {
    url,
  })
}


function deleteMiddlewareTask(id) {
  return axios.post(`${serverUrl}/api/v1/gpt_sovits_middleware/delete_task`, {
    id,
  })
}

function getExtraInfoList(prompt) {
  return axios.post(`${serverUrl}/api/v1/extra_info`).then(r => {
    return r.data
  })
}

function createExtraInfo(name, description, author, enabled, content) {
  return axios.post(`${serverUrl}/api/v1/extra_info/create`, { name, description, author, enabled, content }).then(r => {
    return r.data
  })
}

function getExtraInfo(id) {
  return axios.post(`${serverUrl}/api/v1/extra_info/get`, { id }).then(r => {
    return r.data
  })
}

function updateExtraInfo(id, name, description, author, enabled, content) {
  return axios.post(`${serverUrl}/api/v1/extra_info/update`, { id, name, description, author, enabled, content }).then(r => {
    return r.data
  })
}

function deleteExtraInfo(id) {
  return axios.post(`${serverUrl}/api/v1/extra_info/delete`, { id }).then(r => {
    return r.data
  })
}

function getUserScriptList() {
  return axios.post(`${serverUrl}/api/v1/user_script`).then(r => {
    return r.data
  })
}

function getUserScript(id) {
  return axios.post(`${serverUrl}/api/v1/user_script/get`, { id }).then(r => {
    return r.data
  })
}

function createUserScript(name, description, author, enabled, content) {
  return axios.post(`${serverUrl}/api/v1/user_script/create`, { name, description, author, enabled, content }).then(r => {
    return r.data
  })
}

function updateUserScript(id, name, description, author, enabled, content) {
  return axios.post(`${serverUrl}/api/v1/user_script/update`, { id, name, description, author, enabled, content }).then(r => {
    return r.data
  })
}

function deleteUserScript(id) {
  return axios.post(`${serverUrl}/api/v1/user_script/delete`, { id }).then(r => {
    return r.data
  })
}

function characterGenerator(name) {
  return axios.post(`${serverUrl}/api/v1/tools/character_generator`, { name }).then(r => {
    return r.data
  })
}

function createTHA4Service(name, description, configuration) {
  return axios.post(`${serverUrl}/api/v1/tha4_middleware/service/create`, { name, description, configuration }).then(r => {
    return r.data
  })
}

function getTHA4ServiceList() {
  return axios.post(`${serverUrl}/api/v1/tha4_middleware/service/list`).then(r => {
    return r.data
  })
}

function getTHA4ServiceInfo(id) {
  return axios.post(`${serverUrl}/api/v1/tha4_middleware/service/get`, { id }).then(r => {
    return r.data
  })
}

function updateTHA4ServiceAvatar(id, avatarFileObject) {
  let formData = new FormData();
  formData.append('avatar', avatarFileObject);
  return axios.post(`${serverUrl}/api/v1/tha4_middleware/service/set_avatar/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => {
    return r.data
  })
}

function getTHA4ServiceAvatarUrl(id) {
  return `${serverUrl}/api/v1/tha4_middleware/service/get_avatar/${id}`
}

function updateTHA4Service(id, name, description, configuration) {
  return axios.post(`${serverUrl}/api/v1/tha4_middleware/service/update`, { id, name, description, configuration }).then(r => {
    return r.data
  })
}

function deleteTHA4Service(id) {
  return axios.post(`${serverUrl}/api/v1/tha4_middleware/service/delete`, { id }).then(r => {
    return r.data
  })
}

function updateTHA4MiddlewareUrl(url) {
  return axios.post(`${serverUrl}/api/v1/tha4_middleware/update_url`, { url }).then(r => {
    return r.data
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
  getMiddlewareInfo,
  runTraining,
  trackTask,
  getMiddlewareTasks,
  deleteMiddlewareTask,
  setMiddlewareUrl,
  getExtraInfoList,
  createExtraInfo,
  getExtraInfo,
  updateExtraInfo,
  deleteExtraInfo,
  getUserScriptList,
  getUserScript,
  createUserScript,
  updateUserScript,
  deleteUserScript,
  characterGenerator,
  createTHA4Service,
  getTHA4ServiceList,
  getTHA4ServiceInfo,
  updateTHA4Service,
  deleteTHA4Service,
  getTHA4ServiceAvatarUrl,
  updateTHA4ServiceAvatar,
  updateTHA4MiddlewareUrl,
  serverUrl
};