import React, { Component } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, Keyboard, Platform, Alert, TouchableWithoutFeedback, KeyboardAvoidingView, ActivityIndicator, TextInput, Button } from 'react-native'
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux'

import OneSignal from 'react-native-onesignal';
import moment from 'moment'
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory';
import { width, height, iconImages, getBackgroundImageByType, getColorByType, getButtonBackgroundImageByType, isIphoneX, serverUrls, appVersion} from 'constants/config'
import { checkNextProps, connectWithNavigationIsFocused, filterBlackList, getAuthHeader, getUserModel } from 'utils'

import * as ApiUtils from 'actions/utils'
import * as Models from 'models'

import NavBar from 'components/NavBar'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import ThreeImages from 'components/ThreeImages'
import RoundedBtn from 'components/RoundedBtn'
import StdBtn from 'components/StdBtn'
import BigTextInput from 'components/BigTextInput'
import DefaultMessagesList from 'components/DefaultMessagesList'
import SmallRoundBtn from 'components/SmallRoundBtn'

@connectWithNavigationIsFocused(
  state => ({
    makeIntroductionData: state.makeIntroductionData,
    userData: state.userData,
    makeIntroduction: state.makeIntroduction,
    addNotification: state.addNotification,
    savedMessages: state.savedMessages,
    showSavedMessages: state.showSavedMessages,
    getUsersPushIds: state.getUsersPushIds,
    updateCustomMessages: state.updateCustomMessages,
    getUserCustomMessages: state.getUserCustomMessages,
    setCustomMessages: state.setCustomMessages,
    getUsersSettings: state.getUsersSettings,
    gotCustomMessages: state.gotCustomMessages,
    connect: state.connect
  }),
  dispatch => ({
    setMakeIntroductionData: (data) => {
      dispatch(ApiUtils.setMakeIntroductionData(data))
    },
    resetMakeIntroductionData: () => {
      dispatch(ApiUtils.resetMakeIntroductionData())
    },
    actionMakeIntroduction: (id, data) => {
      dispatch(Models.introduction.makeIntroduction(id, data))
    },
    actionUpdateIntroduction: (id, data) => {
      dispatch(Models.introduction.updateIntroduction(id, data))
    },
    addNewMessage: (data) => {
      dispatch(ApiUtils.addNewMessage(data))
    },
    actionGetCustomMessages: (userId) => {
      dispatch(Models.messages.getUserCustomMessages(userId))
    },
    actionUpdateCustomMessages: (userId, keyValue) => {
      dispatch(Models.messages.updateCustomMessages(userId, keyValue))
    },
    actionAddCustomMessages: (userId, keyValue) => {
      dispatch(Models.messages.setCustomMessages(userId, keyValue))
    },
    actionAddNotification: (userId, data) => {
      dispatch(Models.notification.addNotification(userId, data))
    },
    actionGetUsersPushIds: (userIds) => {
      dispatch(Models.pushIds.getUsersPushIds(userIds))
    },
    actionGetUsersSettings: (userIds) => {
      dispatch(Models.settings.getUsersSettings(userIds))
    },
    actionConnect: (data, headers) => {
      return new Promise((resolve, reject) => {
        dispatch(
          fetchServ(
            serverUrls.connect,
            data,
            headers,
            'CONNECT',
            true)
          )
        .then((result) => {
          resolve(result)
        })
        .catch((error) => {
          reject(error)
        })
      })
    },
    actionInviteUser: (data, headers) => {
			dispatch(fetchServ(serverUrls.inviteUser, data, headers, 'INVITEUSER'))
    },
  })
)
export default class SelectAndEditMsg extends Component {
  constructor(props) {
    super(props);
    const { makeIntroductionData, savedMessages } = this.props
    const { otherData } = makeIntroductionData
    let savedMessagesArr = []
    savedMessages.data.map((item, index) => {
      if (item.type === 'introduced'){
        savedMessagesArr.push(item.value)
      }
    })

    const fields = {
      message: '',
      editedMessage: ''
    }
    this.state = {
      fields,
      linesCount: 1,
      savedMessages: savedMessagesArr,
      inputIsFocused: false,
      keyboardIsOpened: false,
      isLoading: false,
      messageIsSaved: false,
      hasCustomMessages: false,
      addKeyRecord: false,
      showSavedMessages: false,
      currentPushId: '',
      customMessages: []
    }
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove();
  }

