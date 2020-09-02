import Database from 'api/Database'

class CustomMessages extends Database {
  constructor(token) {
    super('customMessages');
    this.token = null
  }

  init(token) {
    this.token = token
  }

  setCustomMessages(userId, keyValue) {
    return dispatch => dispatch(super.createKeyRecord(this.token, userId, {...keyValue, }, 'SETCUSTOMMESSAGES'))
  }

  getUserCustomMessages(userId) {
    return dispatch => dispatch(super.readKeyRecord(this.token, userId, 'GETUSERCUSTOMMESSAGES', {
      select: '*',
      where: 'kvsjson->>\'id\' = \'customMessages_' + userId + '\'',
      order: ''
    }))
  }

  getUsersCustomMessages(userIds) {
    return dispatch => dispatch(super.readKeyRecord(this.token, null, 'GETUSERSCUSTOMMESSAGES', {
      select: '*',
      where: userIds.map(userId => 'kvsjson->>\'id\' = \'customMessages_' + userId + '\'').join(' OR '),
      order: ''
    }))
  }

  updateCustomMessages(userId, keyValue) {
    
    return dispatch => dispatch(super.updateKeyRecord(this.token, userId, keyValue, 'UPDATECUSTOMMESSAGES'))
  }
}

export default CustomMessageModel = new CustomMessages()
