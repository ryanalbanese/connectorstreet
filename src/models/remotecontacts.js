import Database from 'api/Database'
import moment from 'moment'

class RemoteContacts extends Database {
  constructor(token) {
    super('remoteContacts');
    this.token = null
  }

  init(token) {
    this.token = token
  }

  remoteContacts(token, data) {
    return dispatch => dispatch(super.remoteContacts(token, data, 'REMOTECONTACTS'))
  }

}

export default RemoteContactsModel = new RemoteContacts()
