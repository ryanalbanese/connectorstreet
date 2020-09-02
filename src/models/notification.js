import Database from 'api/Database'
import moment from 'moment'

class Notification extends Database {
  constructor(token) {
    super('notification');
    this.token = null
  }

  init(token) {
    this.token = token
  }

  addNotification(id, keyValue) {
    return dispatch => dispatch(super.createKeyRecord(this.token, id, {...keyValue, date: moment().unix()}, 'ADDNOTIFICATION'))
  }
  updateNotifications(id, keyValue) {
    return dispatch => dispatch(super.updateKeyRecord(this.token, id, {...keyValue}, 'UPDATENOTIFICATIONS'))
  }
  getNotificationById(id) {
    return dispatch => dispatch(super.readKeyRecord(this.token, id, 'GETNOTIFICATIONBYID',{
      select: '*',
      where: 'kvsjson->>\'id\' = \'' + (id) + '\'',
      order: ''
    }))
  }
  getNotifications(userId) {
    return dispatch => dispatch(super.readKeyRecord(this.token, userId, 'GETNOTIFICATIONS', {
      select: '*',
      where: "(kvsjson->>'userIdTo' = '" + userId + "') AND NOT (kvsjson::jsonb ? 'hidden_"+userId+"')",
      order: ''
    }))
  }
}

export default NotificationModel = new Notification()