  componentWillMount() {
    const { userData, getUserCustomMessages, actionGetCustomMessages,savedMessages,actionGetUsersPushIds, navigation } = this.props
    let mateUserModel = getUserModel(userData, navigation.state.params.detailsData)
    actionGetCustomMessages(navigation.state.params.userTo.user_uid)
    actionGetUsersPushIds([navigation.state.params.userTo.user_uid])
  }

  componentWillReceiveProps(nextProps, state) {

    const { userData, navigation, makeIntroductionData, actionGetUsersSettings, setCustomMessages, updateCustomMessages, actionUpdateCustomMessages,getUserCustomMessages, actionGetCustomMessages, actionAddCustomMessages, actionAddNotification } = this.props

    const propsCheckerUpdateCustomMessages = checkNextProps(nextProps, this.props, 'updateCustomMessages', 'anyway')

    const propsCheckerSetCustomMessages = checkNextProps(nextProps, this.props, 'setCustomMessages', 'anyway')

    const propsCheckerGetUserCustomMessages = checkNextProps(nextProps, this.props, 'getUserCustomMessages', 'anyway')

    const propsCheckerAddNotification = checkNextProps(nextProps, this.props, 'addNotification', 'anyway')

    if (propsCheckerAddNotification === 'empty'){
      this.setState({
        isLoading: false,
      }, ()=>{
        Alert.alert('Message sent successfully!', null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => {
            navigation.goBack()
          }
        })
      })
    }
    if (nextProps.getUserCustomMessages.error){

      this.setState({addKeyRecord: true})

    }

    if (nextProps.getUserCustomMessages.hasSavedMessages){

      this.setState({hasCustomMessages: true})

    }

    else {

      this.setState({hasCustomMessages: false})

    }

    const propsCheckerGetUsersPushIds = checkNextProps(nextProps, this.props, 'getUsersPushIds', 'anyway')

    if (propsCheckerGetUsersPushIds == 'error') {
			const error = nextProps.getUsersPushIds.error
			this.setState({
				isLoading: false,
      }, () => {
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      })
    }

    else if (propsCheckerGetUsersPushIds && propsCheckerGetUsersPushIds != 'empty') {

      const data = nextProps.getUsersPushIds.response

      const detailsData = navigation.state.params.detailsData

      this.setState({
        currentPushId: data[0].userId,
      }, () => {
      })

    }

    else if (propsCheckerGetUsersPushIds == 'empty') {

		}

    const propsCheckerGetUsersSettings = checkNextProps(nextProps, this.props, 'getUsersSettings', 'anyway')

    if (propsCheckerGetUsersSettings == 'error') {
			const error = nextProps.getUsersSettings.error
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

    else if (propsCheckerGetUsersSettings && propsCheckerGetUsersSettings != 'empty') {

      const usersPushIds = nextProps.getUsersPushIds.response
      const usersSettings = nextProps.getUsersSettings.response

      const { fPerson, sPerson, otherData } = makeIntroductionData
      const registeredUsersArray = [fPerson, sPerson].filter(item => item.userId)

        /*if (usersPushIds && usersSettings) {
        usersPushIds.forEach(userPushId => {
          const findUserForPushId = registeredUsersArray.find(personData => userPushId.id.indexOf(personData.userId) != -1)

          if (findUserForPushId) {
            const findUserForSettings = usersSettings.find(userSettings => userSettings.id.indexOf(findUserForPushId.userId) != -1)

            if (findUserForSettings) {
              const findOtherUser = [fPerson, sPerson].find(personData => findUserForPushId.userId != personData.userId)

              if (findUserForSettings.pushNotif) {
                let otherParameters = {'ios_badgeType':'Increase','ios_badgeCount':'1'};
                let contents = {
                  'en': nextProps.userData.userModel.firstName + ' ' + nextProps.userData.userModel.lastName + ' wants you to meet ' + findOtherUser.fName + ' ' + findOtherUser.sName
                }

                OneSignal.postNotification(contents, {}, userPushId.userId, otherParameters);
              }
            }
          }
        })
      }*/
    }

    else if (propsCheckerGetUsersSettings == 'empty') {

		}

  }

