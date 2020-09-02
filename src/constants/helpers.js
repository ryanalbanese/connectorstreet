import Permissions from 'react-native-permissions'
import {Alert, Linking} from 'react-native'

const showAlert = (permission) => {
  Alert.alert(
   `Permission required`, `You need to enable the ${permission} permission in your settings.`,
   [{text: 'Go to settings',  style: 'cancel', onPress: () => {Linking.openSettings()}},
   {text: 'Cancel',  style: 'cancel'}], { cancelable: true }
  )
}

const requestPermission = async (permission) => {
  const request = await Permissions.request(permission).then(response => {
    return response
  })
  return request
}

export const checkRequestPermission = async (permission) => {
  const permissionCheck = await Permissions.check(permission).then(response => {
    if (response == 'undetermined'){
      requestPermission(permission).then(response => {
      })
    }
    if (response == 'denied'){
      showAlert(permission)
      return response
    }
    else {
      return response
    }
  })
  return permissionCheck
}
