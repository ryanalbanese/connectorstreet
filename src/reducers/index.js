import { persistCombineReducers } from 'redux-persist'
import { AsyncStorage } from 'react-native'

import routes from './routes'
import errors from './errors'
import userData from './userData'
import settings from './settings'

// local imports
import makeIntroductionData from './makeIntroductionData'
import contacts from './contacts'
import permanentContacts from './permanentContacts'
import freshContacts from './freshContacts'
import watchedNotifications from './watchedNotifications'
import setPushNotifData from './pushNotif'

// requests imports
import request from './request'
import user from './user'
import countryCodes from './countryCodes'
import createUser from './createUser'
import updateUser from './updateUser'
import getUsers from './getUsers'
import validateToken from './validateToken'
import authenticate from './authenticate'
import resetPswdRequest from './resetPswdRequest'
import parseToken from './parseToken'
import getAllUsers from './getAllUsers'
import getImage from './getImage'
import sendSms from './sendSms'
import uploadImage from './uploadImage'
import kvsCreateRecord from './kvsCreateRecord'
import kvsDeleteRecord from './kvsDeleteRecord'
import kvsReadRecord from './kvsReadRecord'
import kvsUpdateRecord from './kvsUpdateRecord'
import savedMessages from './savedMessages'
import pushIdsLocal from './pushIdsLocal'
import setNewPswdRequest from './setNewPswdRequest'
import inviteUser from './inviteUser'
import inviteFriend from './inviteFriend'
import connect from './connect'
import phoneIndex from './phoneIndex'

// model reducers
import { getSettings, updateSettings, setSettings, getUsersSettings } from './models/settings'
import { makeIntroduction, getMyIntroductions, deleteIntroduction, updateIntroduction, getMyConnections, introductionById, hideConnection } from './models/introduction'
import { setCustomMessages, getUserCustomMessages, getUsersCustomMessages, updateCustomMessages } from './models/messages'
import { addNotification, getNotifications, updateNotifications, getNotificationById } from './models/notification'
import { setUserPushIds, getUserPushIds, getUsersPushIds, updateUserPushIds } from './models/pushIds'
import { logger } from './models/logger'
import { contactsExist } from './models/contactsexist'
import { remoteContacts } from './models/remotecontacts'

const persistConfig = {
  key: 'primary',
  storage: AsyncStorage,
  debug: true,
  blacklist: [],
  whitelist: ['userData', 'countryCodes', 'settings', 'watchedNotifications', 'permanentContacts', 'freshContacts']
}

export default persistCombineReducers(persistConfig, {
  routes,
  errors,
  request,
  settings,
  user,
  userData,
  countryCodes,
  contacts,
  freshContacts,
  permanentContacts,
  makeIntroductionData,
  createUser,
  updateUser,
  getUsers,
  validateToken,
  authenticate,
  resetPswdRequest,
  parseToken,
  getImage,
  getAllUsers,
  sendSms,
  uploadImage,
  kvsCreateRecord,
  kvsDeleteRecord,
  kvsReadRecord,
  kvsUpdateRecord,
  savedMessages,
  pushIdsLocal,
  watchedNotifications,
  setPushNotifData,
  setNewPswdRequest,
  inviteUser,
  inviteFriend,
  connect,
  phoneIndex,
  //model reducers
  contactsExist,
  remoteContacts,
  logger,
  setCustomMessages,
  getUserCustomMessages,
  getUsersCustomMessages,
  updateCustomMessages,
  getSettings,
  updateSettings,
  setSettings,
  getUsersSettings,
  deleteIntroduction,
  updateIntroduction,
  hideConnection,
  makeIntroduction,
  introductionById,
  getMyIntroductions,
  getMyConnections,
  addNotification,
  getNotifications,
  getNotificationById,
  updateNotifications,
  setUserPushIds,
  getUserPushIds,
  getUsersPushIds,
  updateUserPushIds
})