  _keyboardDidShow = () => {
    this.setState({keyboardIsOpened: true})
  }

  _keyboardDidHide = () => {
    this.setState({keyboardIsOpened: false})
  }

  onFieldChange = (fieldName, value) => {
    const {setMakeIntroductionData} = this.props
    let newStateFields = this.state.fields
    newStateFields[fieldName] = value
    setMakeIntroductionData({
      otherData: {
        message: value
      }
    })
    this.setState({fields: newStateFields})
  }

  confirm = () => {
    const { navigation, resetMakeIntroductionData } = this.props
    navigation.navigate('MakeIntroSent')
  }

  onContentSizeChange = (linesCount) => {
    if (linesCount >= 7) return
    if(linesCount >= 8) {
      this.setState({linesCount: linesCount-1})
    } else {
      this.setState({linesCount: linesCount || 1})
    }
  }

  sendData = () => {
    const { navigation, actionUpdateIntroduction, actionAddNotification, userData, resetMakeIntroductionData, } = this.props
    const { fields } = this.state
    const { editedMessage } = fields
    const detailsData = navigation.state.params.detailsData
    let mateUserModel = ''
    this.setState({
      isLoading: true
    })
    const fromIntroducer = navigation.state && navigation.state.params.fromScreen

    if (!fields.editedMessage){
      Alert.alert('Please select or create a message')
      return false
    }

    if (fromIntroducer && fromIntroducer === 'sendIntroducerMessage'){
       mateUserModel = navigation.state.params.detailsData.userBy
    }
    else {
       mateUserModel = getUserModel(userData, navigation.state.params.detailsData)
    }

    if (mateUserModel) {
      const notificationObject = {
        type: 'message',
        userTo: mateUserModel,
        userIdBy: userData.userModel.user_uid,
        userBy: userData.userModel,
        message: fields.editedMessage,
        userIdTo: mateUserModel.userId,
        relationType: navigation.state.params.detailsData.relationType,
        appVersion: appVersion
      }

    if (mateUserModel.userId) {
            let otherParameters = {'ios_badgeType':'Increase','ios_badgeCount':'1'};
            let contents = {
              'en': userData.userModel.firstName + ' ' + userData.userModel.lastName + ' sent you a message.'
            }

        let notificationId = mateUserModel.userId + '_' + userData.userModel.user_uid + '_' + moment().unix()
            actionAddNotification(notificationId, {
              ...notificationObject
            })

            let pushData = {
              'notifID' :  'notification_'+notificationId,
              'type' : 'message'
            }

            //OneSignal.postNotification(contents, pushData, this.state.currentPushId, otherParameters);

      }
    }

    resetMakeIntroductionData()

  }

  onFocusInput = () => {
    this.setState({inputIsFocused: true})
  }

  onBlurInput = () => {
    this.setState({inputIsFocused: false})
  }

  messageItemPress = (item) => {

    this.onFieldChange('editedMessage', item)


  }

