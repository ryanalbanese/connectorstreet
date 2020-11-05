import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, FlatList, Linking, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native'
import moment from 'moment'
import { NavigationActions } from 'react-navigation';
import Permissions from 'react-native-permissions'
import Contacts from 'react-native-contacts'

import { width, height, iconImages, getBackgroundImageByType, getColorByType, isIphoneX, monthNamesFull, dayNames, monthNames, serverUrls, appVersion } from 'constants/config'
import { cleanPhoneNumb, getAuthHeader, checkNextProps, fullCleanPhone, getUserModel } from 'utils'

import * as ApiUtils from 'actions/utils'
import * as Models from 'models'

import NavBar from 'components/NavBar'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import SmallRoundBtn from 'components/SmallRoundBtn'
import MessageItem from 'components/MessageItem'
import ModalShowContact from './ModalShowContact';
import ModalShowInfo from './ModalShowInfo';

@connectWithNavigationIsFocused(
  state => ({
    makeIntroductionData: state.makeIntroductionData,
    routes: state.routes,
    userData: state.userData,
    getUsers: state.getUsers,
    countryCodes: state.countryCodes,
    savedMessages: state.savedMessages,
    getUsersPushIds: state.getUsersPushIds,
    getUserCustomMessages: state.getUserCustomMessages,
    setCustomMessages: state.setCustomMessages,
    logger: state.logger
  }),
  dispatch => ({
    setMakeIntroductionData: (data) => {
      dispatch(ApiUtils.setMakeIntroductionData(data))
    },
    addNewMessage: (data) => {
      dispatch(ApiUtils.addNewMessage(data))
    },
    actionGetCustomMessages: (userId) => {
      dispatch(Models.messages.getUserCustomMessages(userId))
    },
    actionGetUsers(filters, headers) {
      dispatch(fetchServ({ ...serverUrls.getUsers, url: serverUrls.getUsers.url }, filters, headers, 'GETUSERS'))
    },
    actionUpdateCustomMessages: (userId, keyValue) => {
      dispatch(Models.messages.updateCustomMessages(userId, keyValue))
    },
    actionAddCustomMessages: (userId, keyValue) => {
      dispatch(Models.messages.setCustomMessages(userId, keyValue))
    },
    setContacts: (contacts) => {
      dispatch(ApiUtils.setContacts(contacts))
    },
    deleteIntroduction: (id) => {
      dispatch(Models.introduction.deleteIntroduction(id))
    },
    actionUpdateNotifications: (id, keyValue) => {
      dispatch(Models.notification.updateNotifications(id, keyValue))
    },
    actionLog: (payload) => {
      dispatch(Models.logger.logger(payload))
    },
    actionGetNotifications: (userId) => {
      dispatch(Models.notification.getNotifications(userId))
    }
  })
)
export default class NotificationDetails extends Component {
  constructor(props) {
    super(props);
    const {navigation} = this.props
    const fields = {
      message: '',
    }
    this.state = {
      fields,
      isLoading: true,
      isUser: false,
      messageIsSaved: false,
      introData: navigation.state && navigation.state.params && navigation.state.params.detailsData
    }
  }

  componentWillMount(){

    const {navigation, userData, actionUpdateNotifications, actionGetUsers} = this.props

    const mateUserModel = getUserModel(userData, this.state.introData)

    actionGetUsers({
      mobilePhone: mateUserModel.phone
    }, getAuthHeader(userData.token))

    const key = 'opened_'+userData.userModel.user_uid+''

      if (!this.state.introData[key]){

        navigation.state.params.detailsData['opened_'+userData.userModel.user_uid+''] = true;

        actionUpdateNotifications(this.state.introData.id, this.state.introData)

      }
  }

