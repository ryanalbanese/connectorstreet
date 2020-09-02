import axios from 'axios'
import { Platform } from 'react-native'

import { baseUrl } from 'constants/config'
import { queryString, textErrors } from 'utils'

export default DAO = {

  request({url, method}, params, headers) {
    let initialResponse
    return new Promise((resolve, reject) => {
      let fetchParams = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method == 'POST' || method == 'PUT'
          ? JSON.stringify(params)
          : null
      }
      if (headers) fetchParams.headers = {...fetchParams.headers, ...headers}

      //DEBUG -- REMOVE FOR RELEASE
      console.log(baseUrl + url + (method == 'GET' && params ? queryString(params) : ''))
      console.log(JSON.stringify(params))
      console.log(fetchParams)
      console.log(headers)


      fetch(baseUrl + url + (method == 'GET' && params ? queryString(params) : ''), fetchParams)
      .then((response) => initialResponse=response)
      .then((response) => {
          if (response.status != 204){
            return response.json()
          }
          else {
            return null
          }
        })
      .then((responseJson) => {

          //DEBUG -- REMOVE FOR RELEASE
          //console.log(response)

          console.log(initialResponse, responseJson)
          if (initialResponse.status == 200) {
            resolve(responseJson)
          }

          if (initialResponse.status == 204){
            resolve(responseJson)
          }

          else {
            reject({
              status: initialResponse.status,
              msg: responseJson.description,
            })
          }
        })
        .catch((error) => {
          console.log(error, initialResponse)
          if (!error.status) {
            reject({
              status: initialResponse.status,
              msg: error,
            })
          }
        })
    })
  }
}