  saveToLibrary = () => {

    const { navigation, userData, actionAddCustomMessages, getUserCustomMessages, actionUpdateCustomMessages, actionGetCustomMessages} = this.props

    const { fields } = this.state

    let messageArr = []

    if (getUserCustomMessages.response !=''){

      messageArr = getUserCustomMessages.response

    }

    if (this.state.addKeyRecord){

      actionAddCustomMessages(userData.userModel.user_uid)

    }

    if (!fields.editedMessage == ''){

      messageArr.push(fields.editedMessage)

      actionUpdateCustomMessages(userData.userModel.user_uid, messageArr)

      this.setState({messageIsSaved: true, hasCustomMessages: true})

    }


  }

  fPersonEdit = () => {

    const {navigation, makeIntroductionData} = this.props

    navigation.navigate('AddCustomContact', {personKey: 'fPerson', contactInfo: makeIntroductionData.fPerson, fromScreen: 'SelectAndEditMessage'})

  }

  sPersonEdit = () => {

    const {navigation, makeIntroductionData} = this.props

    navigation.navigate('AddCustomContact', {personKey: 'sPerson', contactInfo: makeIntroductionData.sPerson, fromScreen: 'SelectAndEditMessage'})

  }

  showSavedMessages = () => {

    const {navigation, state} = this.props

    this.setState({ showSavedMessages: true })


  }

  showDefaultMessages = () => {

    const {navigation, state} = this.props

    this.setState({ showSavedMessages: false })


  }

