import React, { Component } from 'react';
import { connectWithNavigationIsFocused, checkNextProps } from 'utils'
import * as Models from 'models'
import * as ApiUtils from 'actions/utils'

@connectWithNavigationIsFocused(
  state => ({
    getNotifications: state.getNotifications
  }),
  dispatch => ({
    setPushNotifData: (data) => {
      dispatch(ApiUtils.setPushNotifData(data))
    },
  })
)

export default class PushNotification extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {

    const {navigation, setPushNotifData } = this.props
    
    // Reset Push Notification Data

    setPushNotifData('')

    // Handle incoming data

    let id = this.props.navigation.state.params.additionalData

    // Navigate to corresponding screen

    navigation.navigate('Notifications', {pushNotif: true, id : id})

  }

  render() {
    return null
  }
}