  componentWillReceiveProps(nextProps, state) {

    const { userData, navigation, deleteIntro, getUserCustomMessages, actionGetCustomMessages } = this.props

    const {introData} = this.state

    const propsCheckerGetUserCustomMessages = checkNextProps(nextProps, this.props, 'getUserCustomMessages', 'anyway')

    const propsCheckerSetCustomMessages = checkNextProps(nextProps, this.props, 'setCustomMessages', 'anyway')

    const propsCheckersGetUsers = checkNextProps(nextProps, this.props, 'getUsers', 'anyway')

    if (propsCheckersGetUsers == 'error') {
        const error = nextProps.propsCheckersGetUsers.error
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

    else if (propsCheckersGetUsers && propsCheckersGetUsers != 'empty') {

      const foundUserData = getUserModel(userData, introData)

      if (!foundUserData.user_uid){
        foundUserData['user_uid'] = nextProps.getUsers.response.user_uid
        foundUserData['userId'] = nextProps.getUsers.response.user_uid
      }
      console.log(this.state.introData)
      this.setState({
        isLoading: false,
        isUser: true
      })
    }

    else if (propsCheckersGetUsers == 'empty') {
      this.setState({
        isLoading: false,
        isUser: false
      })
    }

  }

  onFieldChange = (fieldName, value) => {
    let newStateFields = this.state.fields
    newStateFields[fieldName] = value
    this.setState({fields: newStateFields})
  }

  _keyExtractor = (item, index) => 'key-'+item.key+'';

  avatarPress = () => {
    const {navigation} = this.props
    const detailsData = this.state.introData
      this.setState(
        {
          modalShowUserInfo: true,
          modalData : detailsData.userBy
        }
      )
  }

  renderItem = ({ item, index }) => {

    const { navigation } = this.props
    const { messageIsSaved, isUser} = this.state
    const detailsData = this.state.introData

    const button = {
      text: messageIsSaved
        ? 'Send '+detailsData.userBy.firstName+' a message'
        : 'Send '+detailsData.userBy.firstName+' a message',
      onPress: () => this.onIntroducerMessagePress(detailsData)
    }

    const messageButton = {
      onPress: () => navigation.navigate('ConnIntroductionDetatils', {detailsData: this.state.introData, refresh: this.refresh}),
      text: 'View Introduction'
    }
    const viewIntroButton = {
      onPress: () => navigation.navigate('ConnIntroductionDetatils', {detailsData})
    }
    return <MessageItem
      item={item}
      button={button}
      avatarPress={this.avatarPress}
      viewIntroButton={viewIntroButton}
      messageButton={messageButton}
      idx={index} />
  }

  onAddToContactsPress = (detailsData) => {
    const { userData, contacts } = this.props
    const mateUserModel = getUserModel(userData, detailsData)
    const cleanedPhone = mateUserModel && cleanPhoneNumb(mateUserModel.phone)
    const findExistingPhoneIncontacts = contacts && mateUserModel && contacts.data.find(item => item && item.cleanedPhone && item.cleanedPhone == cleanedPhone)

    if (!findExistingPhoneIncontacts) {
      const newPerson = {
        emailAddresses: [{
          label: "ConnectorStreet",
          email: mateUserModel.email,
        }],
        familyName: Platform.OS == 'ios'
          ? mateUserModel.sName
          : '',
        givenName: Platform.OS == 'ios'
          ? mateUserModel.fName
          : mateUserModel.fName + ' ' + mateUserModel.sName,
        phoneNumbers: [{
          label: "mobile",
          number: cleanedPhone,
        }],
      }

      Permissions.check('contacts').then(response => {

        if (response == 'authorized') {
          Contacts.addContact(newPerson, (error) => {

            if (error) {
              Alert.alert('Error creating the contact', null, [
                {text: 'OK'}
              ])
            } else {
              Alert.alert('Added to contacts list')
            }
          })
        }
      })

    }
  }

  onEmailPress = (detailsData) => {

    const { userData } = this.props
    const mateUserModel = getUserModel(userData, detailsData)
    const prefix = Platform.OS == 'ios'
      ? 'mailto:'
      : 'mailto:'
      mateUserModel && Linking.openURL(prefix + mateUserModel.email + '?subject=Connector Street&body=Hi '+mateUserModel.fName+',\n\nIt’s great to meet you! \n\nBest, \n'+userData.userModel.firstName+'')
  }

  onTextPress = (detailsData) => {
    const { userData } = this.props
    const mateUserModel = getUserModel(userData, detailsData)
    const prefix = Platform.OS == 'ios'
      ? 'sms:'
      : 'sms:'
      mateUserModel && Linking.openURL(prefix + mateUserModel.phone)
  }

  onMessagePress = (detailsData) => {
    const { navigation } = this.props
    const data = this.state.introData || detailsData
    navigation.navigate('NotifSelectAndEditMsg', {detailsData, userTo: this.state.introData})
  }

  onIntroducerMessagePress = (detailsData) => {
    const { navigation, setMakeIntroductionData, userData } = this.props

    navigation.navigate('NotifSelectAndEditTymMsg', {detailsData: detailsData, fromScreen: 'sendIntroducerMessage', refresh: this.refresh})
  }

  onIntroducePress = (detailsData) => {
    const { navigation, setMakeIntroductionData, userData } = this.props

    const mateUserModel = getUserModel(userData, detailsData)
    if (mateUserModel) {
      setMakeIntroductionData({
        fPerson: mateUserModel
      })
      navigation.navigate('MakeIntroductions', {prevScreen: 'Notifications'})
    }
  }

  goToDetail = () =>{
    const {navigation, actionLog} = this.props
    const detailsData = this.state.introData
    const { fields, modalShowInfo, isUser, modalShowUserInfo, modalData } = this.state

    this.setState(
      {
        modalShowInfo: true,
        modalData: detailsData
      }
    )

  }

  onModalSelectPhotoBtnPress = (btnKey) => {

    switch (btnKey) {
      case 'close':
        this.setState({modalShowUserInfo: false})
        break
    }
  }

  onModalContact = (btnKey, pictrueId) => {
    const {navigation} = this.props
    const detailsData = this.state.introData
    switch (btnKey) {
      case 'close':
        this.setState({modalShowInfo: false})
        break
      case 'message':
      this.setState({
        modalShowInfo: false
      }, () => this.onMessagePress(detailsData))
        break
      case 'text':
        this.onTextPress(detailsData)
        break
      case 'email':
        this.onEmailPress(detailsData)
        break
      case 'add':
          this.onAddToContactsPress(detailsData)
        break
      case 'introduce':
          this.onIntroducePress(detailsData)
        break

      }
  }

  refresh = () => {

    const {actionGetNotifications, userData} = this.props

    this.setState({ isLoading: true }, () => {

      actionGetNotifications(userData.userModel.user_uid)

    })

  }

  goBack = () => {
    const { navigation } = this.props;
    navigation.state.params.refresh({ refresh: true });
    navigation.goBack();

  }

  render() {
    const { navigation, userData } = this.props
    const detailsData = this.state.introData
    const { fields, modalShowInfo, isUser, modalShowUserInfo, modalData } = this.state
    const { message } = fields

    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        action: () => this.goBack()
      },
      centerPart: {
				image: iconImages.navBarLogoImage,
				imageWrapperCustomStyle: {
					width: width(70),
					height: width(20),
					alignItems: 'center',
					justifyContent: 'center',
				},
				imageCustomStyles: {
					height: '60%',
					width: '60%',
					marginTop: width(5)
				}
      },
    }
    const itemMoment = moment.unix(detailsData.date)
    const itemTime = itemMoment.format('hh:mm a')
    const messageData = [
      {
        key: 1,
        nameBy: detailsData.userBy && (detailsData.userBy.firstName.trim() + ' ' + detailsData.userBy.lastName.trim()),
        middleText: '',
        lastTest: '',
        message: detailsData.message || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
        dateText: dayNames[itemMoment.isoWeekday() - 1] + ', ' + monthNames[itemMoment.month()] + ' ' + itemMoment.date() + ', ' + itemTime,
        avatar: detailsData.userBy && detailsData.userBy.avatar
      }
    ]
    const mateUserModel = getUserModel(userData, detailsData)

