import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, Text, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { NavigationActions } from 'react-navigation';
import { width, height, iconImages, serverUrls, requiredList } from 'constants/config'
import { checkNextProps, connectWithNavigationIsFocused, getAuthHeader, initModels, cleanPhoneNumb } from 'utils'

import * as Models from 'models'

import fetchServ from 'actions/fetchServ'
import * as ApiUtils from 'actions/utils'

import Forms from './Forms';
import Buttons from './Buttons';
import Logo from './Logo';
import Background from './Background';

@connectWithNavigationIsFocused(
  state => ({
		authenticate: state.authenticate,
		userData: state.userData,
		parseToken: state.parseToken,
		settings: state.settings,
		getSettings: state.getSettings,
		setSettings: state.setSettings,
		getAllUsers: state.getAllUsers,
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
		actionSetLocalSettings: (data) => {
			dispatch(ApiUtils.setSettings(data))
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
    }
  })
)
export default class Login extends Component {
	constructor(props) {
		super(props);
		const { settings } = props

		const fields = {
			login: '',
			password: '',
			keepLogin: settings && settings.keepLogin || true
		}
		this.state = {
			fields,
      showEye: true,
			isLoading: false
		}
	}


	componentWillMount() {
		const { userData, actionParseToken, settings } = this.props
		if (settings && settings.keepLogin) {
			if (userData && userData.token) {
				this.setState({ isLoading: true }, () => {
					actionParseToken(getAuthHeader(userData.token))
				})
			}
		}
	}

	onLoginPress = () => {
		const { actionAuthenticate } = this.props
		const { fields } = this.state
		const { login, password } = fields
		this.setState({ isLoading: true }, () => {
			actionAuthenticate({
				client_short_code: "cstreet"
			}, getAuthHeader(login + ':' + password, true, 'Basic'))
		})
	}

	onSingUpPress = () => {
		this.props.navigation.navigate('SignUpStack');
	}

	onChangeText = (fieldName, value) => {
		const newStateFields = this.state.fields
		newStateFields[fieldName] = value
		this.setState({fields: newStateFields})
	}

  onEyePress= () => {
    this.setState({
      showEye: this.state.showEye == true? false : true
    })
  }

	onForgetPasswordPress = () => {
		const { navigation } = this.props
		navigation.navigate('ResetPasswordStack')
	}

	componentWillReceiveProps(nextProps) {

		const { navigation, setUserData, userData, actionParseToken, actionSetLocalSettings, actionGetSettings, actionSetSettings, actionGetNotifications } = this.props
		const { fields } = this.state
    const propsCheckerAuthenticate = checkNextProps(nextProps, this.props, 'authenticate')
    if (propsCheckerAuthenticate == 'error') {
			const error = nextProps.authenticate.error

			this.setState({
				isLoading: false,
			});

      if (error.status != 200){
        Alert.alert(error.msg)
      }

    }
    else if (propsCheckerAuthenticate == 'empty') {
      this.setState({
        isLoading: false,
      });
    }
    else if (propsCheckerAuthenticate && propsCheckerAuthenticate != 'empty') {
			const data = nextProps.authenticate.response
			setUserData({
				token: data.token
			})
			actionParseToken(getAuthHeader(data.token))
    }

		const propsCheckerParseToken = checkNextProps(nextProps, this.props, 'parseToken')
    if (propsCheckerParseToken == 'error') {

			const error = nextProps.parseToken.error

			this.setState({
				isLoading: false,
			});
      //if (error.msg != "Token has expired.") {
        //if (error.status == 500){
          //Alert.alert(error.msg)
        //}
		//	}
    }
    else if (propsCheckerParseToken == 'empty') {
      this.setState({
        isLoading: false,
      })
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
			} else {

				setUserData({userModel: data})
			}
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
    }
    else if (propsCheckerGetSettings == 'empty') {
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
    else if (propsCheckerGetSettings && propsCheckerGetSettings != 'empty') {
      const userId = nextProps.parseToken.response.user_uid
			const data = nextProps.getSettings.response
			setUserData({settings: data})
      this.setState({ isLoading: false }, () => {
				if (!this.goToMainBlock) {

					this.goToMainBlock = true
          this.props.navigation.dispatch(NavigationActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({ routeName: 'Main' })]
          }))
				}
			})
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
					if (fields.keepLogin) {
						actionSetLocalSettings({
							keepLogin: true
						})
					}
						if (nextProps.userData && nextProps.userData.userModel && !nextProps.userData.userModel.email) {
							const cleanedPhone = cleanPhoneNumb(fields.login || nextProps.userData.userModel.user)
							const findUserByPhone = nextProps.getAllUsers && nextProps.getAllUsers.response && nextProps.getAllUsers.response.find(user => user['2fa_mobile'] == cleanedPhone)
							if (findUserByPhone) {
								setUserData({userModel: {email: findUserByPhone.email}})
							} else {
								// actionGetAllUsers(getAuthHeader(nextProps.userData.token))
								//actionGetNotifications(nextProps.userData.userModel.user_uid)
							}
						} else {

              this.props.navigation.dispatch(NavigationActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: 'Main' })]
              }))
						}
				} else {
					if (userId) {

						actionGetSettings(userId)
					}
				}
			}
		}
		const propsCheckerGeNotifications = checkNextProps(nextProps, this.props, 'getNotifications', 'noway')
    if (nextProps.isFocused && propsCheckerGeNotifications == 'error') {
			const error = nextProps.getNotifications.error
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
    else if (propsCheckerGeNotifications && nextProps.isFocused) {
			const data = nextProps.getNotifications.response
			this.setState({ isLoading: false }, () => {
				if (!this.goToMainBlock) {
					this.goToMainBlock = true
          this.props.navigation.dispatch(NavigationActions.reset({
          index: 0,
          key: null,
          actions: [NavigationActions.navigate({ routeName: 'Main' })]
          }))
				}
			})
    }
	}

	onFieldChange = (fieldName, value) => {
		const newStateFields = this.state.fields
		if (typeof newStateFields[fieldName] == 'boolean') {
			newStateFields[fieldName] = !newStateFields[fieldName]
		} else {
			newStateFields[fieldName] = value
		}
		this.setState({fields: newStateFields})
	}

	render() {
		const { fields, isLoading } = this.state
		const signInDisabled = !Object.keys(fields).every(fieldKey => requiredList['signin'].includes(fieldKey)
			? !!fields[fieldKey]
			: true
		)

		return (
			<View style={styles.wrapper}>
				<Background />
				<KeyboardAwareScrollView keyboardShouldPersistTaps="always" enableOnAndroid={true} extraHeight={200} showsVerticalScrollIndicator={false}>
				<Logo />
				<Forms
					onSubmit={this.onLoginPress}
					fields={fields}
          isSecure={this.state.showEye}
          onEyePress={this.onEyePress}
					onChangeText={this.onFieldChange}/>
				<Buttons
					signInDisabled={signInDisabled}
					keepLogin={fields.keepLogin}
					onKeepLoginTrigger={() => this.onFieldChange('keepLogin')}
					onForgetPasswordPress={this.onForgetPasswordPress}
					onSignUpPress={this.onSingUpPress}
					onLoginPress={this.onLoginPress} />
				</KeyboardAwareScrollView>
        {
          isLoading
            ? <ActivityIndicator style={styles.loadingIndicator} animating={true}  color="#FFF" size="small"/>
            : null
        }
			</View>
		);
	}
}

const styles = StyleSheet.create({
  loadingIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 80
  },
  loadingIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
	wrapper: {
		backgroundColor: '#52C2E6',
		height: height(100),
		width: width(100)
	}
})
