import Database from 'api/Database'
import moment from 'moment'

class Logger extends Database {
  constructor(token) {
    super('logger');
    this.token = null
  }

  init(token) {
    this.token = token
  }

  logger(payload) {
    return dispatch => dispatch(super.logger(this.token, payload, 'LOGGER'))
  }

}

export default LoggerModel = new Logger()
