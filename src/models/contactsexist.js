import Database from 'api/Database'
import moment from 'moment'

class ContactsExist extends Database {
  constructor(token) {
    super('contactsExist');
    this.token = null
  }

  init(token) {
    this.token = token
  }

  contactsExist(token, data) {
    return dispatch => dispatch(super.contactsExist(token, data, 'CONTACTSEXIST'))
  }

}

export default ContactsExistModel = new ContactsExist()
