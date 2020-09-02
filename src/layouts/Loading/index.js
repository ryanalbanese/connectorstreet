import React, { Component } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, Platform, ImageBackground, ActivityIndicator, AsyncStorage } from 'react-native'
import { NavigationActions } from 'react-navigation';

import { width, height, iconImages, serverUrls, requiredList } from 'constants/config'
import { checkNextProps, connectWithNavigationIsFocused, getAuthHeader, initModels, cleanPhoneNumb } from 'utils'

import * as Models from 'models'

import * as ApiUtils from 'actions/utils'
import fetchServ from 'actions/fetchServ'

@connectWithNavigationIsFocused(
  state => ({
		authenticate: state.authenticate,
		userData: state.userData,
    freshContacts: state.freshContacts,
		parseToken: state.parseToken,
		settings: state.settings,
		getSettings: state.getSettings,
		setSettings: state.setSettings,
		getAllUsers: state.getAllUsers,
    setPushNotifData: state.setPushNotifData,
    introductionById: state.introductionById,
		getNotifications: state.getNotifications
  }),
  dispatch => ({
    actionAuthenticate: (data, headers) => {
      dispatch(fetchServ(serverUrls.authenticate, data, headers, 'AUTHENTICATE'))
		},
		actionParseToken: (headers) => {
			dispatch(fetchServ(serverUrls.parseToken, null, headers, 'PARSETOKEN'))
		},
		setUserData: (data) => {
			dispatch(ApiUtils.setUserData(data))
		},
		setSettings: (data) => {
			dispatch(ApiUtils.setSettings(data))
		},
    setFreshContacts: (data) => {
			dispatch(ApiUtils.setFreshContacts(data))
		},
		actionGetSettings(userId) {
      dispatch(Models.settings.getSettings(userId))
		},
		actionSetSettings(userId, data) {
      dispatch(Models.settings.setSettings(userId, data))
		},
		// actionGetAllUsers: (headers) => {
		// 	dispatch(fetchServ(serverUrls.getAllUsers, null, headers, 'GETALLUSERS'))
		// },
		actionAddNotification: (userId, data) => {
      dispatch(Models.notification.addNotification(userId, data))
		},
		actionGetNotifications: (userId) => {
      dispatch(Models.notification.getNotifications(userId))
    },
    actionGetIntroductionById: (id) => {
      dispatch(Models.introduction.getIntroductionById(id))
    },
  })
)
export default class AddContactInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    }
  }

  _retrieveData = async () => {

    const {navigation} = this.props
      try {
        const value = await AsyncStorage.getItem('hasLoggedIn');

        if (value !== null) {

          if (value == 'true'){
            navigation.navigate('LoginScreen')
          }

          if (value == 'false'){
            navigation.navigate('SignUpStack')
          }
        }
        else {
          this._setLoginParam()
        }
      }
      catch (error) {
        console.log(error)
      }
    }

  _checkContactList = async () => {

    const {navigation} = this.props
      try {
        const value = await AsyncStorage.getItem('hasLoggedIn');

        if (value !== null) {

        }
      }
      catch (error) {
        console.log(error)
      }
    }

  _setLoginParam = async () => {
    const {navigation} = this.props
    try {
      await AsyncStorage.setItem('hasLoggedIn', 'false')
      navigation.navigate('LandingScreen')
      } catch (error) {
    }
  }

  componentWillMount() {

    const { userData, actionParseToken, settings, navigation, setPushNotifData, actionGetIntroductionById } = this.props

    if (userData && userData.token) {
      this.setState({ isLoading: true }, () => {
        actionParseToken(getAuthHeader(userData.token))
      })
    }
    else {

      this._retrieveData()
      // Check if user has logged in before.
    }
  }


  componentWillReceiveProps(nextProps) {

		const { navigation, setUserData, userData, actionParseToken, setSettings, actionGetSettings, actionSetSettings, actionGetNotifications, actionGetIntroductionById, setPushNotifData } = this.props
		const { fields } = this.state

    const goToLogin = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'LoginStack'})],
      key: null
    })

    const propsCheckerAuthenticate = checkNextProps(nextProps, this.props, 'authenticate')
    if (propsCheckerAuthenticate && nextProps.isFocused == 'error') {
			const error = nextProps.authenticate.error
			this.setState({
				isLoading: false,
			});
			if (error) {
				navigation.navigate('LoginStack')
			}
    }
    else if (propsCheckerAuthenticate && propsCheckerAuthenticate != 'empty') {
			const data = nextProps.authenticate.response
			setUserData({
				token: data.token
			})
			actionParseToken(getAuthHeader(data.token))
    }
    else if (propsCheckerAuthenticate == 'empty') {
      this.setState({
        isLoading: false,
      });
		}

		const propsCheckerParseToken = checkNextProps(nextProps, this.props, 'parseToken')
    if (propsCheckerParseToken == 'error') {
			const error = nextProps.parseToken.error
			this.setState({
				isLoading: false,
			});
      if (error.msg != "Token has expired.") {
				//Alert.alert(error.msg)
			}
      else if (error.msg == "Token has expired."){
        Alert.alert('Your session has expired. Please login again.', null, [
          {text: 'Login', onPress: () => navigation.dispatch(goToLogin)}
        ])
      }
			navigation.navigate('LoginStack')
    }
    else if (propsCheckerParseToken && propsCheckerParseToken != 'empty') {
			const data = nextProps.parseToken.response
			if (Object.keys(data).map(userDataKey => userData.userModel[userDataKey] == data[userDataKey]).every(item => item) && Object.keys(data).length == Object.keys(userData.userModel).length) {
				const token = nextProps.userData.token
				const userId = nextProps.userData.userModel.user_uid
				if (token) {
					initModels(Models, token)

					actionGetSettings(userId)
				}
			}
      else {
				setUserData({userModel: data})
			}
    }
    else if (propsCheckerParseToken == 'empty') {
      this.setState({
        isLoading: false,
			})
		}

		const propsCheckerGetSettings = checkNextProps(nextProps, this.props, 'getSettings')
    if (propsCheckerGetSettings == 'error') {
			const error = nextProps.getSettings.error
			this.setState({
				isLoading: false,
      }, () => {
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      });
    } else if (propsCheckerGetSettings && propsCheckerGetSettings != 'empty') {

      const userId = nextProps.parseToken.response.user_uid
			const data = nextProps.getSettings.response
			setUserData({settings: data})
    } else if (propsCheckerGetSettings == 'empty') {
			const userId = nextProps.parseToken.response.user_uid
			actionSetSettings(
				userId,
				{
					emailNotif: true,
					pushNotif: true,
					textNotif: true,
				}
			)
		}

		const propsCheckerSetSettings = checkNextProps(nextProps, this.props, 'setSettings')
    if (propsCheckerSetSettings == 'error') {
			const error = nextProps.setSettings.error
			this.setState({
				isLoading: false,
      }, () => {
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      });
    }
    else if (propsCheckerSetSettings) {
			const userId = nextProps.parseToken.response.user_uid

			actionGetSettings(userId)
    }

		const propsCheckerUserData = checkNextProps(nextProps, this.props, 'userData', null, true)
		if (propsCheckerUserData && propsCheckerUserData != 'empty') {
			const token = nextProps.userData.token
			const userId = nextProps.userData.userModel.user_uid
			if (token) {
				initModels(Models, token)
				if (nextProps.userData.settings && Object.keys(nextProps.userData.settings).length && nextProps.userData.userModel && Object.keys(nextProps.userData.userModel).length) {

          const hasPush = setPushNotifData && setPushNotifData.data && setPushNotifData.data.pushNotif

          const payload = setPushNotifData && setPushNotifData.data.additionalData

          const type = setPushNotifData && setPushNotifData.data.additionalData && setPushNotifData.data.additionalData.type

          const id = setPushNotifData && setPushNotifData.data.additionalData && setPushNotifData.data.additionalData

						if (nextProps.userData && nextProps.userData.userModel && !nextProps.userData.userModel.email) {

              if (hasPush){

                  navigation.navigate('PushNotification', {additionalData : id})
              }
              else {
                this.setState({ isLoading: false }, () => {
                  this.props.navigation.dispatch(NavigationActions.reset({
                  index: 0,
                  key: null,
                  actions: [NavigationActions.navigate({ routeName: 'Main' })]
                  }))
          			})
              }
						}
            else {

              if (hasPush){
                  navigation.navigate('Notifications', {pushNotif: true, id : id, type: type})
              }
              else {
                this.setState({ isLoading: false }, () => {
                  this.props.navigation.dispatch(NavigationActions.reset({
                  index: 0,
                  key: null,
                  actions: [NavigationActions.navigate({ routeName: 'Main' })]
                  }))
          			})
              }

						}

				} else {
					if (userId) {

						actionGetSettings(userId)
					}
				}
			}
		}

	}

  render() {
    const { navigation } = this.props
    const { isLoading } = this.state
    return (
      <View style={styles.wrapper} contentContainerStyle={styles.contentContainerStyle}>
				<ImageBackground source={iconImages.splash} style={{ flex: 1 }}>
        <ActivityIndicator style={styles.loadingIndicator} animating={true}  color="#FFFFFF" size="large"/>
				</ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    height: height(100),
  },
  loadingIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 80
  },
})
