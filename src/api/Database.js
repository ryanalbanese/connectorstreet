import fetchServ, { fetchFetching, fetchError, fetchSuccess } from 'actions/fetchServ'

import { serverUrls, adapterKeyParams, adapterValueParams, whiteListParams } from 'constants/config'
import { getAuthHeader, applyAdapter, queryString } from 'utils'

export default class Database {
  constructor(modelName, token) {
    this.modelName = modelName
  }

  request = (token, urlData, keyValue=null, type, subType) => {

    return dispatch => {
      dispatch(fetchFetching(type))
      return dispatch(
        fetchServ(
          urlData,
          keyValue,
          getAuthHeader(token),
          subType,
          true)
        )
        .then((data) => {
          dispatch(fetchSuccess(data, type))
        })
        .catch((error) => {
          console.log(error)
          dispatch(fetchError(error, type))
        })
    }
  }

  createKeyRecord(token, id, keyValue, type) {
    return dispatch => {
      return dispatch(this.request(
        token,
        {
          ...serverUrls.kvsCreateRecord,
          url: serverUrls.kvsCreateRecord.url + '/' + (this.modelName + '_' + id)
        },
        {
          kvs_value: {
            ...applyAdapter(keyValue, type, { adapterKeyParams, adapterValueParams }, whiteListParams),
            id: (this.modelName + '_' + id)
          }
        },
        type,
        'KVSCREATERECORD'
      ))
    }
  }

  updateKeyRecord(token, id, keyValue, type) {
    return dispatch => {
      return dispatch(this.request(
        token,
        {
          ...serverUrls.kvsUpdateRecord,
          url: serverUrls.kvsUpdateRecord.url + '/' + this.modelName + '_' + id
        },
        {
          kvs_value: {
            ...applyAdapter(keyValue, type, { adapterKeyParams, adapterValueParams }, whiteListParams),
            id: (this.modelName + '_' + id)
          }
        },
        type,
        'KVSUPDATERECORD'
      ))
    }
  }

  deleteKeyRecord(token, id, type) {

    return dispatch => {
      return dispatch(this.request(
        token,
        {
          ...serverUrls.kvsDeleteRecord,
          url: serverUrls.kvsDeleteRecord.url + '/' + id
        },
        null,
        type,
        'KVSDELETERECORD'
      ))
    }
  }

  logger(token, payload, type) {
    return dispatch => {
      return dispatch(this.request(
        token,
        serverUrls.logger,
        payload,
        type,
        'LOGGER'
      ))
    }
  }

  contactsExist(token, payload, type) {

    return dispatch => {
      return dispatch(this.request(
        token,
        serverUrls.contactsExist,
        payload,
        type,
        'CONTACTSEXIST'
      ))
    }
  }

  remoteContacts(token, payload, type) {

    return dispatch => {
      return dispatch(this.request(
        token,
        serverUrls.remoteContacts,
        payload,
        type,
        'REMOTECONTACTS'
      ))
    }
  }

  readKeyRecord(token, id, type, customQuery) {
    return dispatch => {
      return dispatch(this.request(
        token,
        serverUrls.kvsReadRecord,
        customQuery
          ? customQuery
          : {
            select: '*',
            where: 'kvsjson->>\'id\' = \'' + (this.modelName + '_' + id) + '\'',
            order: ''
          },
        type,
        'KVSREADRECORD'
      ))
    }
  }
}

// '/?' +
//             (
//               customQuery
//                 ? customQuery
//                 : 'select=*&where=kvsjson->>\'id\' = \'' + (this.modelName + '_' + id) + '\'&order='
//             )

export const DatabaseInstance = new Database()
