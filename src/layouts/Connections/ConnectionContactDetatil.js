import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, FlatList, Linking, Platform, Alert, ActivityIndicator } from 'react-native'
import moment from 'moment'
import { NavigationActions } from 'react-navigation';
import Permissions from 'react-native-permissions'
import Contacts from 'react-native-contacts'

import { width, height, iconImages, getBackgroundImageByType, getColorByType, isIphoneX, monthNamesFull, dayNames, monthNames } from 'constants/config'
import { cleanPhoneNumb, getAuthHeader, checkNextProps, fullCleanPhone, getUserModel } from 'utils'

import * as ApiUtils from 'actions/utils'
import * as Models from 'models'

import NavBar from 'components/NavBar'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import SmallRoundBtn from 'components/SmallRoundBtn'
import MessageItem from 'components/MessageItem'
import ModalShowContact from './ModalShowContact';

@connectWithNavigationIsFocused(
  state => ({
    makeIntroductionData: state.makeIntroductionData,
    routes: state.routes,
    userData: state.userData,
    countryCodes: state.countryCodes,
    savedMessages: state.savedMessages,
    getUsersPushIds: state.getUsersPushIds,
    getUserCustomMessages: state.getUserCustomMessages,
    setCustomMessages: state.setCustomMessages
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
    }
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
      messageIsSaved: false
    }
  }

  componentWillMount() {

    const { userData, actionAddCustomMessages } = this.props

    actionAddCustomMessages(userData.userModel.user_uid)

  }

  componentWillReceiveProps(nextProps, state) {

    const { userData, navigation, deleteIntro, getUserCustomMessages, actionGetCustomMessages } = this.props

    const propsCheckerGetUserCustomMessages = checkNextProps(nextProps, this.props, 'getUserCustomMessages', 'anyway')

    const propsCheckerSetCustomMessages = checkNextProps(nextProps, this.props, 'setCustomMessages', 'anyway')

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
        // error
        // console.log(err)
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

  onAddAvatarPress = () => {

  }

  _keyExtractor = (item, index) => 'key-'+item.key+'';

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

  renderItem = ({ item, index }) => {

    const { navigation } = this.props
    const { messageIsSaved } = this.state
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
    const button = {
      text: messageIsSaved
        ? 'Saved'
        : 'Save Message to Library',
      onPress: () => this.saveToLibrary(detailsData.message)
    }
    const messageButton = {
      onPress: () => navigation.navigate('ConnIntroductionDetatils', {detailsData}),
      text: 'View Introduction'
    }
    return <MessageItem
      item={item}
      button={button}
      messageButton={messageButton}
      idx={index} />
  }

  onAddToContactsPress = (detailsData) => {
    const { userData, contacts } = this.props
    const mateUserModel = getUserModel(userData, detailsData)
    const cleanedPhone = mateUserModel && cleanPhoneNumb(mateUserModel.phone)
    const findExistingPhoneIncontacts = contacts && mateUserModel && contacts.data.find(item => item && item.cleanedPhone && item.cleanedPhone == cleanedPhone)
    console.log(findExistingPhoneIncontacts)
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
      console.log('newPerson')

      Permissions.check('contacts').then(response => {
        console.log(response)
        if (response == 'authorized') {
          Contacts.addContact(newPerson, (error) => {
            console.log(error)
            if (error) {
              Alert.alert('Error creating the contact', null, [
                {text: 'OK'}
              ])
            } else {
              Alert.alert('Added to contact list')
            }
            this.getContactts()
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
    const { navigation, setMakeIntroductionData, userData } = this.props

    navigation.navigate('ConnSelectAndEditMsg', {detailsData})
  }

  onIntroducePress = (detailsData) => {
    const { navigation, setMakeIntroductionData, userData } = this.props

    const mateUserModel = getUserModel(userData, detailsData)

    if (mateUserModel) {
      setMakeIntroductionData({
        fPerson: mateUserModel
      })
      navigation.navigate('MakeIntroductions', {prevScreen: 'Connections'})
    }
  }

  goToDetail = () =>{
    const {navigation} = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData

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
        this.setState({modalShowInfo: false})
        break
    }
  }

  render() {
    const { navigation, userData } = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
    const { fields, modalShowInfo } = this.state
    const { message } = fields
    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        action: () => navigation.goBack()
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

    return (
      <View style={styles.wrapper}>
        <View style={styles.topPartWrapper}>
          <ImageBackground source={getBackgroundImageByType(detailsData.relationType)} style={styles.topPart}>
            <NavBar {...navBarProps} statusBarBackgroundColor={getColorByType(detailsData.relationType)} transparent navigation={navigation} />
            <View style={styles.topPartContent}>
            <Text style={styles.topNameText}>
              Hi, {userData && (userData.userModel.firstName) } please meet {mateUserModel && mateUserModel.fName}
            </Text>
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
                <TouchableOpacity onPress={this.goToDetail} style={styles.avatarImageWrapper}>
                  <Image resizeMethod="scale" source={mateUserModel && mateUserModel.avatar && {uri: mateUserModel.avatar} || iconImages.avatarPlaceholder} style={styles.avatarImage} />
                </TouchableOpacity>

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
            <TouchableOpacity style={styles.actionItem} onPress={() => this.onEmailPress(detailsData)}>
              <View style={styles.actionIconImageWrapper}>
                <Image style={styles.actionIconImage} source={iconImages.connectionMailIconGrey} />
              </View>
              <Text style={styles.actionText}>
                Email {mateUserModel && mateUserModel.fName}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => this.onTextPress(detailsData)}>
              <View style={styles.actionIconImageWrapper}>
                <Image style={styles.actionIconImage} source={iconImages.connectionNoteIconGrey} />
              </View>
              <Text style={styles.actionText}>
                Text {mateUserModel && mateUserModel.fName}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => this.onMessagePress(detailsData)}>
              <View style={styles.actionIconImageWrapper}>
                <Image style={styles.actionIconImage} source={iconImages.connectionMessageIconGrey} />
              </View>
              <Text style={styles.actionText}>
                Message {mateUserModel && mateUserModel.fName}
              </Text>
            </TouchableOpacity>
          </View>
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
        <ModalShowContact onBtnPress={this.onModalSelectPhotoBtnPress}  personKey={this.state.personKey} data={this.state.modalData} visible={modalShowInfo}/>
      </View>
    );
  }
}

// <View style={styles.socialIconsWrapper}>
//                   <TouchableOpacity>
//                     <View style={styles.socialIconWrapper}>
//                       <Image style={styles.socialIconImage} source={iconImages.linkedinIconWhite} />
//                     </View>
//                   </TouchableOpacity>
//                   <TouchableOpacity>
//                     <View style={styles.socialIconWrapper}>
//                       <Image style={styles.socialIconImage} source={iconImages.twitterIconWhite} />
//                     </View>
//                   </TouchableOpacity>
//                   <TouchableOpacity>
//                     <View style={styles.socialIconWrapper}>
//                       <Image style={styles.socialIconImage} source={iconImages.fbIconWhite} />
//                     </View>
//                   </TouchableOpacity>
//                 </View>

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white'
  },
  topPartWrapper: {
    width: width(100),
    height: Platform.OS == 'ios'
      ? isIphoneX()
          ? width(94)
          : width(90)
      : width(80)
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
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: width(3.1),
  },
})