    let hasEmail

    mateUserModel.email != ''
    ? hasEmail = true
    : hasEmail = false

    return (
      <ScrollView style={styles.wrapper}>
        <View style={styles.topPartWrapper}>
          <ImageBackground source={getBackgroundImageByType(detailsData.relationType)} style={styles.topPart}>
            <NavBar {...navBarProps} statusBarBackgroundColor={getColorByType(detailsData.relationType)} transparent navigation={navigation} />
            <View style={styles.topPartContent}>
            <Text style={styles.topNameText}>
              Hi {userData && (userData.userModel.firstName) }, please meet {mateUserModel && mateUserModel.fName}
            </Text>
              <View style={styles.row}>

                <TouchableOpacity onPress={this.goToDetail} style={styles.avatarImageWrapper}>
                  <Image resizeMethod="scale" source={mateUserModel && mateUserModel.avatar && {uri: mateUserModel.avatar} || iconImages.avatarPlaceholder} style={styles.avatarImage} />
                </TouchableOpacity>


              </View>
              <View style={styles.infoWrapper}>
                <Text style={styles.nameText}>
                  {mateUserModel && (mateUserModel.fName + ' ' + mateUserModel.sName)}
                </Text>
              </View>
              <TouchableOpacity  onPress={this.goToDetail} style={styles.connectButton}>
                <Text style={styles.connectButtonText}>WAYS TO CONNECT WITH {mateUserModel && mateUserModel.fName.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
        <View style={styles.content}>

          <View style={styles.messagingWrapper}>

            <View style={styles.listWrapper}>
              <FlatList
                data={messageData}
                extraData={this.state}
                keyExtractor={this._keyExtractor}
                renderItem={this.renderItem}/>
            </View>
          </View>
        </View>
        <ModalShowInfo onBtnPress={this.onModalSelectPhotoBtnPress}   data={modalData} visible={modalShowUserInfo}/>
        <ModalShowContact isUser={isUser} hasEmail={hasEmail} onBtnPress={this.onModalContact}  personKey={this.state.personKey} data={this.state.modalData} detailsData={detailsData} visible={modalShowInfo}/>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white'
  },
  topPartWrapper: {
    width: width(100),
    height: Platform.OS == 'ios'
      ? isIphoneX()
          ? width(112)
          : width(108)
      : width(88)
  },
  topPart: {
    height: '100%',
    width: '100%'
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  topPartContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width(100),
    paddingTop: isIphoneX()
      ? width(5)
      : 5
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: width(3)
  },
  roundBtnText: {
    color: 'white',
    fontSize: width(2.6),
    marginTop: width(1)
  },
  avatarImageWrapper: {
    height: width(32),
    width: width(32),
    borderRadius: width(32),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: width(4),
    borderWidth: 1,
    borderColor: 'white',
  },
  avatarImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover'
  },
  infoWrapper: {
    marginTop: isIphoneX()
      ? width(5)
      : width(2),
    alignItems: 'center',
    justifyContent: 'center'
  },
  nameText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width(4.8),
  },
  topNameText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: width(4.8),
    marginBottom: width(8)
  },
  socialIconsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: width(2)
  },
  socialIconWrapper: {
    marginHorizontal: width(2),
    height: width(5),
    width: width(5)
  },
  socialIconImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain'
  },
  actionsRow: {
    width: width(100),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    marginTop: width(0)
  },
  actionItem: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: width(4)
  },
  actionIconImageWrapper: {
    height: width(4),
    width: width(4)
  },
  actionIconImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain'
  },
  actionText: {
    color: '#868686',
    fontSize: width(2.6),
    marginTop: width(2)
  },
  messagingWrapper: {
    alignItems: 'center'
  },
  bottomPartTitleWrapper: {
    width: width(90),
    justifyContent: 'center'
  },
  bottomPartTitleText: {
    marginVertical: width(4),
    color: '#868686',
    fontSize: width(3),
  },
  listWrapper: {
    width: width(90),
    height: '100%'
  },
  deleteBtnWrapper: {
    alignItems: 'center',
  },
  deleteBtnInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width(100),
    height: isIphoneX()
      ? width(18)
      : width(13),
    backgroundColor:'#FF5A5A'
  },
  connectButton: {
    borderRadius: 50,
    paddingVertical: 5,
    paddingHorizontal: 30,
    borderWidth: 1,
    marginTop: 20,
    borderColor: '#fff',
  },
  connectButtonText: {
    fontSize: 12,
    color: '#fff'
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: width(3.1),
  },
})
