import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, FlatList, Linking, Platform, Alert, ActivityIndicator, PermissionsAndroid } from 'react-native'
import moment from 'moment'
import { NavigationActions } from 'react-navigation';
import Permissions from 'react-native-permissions'
import Contacts from 'react-native-contacts'

import { width, height, iconImages, getBackgroundImageByType, getColorByType, isIphoneX, monthNamesFull, dayNames, monthNames, serverUrls } from 'constants/config'
import { cleanPhoneNumb, getAuthHeader, checkNextProps, fullCleanPhone, getUserModel } from 'utils'

import * as ApiUtils from 'actions/utils'
import * as Models from 'models'
import RoundedBtn from 'components/RoundedBtn'
import NavBar from 'components/NavBar'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import SmallRoundBtn from 'components/SmallRoundBtn'
import MessageItem from 'components/MessageItem'
import ModalShowInfo from './ModalShowInfo';

@connectWithNavigationIsFocused(
  state => ({
    makeIntroductionData: state.makeIntroductionData,
    routes: state.routes,
    getUsers: state.getUsers,
    userData: state.userData,
    countryCodes: state.countryCodes,
    savedMessages: state.savedMessages,
    getUsersPushIds: state.getUsersPushIds,
    getUserCustomMessages: state.getUserCustomMessages,
    setCustomMessages: state.setCustomMessages,
    logger: state.logger,
  }),
  dispatch => ({
    setMakeIntroductionData: (data) => {
      dispatch(ApiUtils.setMakeIntroductionData(data))
    },
    actionGetUsers(filters, headers) {
      dispatch(fetchServ({ ...serverUrls.getUsers, url: serverUrls.getUsers.url }, filters, headers, 'GETUSERS'))
    },
    addNewMessage: (data) => {
      dispatch(ApiUtils.addNewMessage(data))
    },
    actionLog: (payload) => {
      dispatch(Models.logger.logger(payload))
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
    setContacts: (contacts) => {
      dispatch(ApiUtils.setContacts(contacts))
    },
    deleteIntroduction: (id) => {
      dispatch(Models.introduction.deleteIntroduction(id))
    },
    actionUpdateIntroduction: (id, keyValue) => {
      dispatch(Models.introduction.updateIntroduction(id, keyValue))
    },
  })
)

export default class Send extends Component {

  constructor(props) {
    super(props);
    const fields = {
      message: '',
    }
    this.state = {
      fields,
      isLoading: true,
      isUser: false,
      modalShowInfo: false,
      messageIsSaved: false
    }
  }

  componentWillMount() {

    const { userData, actionAddCustomMessages, actionUpdateIntroduction, navigation, actionGetUsers } = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
    const mateUserModel = getUserModel(userData, navigation.state && navigation.state.params && navigation.state.params.detailsData)

    actionGetUsers({
      mobilePhone: mateUserModel.phone
    }, getAuthHeader(userData.token))

    actionAddCustomMessages(userData.userModel.user_uid)

    const key = 'conn_opened_'+userData.userModel.user_uid+''

      if (!navigation.state.params.detailsData[key]){

        const keyID = navigation.state.params.detailsData.id.split('_').slice(1).join('_');

        navigation.state.params.detailsData['conn_opened_'+userData.userModel.user_uid+''] = true;

        actionUpdateIntroduction(keyID, navigation.state.params.detailsData)

      }

  }

  componentWillReceiveProps(nextProps, state) {

    const { userData, navigation, deleteIntro, getUserCustomMessages, actionGetCustomMessages } = this.props

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

      this.setState({
        isLoading: false,
        isUser: true,
        detailsData: nextProps.getUsers.response
      })
    }

    else if (propsCheckersGetUsers == 'empty') {
      this.setState({
        isLoading: false,
        isUser: false
      })
    }

    if (propsCheckerSetCustomMessages == 'error'){

      actionGetCustomMessages(userData.userModel.user_uid)

    }

    if (nextProps.getUserCustomMessages.hasSavedMessages){

      this.setState({hasCustomMessages: true})

    }

    else {
        this.setState({hasCustomMessages: false})
    }

  }

  getContactts = () => {
    const { setContacts, countryCodes } = this.props
    const countryCodesArray = countryCodes.response
    Contacts.getAll((err, contacts) => {
      if(err === 'denied') {

      } else {

        const contactsData = contacts.map(item => {
          if (!item) return null

          return {
            name: (item.givenName || '') +' '+ (item.familyName || ''),
            fName: item.givenName && item.givenName.split(' ')[0] || '',
            sName: item.familyName || '',
            phone: item.phoneNumbers[0] && item.phoneNumbers[0].number,
            avatar: item.thumbnailPath,
            email: item.emailAddresses && item.emailAddresses[0] && item.emailAddresses[0].email
          }
        })
        if (countryCodesArray) {
          setContacts(contactsData.map(contact => {
            if (!(contact && contact.phone)) return null
            const phoneCleaned = fullCleanPhone(contact.phone)
            contact.cleanedPhone = phoneCleaned && ('+' + phoneCleaned)
            const realNumb = phoneCleaned.slice(-10).trim()
            let countryCode = '+' + phoneCleaned.replace(realNumb, '').trim()
            if (countryCode == '+') countryCode = '+1'
            if (countryCode && countryCode != '+') {
              if (countryCode == '+1') {
                countryCode = 'US(+1)'
              } else {
                countryCode = '(' + countryCode + ')'
              }
              const foundFullCountryCode = countryCodesArray.find(item => item.indexOf(countryCode) != -1 || item == countryCode)
              contact.phone = foundFullCountryCode + ' ' + realNumb
              return contact
            } else {
              return null
            }
          }).filter(item => item))
        }
      }
    })
  }

  onFieldChange = (fieldName, value) => {
    let newStateFields = this.state.fields
    newStateFields[fieldName] = value
    this.setState({fields: newStateFields})
  }

  _keyExtractor = (item, index) => 'key-'+item.key;

  saveToLibrary = (message) => {

    const { navigation, userData, getUserCustomMessages, actionUpdateCustomMessages, otherData} = this.props

    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData

    const messageArr = getUserCustomMessages && getUserCustomMessages.response || []

    if (!detailsData.message == ''){

      messageArr.push(detailsData.message)

      actionUpdateCustomMessages(userData.userModel.user_uid, messageArr)

      this.setState({messageIsSaved: true, hasCustomMessages: true})

    }

  }

  avatarPress = () => {
    const {navigation} = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
      this.setState(
        {
          modalShowInfo: true,
          modalData : detailsData.userBy
        }
      )
  }

  renderItem = ({ item, index }) => {
    const { navigation, userData } = this.props
    const { messageIsSaved, isUser } = this.state
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
    const data = this.state.detailsData || detailsData
    const onIntroductionTextPress = {
      onPress: () => navigation.navigate('ConnIntroductionDetatils', {detailsData, userTo: this.state.detailsData, isUser: isUser})
    }
    const onAddAvatarPress = {
      onTouch: () => navigation.navigate('ConnIntroductionDetatils', {detailsData, userTo: this.state.detailsData, isUser: isUser})
    }

    return <MessageItem
      item={item}

      avatarPress={this.avatarPress}
      onIntroductionTextPress={onIntroductionTextPress}

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

      if (Platform.OS === 'ios'){
        Contacts.getAll((err, contacts) => {
          if (err === 'denied'){
            // error
          } else {
            // Update the fields in the Address Book

            Contacts.addContact(newPerson, (error) => {

              if (error) {
                Alert.alert('Error creating the contact', null, [
                  {text: 'OK'}
                ])
              } else {
                Alert.alert('Added to contact list')
              }
            })
          }
        })
      }
      else {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
          {
            'title': 'Contacts',
            'message': 'This app would like to write to your contacts.'
          }
        ).then(() => {
          Contacts.getAll((err, contacts) => {
            if (err === 'denied'){
              // error
            } else {
              // Update the fields in the Address Book

              Contacts.addContact(newPerson, (error) => {

                if (error) {
                  Alert.alert('Error creating the contact', null, [
                    {
                      text: 'OK'
                    }
                  ])
                }
                else {
                  Alert.alert('Added to contact list', null, [
                    {
                      text: 'OK'
                    }
                  ])
                }

              })
            }
          })
        })
      }

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

    const { userData, actionLog } = this.props

    const mateUserModel = getUserModel(userData, detailsData)

    const prefix = Platform.OS == 'ios'
      ? 'sms:'
      : 'sms:'
      actionLog({
        "level":"debug",
        "message":"{module : LOG_PHONENUMBER, method: UI_LOG_PHONENUMBER, data: {prefix: "+prefix+", phone : "+mateUserModel.phone+"}"
      })
      mateUserModel && Linking.openURL(prefix + mateUserModel.phone)
  }

  onMessagePress = (detailsData) => {
    const { navigation } = this.props
    const data = this.state.detailsData || detailsData
    navigation.navigate('ConnSelectAndEditMsg', {detailsData, userTo: this.state.detailsData})
  }

  onIntroducePress = (detailsData) => {
    const { navigation, userData, setMakeIntroductionData } = this.props
    const mateUserModel = getUserModel(userData, detailsData)

    if (mateUserModel) {
      setMakeIntroductionData({
        fPerson: mateUserModel
      })
      navigation.navigate({
           routeName: 'Intro',
           params: {
               prevScreen: 'Connection'
           }
       });
    }
  }

  onPressDeleteIntroduction = () => {
    const { navigation, deleteIntroduction, state,nextProps } = this.props

    const detailsData = navigation.state.params.detailsData
    deleteIntroduction(navigation.state.params.detailsData.id)

    const navigateAction = NavigationActions.navigate({
      routeName: 'Main',
      action: NavigationActions.navigate({
        routeName: 'Connection',
        action: NavigationActions.navigate({ routeName: 'Connection' })
      })
    })

    this.setState({
      isLoading: false,
    }, () => {

      Alert.alert(
      'Delete Connection',
      'Are you sure you want to delete this connection? You cannot undo this action.',
        [
          {
            text: 'Yes', onPress: () => {
            deleteIntroduction(navigation.state.params.detailsData.id)
            navigation.dispatch(navigateAction)
          }
        },
          {text: 'Cancel',  style: 'cancel'}
        ],
        { cancelable: false }
      )

    })
  }

  onModalSelectPhotoBtnPress = (btnKey) => {

    switch (btnKey) {
      case 'close':
        this.setState({modalShowInfo: false})
        break
    }
  }

  render() {

    const { navigation, userData } = this.props
    const {modalShowInfo, modalData} = this.state
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
    const { fields, isUser, isLoading } = this.state
    const { message } = fields

    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        action: () => navigation.goBack()
      },
      centerPart: {
        text: 'My Connections',
        fontSize: width(4.2),
        subText: 'You have been introduced to'
      },
    }
    const itemMoment = moment.unix(detailsData.date)
    const itemTime = itemMoment.format('hh:mm a')
    const messageData = [
      {
        key: 1,
        nameBy: detailsData.userBy && (detailsData.userBy.firstName.trim() + ' ' + detailsData.userBy.lastName.trim()),
        middleText: 'made an',
        lastTest: 'introduction',
        message: detailsData.message || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
        dateText: dayNames[itemMoment.isoWeekday() - 1] + ', ' + monthNames[itemMoment.month()] + ' ' + itemMoment.date() + ', ' + itemTime,
        avatar: detailsData.userBy && detailsData.userBy.avatar
      }
    ]
    const mateUserModel = getUserModel(userData, detailsData)


    return (
      <View style={styles.wrapper}>
        <View style={styles.topPartWrapper}>
          <ImageBackground source={getBackgroundImageByType(detailsData.relationType)} style={styles.topPart}>
            <NavBar {...navBarProps} statusBarBackgroundColor={getColorByType(detailsData.relationType)} transparent navigation={navigation} />
            <View style={styles.topPartContent}>
              <View style={styles.row}>
                <View style={styles.roundBtnWrapper}>
                  <SmallRoundBtn
                    backgroundColor="#F6F6F6"
                    icon={iconImages.connectionsPlusIconGreen}
                    customWidth={width(9)}
                    customIconStyle={{width: width(3.2), height: width(3.2)}}
                    onPress={() => this.onAddToContactsPress(detailsData)} />
                  <Text style={styles.roundBtnText}>
                    Add to Contacts
                  </Text>
                </View>
                <View style={styles.avatarImageWrapper}>
                  <Image resizeMethod="scale" source={mateUserModel && mateUserModel.avatar && {uri: mateUserModel.avatar} || iconImages.avatarPlaceholder} style={styles.avatarImage} />
                </View>
                <View style={styles.roundBtnWrapper}>
                  <SmallRoundBtn
                    backgroundColor="#F6F6F6"
                    icon={iconImages.connectionsNextIconGreen}
                    customWidth={width(9)}
                    customIconStyle={{width: width(4.2), height: width(4.2)}}
                    onPress={() => this.onIntroducePress(detailsData)} />
                  <Text style={styles.roundBtnText}>
                    Introduce {mateUserModel && mateUserModel.fName}
                  </Text>
                </View>
              </View>
              <View style={styles.infoWrapper}>
                <Text style={styles.nameText}>
                  {mateUserModel && (mateUserModel.fName + ' ' + mateUserModel.sName)}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
        <View style={styles.content}>
          <View style={styles.actionsRow}>
            {
              isLoading
                ? <View style={styles.actionItem}>
                  <View style={styles.actionIconImageWrapper}>
                  </View>
                  <Text style={styles.actionText}>
                  </Text>
                  <ActivityIndicator style={styles.loadingIndicator} animating={true}  color="#3E3E3E" size="small"/>
                  </View>

                : null
            }
            {
              !isLoading && mateUserModel.email
              ? <TouchableOpacity style={styles.actionItem} onPress={() => this.onEmailPress(detailsData)}>
                <View style={styles.actionIconImageWrapper}>
                  <Image style={styles.actionIconImage} source={iconImages.connectionMailIconGrey} />
                </View>
                <Text style={styles.actionText}>
                  Email {mateUserModel && mateUserModel.fName}
                </Text>
              </TouchableOpacity>
              : null
            }
            {
              isLoading ? null
              :
              <TouchableOpacity style={styles.actionItem} onPress={() => this.onTextPress(detailsData)}>
                <View style={styles.actionIconImageWrapper}>
                  <Image style={styles.actionIconImage} source={iconImages.connectionNoteIconGrey} />
                </View>
                <Text style={styles.actionText}>
                  Text {mateUserModel && mateUserModel.fName}
                </Text>
              </TouchableOpacity>
            }
            {
              !isLoading && isUser
            ? <TouchableOpacity style={styles.actionItem} onPress={() => this.onMessagePress(detailsData)}>
              <View style={styles.actionIconImageWrapper}>
                <Image style={styles.actionIconImage} source={iconImages.connectionMessageIconGrey} />
              </View>
              <Text style={styles.actionText}>
                Message {mateUserModel && mateUserModel.fName}
              </Text>
            </TouchableOpacity>
            : null
            }

          </View>
          <View style={styles.content}>
            <View style={styles.listWrapper}>
              <FlatList
                data={messageData}
                extraData={this.state}
                keyExtractor={this._keyExtractor}
                renderItem={this.renderItem}/>
            </View>
          </View>
        </View>
        <ModalShowInfo onBtnPress={this.onModalSelectPhotoBtnPress}   data={modalData} visible={modalShowInfo}/>
      </View>
    );
  }

}

const styles = StyleSheet.create({
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
    flex: 1,
    backgroundColor: 'white'
  },
  topPartWrapper: {
    width: width(100),
    height: Platform.OS == 'ios'
      ? isIphoneX()
          ? width(84)
          : width(75)
      : width(60)
  },
  topPart: {
    height: '100%',
    width: '100%',
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
      ? width(10)
      : 25
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
    height: width(26),
    width: width(26),
    borderRadius: width(26),
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
    fontSize: width(4.2),
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
    flexWrap: "wrap",
    height: '100%',
    width: width(90),
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
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: width(3.1),
  },
  saveBtnWrapper: {
    marginBottom: width(5)
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  listWrapper: {
    flex: 1,
    width: width(90),
  }
})