  render() {
    const { navigation, makeIntroductionData, actionGetUsersSettings, getUserCustomMessages, resetMakeIntroductionData, fPersonSend, showDefaultMessages, userData} = this.props
    const { otherData } = navigation.state && navigation.state.params.detailsData.relationType
    const { fields, linesCount, keyboardIsOpened, isLoading, messageIsSaved, inputIsFocused, hasCustomMessages, showSavedMessages, savedMessages } = this.state
    const { message, editedMessage } = fields
    const fromIntroducer = navigation.state && navigation.state.params.fromScreen
    let mateUserModel = ''
    if (fromIntroducer && fromIntroducer === 'sendIntroducerMessage'){
       mateUserModel = navigation.state.params.detailsData.userBy
    }
    else {
       mateUserModel = getUserModel(userData, navigation.state.params.detailsData)
    }

    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        buttonText: '',
        action: () => navigation.goBack()
      },
      centerPart: {
        text: 'Send a message to '+mateUserModel.fName+''
      },
      rightPart: {
        image: iconImages.homeWhite,
        action: () => {
          let action;
          resetMakeIntroductionData()
          action = NavigationActions.reset({
            index: 0,
            actions: [

              NavigationActions.navigate({ routeName: 'Main'})
            ],
           key:null
          })
          navigation.dispatch(action)
        }
      }
    }
    const initialWrapperWidth = Platform.OS == 'ios'
      ? isIphoneX()
          ? width(68)
          : width(68)
      : width(58)
    const initialTopPartWrapperHeight = Platform.OS == 'ios'
      ? isIphoneX()
          ? width(80) // 116
          : width(72)
      : width(62)
    const userAvatar = userData && userData.userModel && userData.userModel.avatar
    return (
      <View style={styles.wrapper}>
          <View style={styles.topPartWrapper}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={{flex:1}}>
              <View style={styles.headerWrapper}>
                <ImageBackground source={getBackgroundImageByType(otherData)} style={styles.topPart}>
                  <NavBar {...navBarProps} statusBarBackgroundColor={getColorByType(otherData)} transparent navigation={navigation} />
                  <View style={styles.topPartContent}>

                    <View style={styles.row}>


                      <View style={styles.personItem}>
                        <View style={styles.avatarImageWrapper}>
                          <Image resizeMethod="scale" source={mateUserModel && mateUserModel.avatar && {uri:  mateUserModel.avatar} || iconImages.avatarPlaceholder} style={styles.avatarImage} />
                        </View>
                        <Text style={styles.personName}>
                        {fromIntroducer
                        ? mateUserModel && (mateUserModel.firstName + ' ' + mateUserModel.lastName)
                        : mateUserModel && (mateUserModel.fName + ' ' + mateUserModel.sName)
                        }

                        </Text>
                      </View>


                    </View>

                  </View>
                </ImageBackground>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <Sep />
          <KeyboardAvoidingView style={styles.keyWrapper}>

          {
             showSavedMessages?
              <View style={styles.content}>
                <View style={styles.topContentPart}>
                  <View style={styles.textsWrapper}>

                    <View style={styles.messagesListWrapperLast}>
                      <View style={styles.messageListPadding}>

                      <DefaultMessagesList
                        onPressItem={this.messageItemPress}
                       data={getUserCustomMessages.response}
                       headerText={
                        'Select the message below or create your own.'
                       }
                       headerText1={'It will disappear from your phone after sending.'}
                       />
                    </View>
                  </View>
                  </View>
                </View>
              </View>
              : null
            }
            {
               !showSavedMessages?
                <View style={styles.content}>
                  <View style={styles.topContentPart}>
                    <View style={styles.textsWrapper}>

                      <View style={styles.messagesListWrapper}>
                        <View style={styles.messageListPadding}>

                        <DefaultMessagesList
                          onPressItem={this.messageItemPress}
                         data={savedMessages}
                         headerText={
                          'Select the message below or create your own.'
                         }
                         headerText1={'It will disappear from your phone after sending.'}
                         />
                      </View>

                    </View>
                    </View>
                  </View>
                </View>
                : null
              }
          </KeyboardAvoidingView>


          <KeyboardAccessoryView  androidAdjustResize  alwaysVisible={true} hideBorder={true} hiddenOpacity={1}
          >
              <View style={styles.textInputView}>

                <View style={styles.formWrapper}>
                  <TextInput
                    refName={comp => this.bigInput = comp}
                    onFocus={this.onFocusInput}
                    onBlur={this.onBlurInput}
                    underlineColorAndroid="transparent"
                    style={styles.textInput}
                    placeholder="Tap to send custom message..."
                    multiline={true}
                    onChangeText={text => this.onFieldChange('editedMessage', text)}>
                      <Text>{editedMessage}</Text>
                    </TextInput>
                    <View style={styles.loadingIndicatorWrapper}>
                  {
                    isLoading?

                      <View style={styles.loaderWrapper}>
                        <ActivityIndicator style={styles.loadingIndicatorSend} animating={true}  color="#FFFFFF" size="small"/>
                        </View>

                    :
                    <RoundedBtn
                      innerStyle={{
                        height: width(10),
                        width: width(14),
                        borderRadius: width(8),
                      }}
                      textStyle={{
                        color: 'white',
                        marginTop: 0,
                        fontSize: width(2.8)
                      }}
                      backgroundColor='#007AFF'
                      text='Send'
                    onPress={this.sendData}
                    style={styles.textInputButton}
                  />

                  }
                  </View>
                </View>
                {inputIsFocused?
                  <View style={styles.saveWrapper}>
                    <TouchableOpacity
                      style={styles.backButton}

                       onPress={this.saveToLibrary}
                        >
                           <Text style={styles.buttonText}>{
                           messageIsSaved
                             ? 'Saved'
                             : 'Save This Message to Your Library'
                         }</Text>
                        </TouchableOpacity>

                  </View>
                :null
              }

              </View>
            </KeyboardAccessoryView>

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
  loadingIndicator: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  hinTextWrapper: {
   alignItems: 'center',
   justifyContent: 'center',
   paddingHorizontal: 20,
   textAlign: 'center',
   marginBottom: 20,
  },
  hintText: {
    textAlign: 'center',
    color: '#9C9C9C',
    fontSize: 15
  },
  loadingIndicatorWrapper:{
    width: 65,
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrapper: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  scrollWrapper: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFF'
  },
  contentContainerStyle: {
    minHeight: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  topPartWrapper: {
    height: width(65),
    width: width(100),
  },
  headerWrapper: {
    flex: 1
  },
  topPart: {
    height: '100%',
    width: '100%'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: width(1),
    height: '100%',
    backgroundColor: '#FFF'
  },
  topContentPart: {
    height: '100%',
    alignItems: 'center',
  },
  topInputWrapper: {
    width: width(100),
    backgroundColor: '#FFF',
    borderBottomColor: '#D6D6D6',
    borderBottomWidth: width(.1),
    paddingHorizontal: width(6.5),
    paddingVertical: width(5),
    flexDirection: 'row'
  },
  keyWrapper: {
    flex: 1
  },
  topInputInner: {
    flex: 3,
    minHeight: width(9)
  },
  topPartContent: {
    marginTop: width(0),
    alignItems: 'center',
    justifyContent: 'center',
    width: width(100),
  },
  threeImagesWrapper: {
    marginTop: width(0),
  },
  topText: {
    color: 'white',
    fontSize: width(4.0),
    fontWeight: 'bold'
  },
  textsWrapper: {
    height: '100%',
    width: width(82),
  },
  title: {
    fontSize: width(3.8),
    fontWeight: '500',
    color: '#646464',
    marginTop: width(3.8),
    marginBottom: width(2)
  },
  messagesListWrapper: {
    height: '100%',
    minHeight: '100%'
  },
  messagesListWrapperLast: {

  },
  inputWrapper: {
    width: '100%',
    marginTop: width(2)
  },
  topButtonsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
  },
  roundedBtnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: width(12),
    backgroundColor: '#EBEBEB'
  },
  switchMessageButtonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  switchBackground: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    flexDirection: 'row',
    width: '90%',
    borderRadius: 20,
  },
  switchButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    width: '50%',
    padding: width(2.5)
  },
  switchButtonActive: {
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderRadius: 20,
    width: '50%',
    padding: width(2.5)
  },
  switchMessageButtonText: {
    fontSize: width(2.5),
    color: '#4B4C4D'
  },
  bottomPart: {
    width: width(100)
  },
  btnWrapper: {
    height: width(14)
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: width(3.5)
  },
  personItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  personName: {
    marginTop: width(2.2),
    color: 'white',
    fontSize: width(3.5),
  },
  avatarImageWrapper: {
    height: width(25),
    width: width(25),
    borderRadius: width(25),
    overflow: 'hidden',
    marginHorizontal: width(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden'
  },
  arrowImage:{
    flex:1,
    height: 13,
    width: 13,
    marginTop: width(1)
  },
  avatarImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover'
  },
  middleComp: {
    width: width(90),
    height: width(27),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  middleCompOverlay: {
    width: width(90),
    height: width(27),
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineImageWrapper: {
    width: width(20),
    height: 3,
    overflow: 'hidden'
  },
  lineImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain'
  },
  roundView: {
    height: width(7),
    width: width(7),
    borderRadius: width(7),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  roundViewText: {
    fontSize: width(4),
    marginTop: width(-0.4)
  },
  formWrapper:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10
  },
  saveWrapper:{
    backgroundColor: '#E8E9EF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#BCBFC5'
  },
  textInput: {
    flexGrow: 1,
    width: width(70),
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#D9D8DC',
    backgroundColor: '#fafafa',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 8,
    fontSize: 14,
    marginRight: 10,
    textAlignVertical: 'center',
    lineHeight: width(5.2)
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
    width: '100%'
  },
  buttonText: {
    fontSize: width(3),
    color: '#4B4C4D'
  },
  textInputButton: {
    flexShrink: 1,
  },
  textInputView: {
    flexShrink:1,
    flexWrap: 'wrap',
    borderTopColor: '#D6D6D6',
    borderTopWidth: 1,
    backgroundColor: '#fff',

  },
  loadingIndicatorSend: {
    marginTop: 8,
    transform: [{ scale: .8 }]
  },
  loaderWrapper: {
    height: width(10),
    width: width(14),
    borderRadius: width(8),
    backgroundColor: '#007AFF',
  }
})
