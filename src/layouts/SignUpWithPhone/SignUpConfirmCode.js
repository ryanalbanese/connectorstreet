import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Keyboard, Alert, ActivityIndicator, Platform } from 'react-native'
import { connect } from 'react-redux'
import { NavigationActions } from 'react-navigation';
import { width, height, iconImages, serverUrls, getBackgroundImageByType, getColorByType, getButtonBackgroundImageByType, isIphoneX, defaultImageBase64 } from 'constants/config'
import { connectWithNavigationIsFocused, checkNextProps, getAuthHeader, filterWhiteList, filterBlackList, fullCleanPhone, initModels } from 'utils'

import * as Models from 'models'

import * as ApiUtils from 'actions/utils'

import NavBar from 'components/NavBar'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import ThreeImages from 'components/ThreeImages'
import BigTextInput from 'components/BigTextInput'
import RoundedBtn from 'components/RoundedBtn'
import StdBtn from 'components/StdBtn'

@connectWithNavigationIsFocused(
  state => ({
    validateToken: state.validateToken,
    getSettings: state.getSettings,
    userData: state.userData,
    setSettings: state.setSettings,
    authenticate: state.authenticate,
    parseToken: state.parseToken,
    updateSettings: state.updateSettings,
    getAllUsers: state.getAllUsers,
    getNotifications: state.getNotifications,
    setUserPushIds: state.setUserPushIds,
    uploadImage: state.uploadImage,
    createUser: state.createUser
  }),
  dispatch => ({
    actionValidateToken: (data, headers) => {
      dispatch(fetchServ(serverUrls.validateToken, data, headers, 'VALIDATETOKEN'))
    },
    actionParseToken: (headers) => {
			dispatch(fetchServ(serverUrls.parseToken, null, headers, 'PARSETOKEN'))
    },
    setUserData: (data) => {
			dispatch(ApiUtils.setUserData(data))
    },
    actionSetSettings(userId, data) {
      dispatch(Models.settings.setSettings(userId, data))
    },
    actionGetSettings(userId) {
      dispatch(Models.settings.getSettings(userId))
    },
    actionUpdateUser(userId, keyValue, headers) {
      dispatch(fetchServ({...serverUrls.updateUser, url: serverUrls.updateUser.url + '/' + userId}, keyValue, headers, 'UPDATEUSER'))
    },
    actionAuthenticate: (data, headers) => {
      dispatch(fetchServ(serverUrls.authenticate, data, headers, 'AUTHENTICATE'))
    },
    actionCreateUser: (data, headers) => {
      dispatch(fetchServ(serverUrls.createUser, data, headers, 'CREATEUSER'))
    },
    actionUploadImage(data, headers) {
      dispatch(fetchServ(serverUrls.uploadImage, data, headers, 'UPLOADIMAGE'))
    },
    actionGetNotifications: (userId) => {
      dispatch(Models.notification.getNotifications(userId))
    },
    actionInviteUser: (data, headers) => {
			dispatch(fetchServ(serverUrls.inviteUser, data, headers, 'INVITEUSER'))
    }
  })
)
export default class SignUpConfirmCode extends Component {

  constructor(props) {
    super(props);
    const fields = {
      code0: '',
      code1: '',
      code2: '',
      code3: '',
      code4: '',
      code5: '',
      code6: '',
    }
    this.state = {
      fields,
      isLoading: false
    }
  }

  componentWillMount() {

    const {navigation} = this.props

  }

