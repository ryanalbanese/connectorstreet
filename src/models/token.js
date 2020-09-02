import Database from 'api/Database'
import { serverUrls } from 'constants/config'

class Token extends Database {
  constructor(token) {
    super('parseToken');
    this.token = null
  }

  init(token) {
    this.token = token
  }

  parseAuthToken(headers) {
    return dispatch => dispatch(fetchServ(serverUrls.parseToken, null, headers, 'PARSETOKEN'))
  }
}

export default Token = new Token()