  requestValidateToken = () => {
    const { navigation, actionValidateToken } = this.props
    const { fields } = this.state
    const navParams = navigation.state.params

    if (navParams && navParams.fields) {
      console.log(navParams.fields)
      this.setState({
				isLoading: true,
      }, () => {
        actionValidateToken({
          ...navParams.fields,
          mfa_token: fields.code,
          client_short_code: 'cstreet',
          nickname: navParams.fields.nickName || navParams.fields.fName + ' ' + navParams.fields.sName,
          role: 'User'
        })
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { navigation, actionSetSettings, actionGetSettings, actionUpdateSettings, setUserData, actionParseToken, actionAuthenticate, actionGetNotifications, actionUploadImage, createUser } = this.props
    const navParams = navigation.state.params

    if (this.props.isFocused || nextProps.currentRoute == 'SignUpConfirmCode'){
      const propsCheckercreateUser = checkNextProps(nextProps, this.props, 'createUser')
      if (propsCheckercreateUser == 'error') {
        const error = nextProps.createUser.error
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      }
      else if (propsCheckercreateUser) {
        this.setState({ isLoading: false }, () => {
    			Alert.alert('Verification code resent')
        })

      }


    const propsCheckerValidateToken = checkNextProps(nextProps, this.props, 'validateToken')
    if (propsCheckerValidateToken == 'error') {
      const error = nextProps.validateToken.error
      Alert.alert(error.msg, null, [
        {text: 'OK', onPress: () => navigation.goBack()}
      ], {
        onDismiss: () => navigation.goBack()
      })
    }
    else if (propsCheckerValidateToken) {
      actionAuthenticate({
        client_short_code: "cstreet"
      }, getAuthHeader(fullCleanPhone(navParams.fields.phone) + ':' + navParams.fields.password, true, 'Basic'))
    }

    const propsCheckerAuthenticate = checkNextProps(nextProps, this.props, 'authenticate')
    if (propsCheckerAuthenticate == 'error') {
			const error = nextProps.authenticate.error
			this.setState({
				isLoading: false,
			});
			if (error.msg != "Token has expired.") {
				Alert.alert(error.msg)
			}
    }
    else if (propsCheckerAuthenticate && propsCheckerAuthenticate != 'empty') {
      const data = nextProps.authenticate.response
      if (data.token) {
        initModels(Models, data.token)
        actionParseToken(getAuthHeader(data.token))
      }
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
				Alert.alert(error.msg)
			}
    }
    else if (propsCheckerParseToken && propsCheckerParseToken != 'empty') {
			const data = nextProps.parseToken.response
      const userId = data.user_uid
      actionGetSettings(userId)
      // if current data is same
			// if (nextProps.userData && nextProps.userData.userModel && Object.keys(data).map(userDataKey => nextProps.userData.userModel[userDataKey] == data[userDataKey]).every(item => item) && Object.keys(data).length == Object.keys(nextProps.userData.userModel).length) {

			// } else {

			// }
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
      }
    else if (propsCheckerGetSettings && propsCheckerGetSettings != 'empty') {
      const userId = nextProps.parseToken.response.user_uid
      const settings = nextProps.getSettings.response
      const imageData = navParams.fields.avatarSource.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', '') || defaultImageBase64.replace('data:image/png;base64,', '')
      if (imageData) {
        actionUploadImage({
          image: imageData,
          type: navParams.fields.avatarExtension || 'png'
        }, getAuthHeader(nextProps.authenticate.response.token))
      } else {
        setUserData({ settings: nextProps.getSettings.response, userModel: {...nextProps.parseToken.response, avatar: ''}, token: nextProps.authenticate.response.token })
      }
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
      const settings = nextProps.getSettings.response
      const userId = nextProps.parseToken.response.user_uid
      actionGetSettings(userId)
    }

    const propsCheckerUpdateSettings = checkNextProps(nextProps, this.props, 'updateSettings')
    if (propsCheckerUpdateSettings == 'error') {
			const error = nextProps.updateSettings.error
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
    else if (propsCheckerUpdateSettings) {
      const settings = nextProps.getSettings.response
      const imageData = navParams.fields.avatarSource.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', '') || defaultImageBase64.replace('data:image/png;base64,', '')
      if (imageData) {
        actionUploadImage({
          image: imageData,
          type: navParams.fields.avatarExtension || 'png'
        }, getAuthHeader(nextProps.authenticate.response.token))
      } else {
        setUserData({ settings: nextProps.getSettings.response, userModel: {...nextProps.parseToken.response, avatar: ''}, token: nextProps.authenticate.response.token })
      }
    }

    const propsCheckerUploadImage = checkNextProps(nextProps, this.props, 'uploadImage')
    if (propsCheckerUploadImage == 'error') {
			const error = nextProps.uploadImage.error
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
    else if (propsCheckerUploadImage && propsCheckerUploadImage != 'empty') {
      const data = nextProps.uploadImage.response
      setUserData({ settings: nextProps.getSettings.response, userModel: {...nextProps.parseToken.response, avatar: data.avatar_url}, token: nextProps.authenticate.response.token })
    }
    else if (propsCheckerUploadImage == 'empty') {
      setUserData({ settings: nextProps.getSettings.response, userModel: {...nextProps.parseToken.response}, token: nextProps.authenticate.response.token })
    }

    const propsCheckerUserData = checkNextProps(nextProps, this.props, 'userData', null, true)
    if (propsCheckerUserData && propsCheckerUserData != 'empty') {

      this.props.navigation.dispatch(NavigationActions.reset({
      index: 0,
      key: null,
      actions: [NavigationActions.navigate({ routeName: 'Walkthrough' })]
      }))
    }

    const propsCheckerGeNotifications = checkNextProps(nextProps, this.props, 'getNotifications')
    if (propsCheckerGeNotifications == 'error') {
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
    else if (propsCheckerGeNotifications) {
      const data = nextProps.getNotifications.response
      this.setState({ isLoading: false }, () => {

			})
    }

  }

	}

  onFieldChange = (fieldName, value) => {
    const { navigation } = this.props
    let newStateFields = this.state.fields
    newStateFields[fieldName] = value
    this.setState({fields: newStateFields}, () => {
      if (value.length >= 7) {
        Keyboard.dismiss()
        this.requestValidateToken()
      }
    })
  }

  onAddAvatarPress = () => {

  }

  confirm = () => {
    const { navigation } = this.props
   actionInviteUser({
      fPersonfName : navigation.state.params.fields.fname,
      fPersonlName : navigation.state.params.fields.fname,
      emailTemplate: 'cs-welcome.html',
    }, getAuthHeader(userData.token))

    this.props.navigation.dispatch(NavigationActions.reset({
    index: 0,
    key: null,
    actions: [NavigationActions.navigate({ routeName: 'Page1' })]
    }))

  }

  resend = () => {
    const { navigation, actionCreateUser } = this.props
    const navParams = navigation.state.params
		const { fields  } = this.state
		this.setState({ isLoading: true }, () => {
			actionCreateUser({
				"phone": navParams.fields.phone,
				"email": navParams.fields.email
			})
		})
  }

  render() {
    const { navigation } = this.props
    const { fields, isLoading } = this.state
    const navParams = navigation.state.params
    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        action: () => navigation.goBack()
      },
      centerPart: {
        text: 'Verify Phone Number'
      },
    }
    return (
      <View style={styles.wrapper}>
        <NavBar {...navBarProps} navBarBackgroundImage={iconImages.navBarBackgroundImageGreen} navigation={navigation} />
        <KeyboardAvoidingView style={styles.content} keyboardVerticalOffset={width(4)} behavior='padding'>
          <View style={styles.topPartWrapper}>
            <View style={styles.textsWrapper}>
              <Text style={styles.title}>
                Enter confirmation code
              </Text>
              <Text style={styles.text}>
                Enter the 7 digit code we sent to {navParams.fields.phone}
              </Text>
            </View>
            <View style={styles.inputWrapper}>
              <StdInput
                {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}
                refName={comp => this['code'] = comp}
                value={fields.code}
                keyboardType='numeric'
                placeholderTextColor="#7F7F7F"
                inputStyle={{
                  color: '#000000',
                  fontSize: width(5),
                  textAlign: 'center',
                  borderBottomWidth: width(.4),
                  paddingBottom: width(0),
                  height: width(15),
                  borderBottomColor: '#cccccc'
                }}
                onChangeText={text => this.onFieldChange('code', text)} />
            </View>
          </View>
          <View style={styles.bottomPartWrapper}>
          <Text style={styles.codeText}>Didn't receive a confirmation code?</Text>
            <View style={styles.roundBtnWrapper}>
              <RoundedBtn
                innerStyle={{
                  height: width(9),
                  width: width(60),
                  borderRadius: width(8),
                  borderWidth: 0,
                }}
                textStyle={{
                  color: 'white',
                  fontSize: width(3),
                  marginTop: 0
                }}
                onPress={this.resend}
                backgroundColor="#8D8D8D"
                text="Resend" />
            </View>
          </View>
        </KeyboardAvoidingView>
        {
          isLoading
            ? <ActivityIndicator style={styles.loadingIndicator} animating={true}  color="#3E3E3E" size="small"/>
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
    top: 100,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrapper: {
    backgroundColor: 'white',
    height: height(100)
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    maxHeight: isIphoneX()
      ? height(85)
      : 'auto'
  },
  codeText: {
    fontSize: width(3.5),
    color: '#646464',
    textAlign: 'center'
  },
  topPartWrapper: {
    width: width(80),
    flex: 1
  },
  textsWrapper: {
    width: '100%',
    alignItems: 'center'
  },
  title: {
    fontSize: width(4),
    fontWeight: '400',
    color: '#646464',
    marginTop: width(6),
    lineHeight: width(6),
    textAlign: 'center'
  },
  text: {
    fontSize: width(3),
    color: '#646464',
    marginTop: width(6),
    marginBottom: width(3),
    lineHeight: width(6),
    textAlign: 'center'
  },
  inputsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: width(6),
    height: width(18)
  },
  inputWrapper: {
    marginTop: 40,
    width: '100%'
  },
  bottomPartWrapper: {
    width: '100%',
    alignItems: 'center'
  },
  roundBtnWrapper: {
    marginVertical: width(4)
  },
})
