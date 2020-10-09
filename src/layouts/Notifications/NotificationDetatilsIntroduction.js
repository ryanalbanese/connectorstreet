import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, FlatList, Linking, Platform, Alert, Button, } from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment'
import Contacts from 'react-native-contacts'
import Permissions from 'react-native-permissions'

import { width, height, iconImages, getBackgroundImageByType, getColorByType, dayNames, monthNames, monthNamesFull } from 'constants/config'
import { cleanPhoneNumb, getAuthHeader, checkNextProps, fullCleanPhone, getUserModel } from 'utils'

import * as ApiUtils from 'actions/utils'
import * as Models from 'models'
import NavBar from 'components/NavBar'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import SmallRoundBtn from 'components/SmallRoundBtn'
import MessageItem from 'components/MessageItem'
import RoundedBtn from 'components/RoundedBtn'
import ModalShowInfo from './ModalShowInfo';

@connect(
  state => ({
    savedMessages: state.savedMessages,
    userData: state.userData,
    contacts: state.contacts,
    countryCodes: state.countryCodes,
  }),
  dispatch => ({
    setMakeIntroductionData: (data) => {
      dispatch(ApiUtils.setMakeIntroductionData(data))
    },
    addNewMessage: (data) => {
      dispatch(ApiUtils.addNewMessage(data))
    },
    setContacts: (contacts) => {
      dispatch(ApiUtils.setContacts(contacts))
    },
    actionUpdateNotifications: (id, keyValue) => {
      dispatch(Models.notification.updateNotifications(id, keyValue))
    },
  })
)
export default class NotificationDetatils extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageIsSaved: false
    }
  }

  saveToLibrary = () => {
    const { navigation, addNewMessage } = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
    addNewMessage(detailsData.message)
  }

  goBack = () => {
    const { navigation } = this.props;
    navigation.goBack();
    navigation.state.params.refresh({ refresh: true });
  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillMount(){

    const {navigation, userData, actionUpdateNotifications} = this.props

    const key = 'opened_'+userData.userModel.user_uid+''

      if (!navigation.state.params.detailsData[key]){

        const keyID = navigation.state.params.detailsData.id.split('_').slice(1).join('_');

        navigation.state.params.detailsData['opened_'+userData.userModel.user_uid+''] = true;

        actionUpdateNotifications(keyID, navigation.state.params.detailsData)

      }
  }

  onModalSelectPhotoBtnPress = (btnKey) => {

    switch (btnKey) {
      case 'close':
        this.setState({modalShowUserInfo: false})
        break
    }
  }

  _keyExtractor = (item, index) => 'key-'+item.key+'';

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
      : 'sms:://'
      mateUserModel && Linking.openURL(prefix + mateUserModel.phone)
  }

  avatarPress = () => {
    const {navigation} = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
      this.setState(
        {
          modalShowUserInfo: true,
          modalData : detailsData.userBy
        }
      )
  }

  onMessagePress = (data) => {
    const { navigation } = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
    navigation.navigate('NotifSelectAndEditTymMsg', {detailsData})
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

  onAddToContactsPress = (detailsData) => {
    const { userData, contacts } = this.props
    const mateUserModel = getUserModel(userData, detailsData)
    const cleanedPhone = mateUserModel && cleanPhoneNumb(mateUserModel.phone)
    const findExistingPhoneIncontacts = contacts && cleanedPhone && contacts.data.find(item => item && item.cleanedPhone && item.cleanedPhone == cleanedPhone)

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
            this.getContactts()
          })
        }
      })
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
            name: item.givenName && item.givenName +' '+ item.familyName,
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

  renderItem = ({ item, index }) => {
    const { navigation, setMakeIntroductionData, addNewMessage, userData } = this.props
    const { messageIsSaved } = this.state
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData

    const mateUserModel = getUserModel(userData, detailsData)
    const actionButtons = {
      onMailPress: () => this.onEmailPress(detailsData),
      onAddPress: () => this.onAddToContactsPress(detailsData),
      onTextPress: () => this.onTextPress(detailsData),
      onMessagePress: () => this.onMessagePress(detailsData),
      userAvatar: mateUserModel && mateUserModel.avatar
    }
    const messageButton = {
      onPress: () => this.onIntroducePress(detailsData),
      text: 'Make a New Introduction',
      innerStyle: {
        backgroundColor: '#48B1F0',
      },
      textStyle: {
        color: 'white'
      }
    }
    return <MessageItem
      item={item}
      avatarPress={this.avatarPress}
      messageWrapperStyle={
        item.type == 'makeIntroduction'
          && {
            borderColor: '#F5F6FB',
            borderWidth: 7,
            borderRadius: width(1)
          }
      }
      messageInnerStyle={
        item.type == 'makeIntroduction'
          && {
            borderRadius: width(1),
            borderWidth: 1,
            borderColor: '#F1F2F7',
            backgroundColor: 'white'
          }
      }

      idx={index} />
  }

  saveToLibrary = (message) => {
    const { addNewMessage } = this.props
    this.setState({messageIsSaved: true}, () => addNewMessage(message))
  }


  onPress = () => {
    const {navigation} = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
    const prefix = Platform.OS == 'ios'
      ? 'sms:/open?addresses='
      : 'sms:://'
      detailsData && Linking.openURL(prefix + detailsData.userBy.user)
  }


  render() {
    const { navigation, userData } = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
    const { modalShowUserInfo, modalData } = this.state
    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        action: () => this.goBack()
      },
      centerPart: {
        text: 'From ' + detailsData.userBy.firstName,
      },
    }
    const itemMoment = moment.unix(detailsData.date)

    const itemTime = itemMoment.format('hh:mm a')

    const mateUserModel = getUserModel(userData, detailsData)

    let btnText = 'Send a text to '+ detailsData.userBy.firstName

    const messageData = [
      {
        nameBy: detailsData.userBy.firstName + ' ' + detailsData.userBy.lastName,
        name: userData.userModel.firstName ,
        message: detailsData.message,
        dateText: dayNames[itemMoment.isoWeekday() - 1] + ', ' + monthNames[itemMoment.month()] + ' ' + itemMoment.date() + ', ' + itemTime,
        fNameSecond: mateUserModel && mateUserModel.fName + ' ' + mateUserModel.sName,
        sNameSecond: mateUserModel && mateUserModel.sName,
        type: detailsData.type,
        relationType: detailsData.relationType,
        detailsData: detailsData,
        avatar: detailsData.userBy.avatar
      }
    ]


    return (
      <View style={styles.wrapper}>
        <NavBar {...navBarProps} navigation={navigation} />
        <View style={styles.content}>
          <View style={styles.listWrapper}>
            <FlatList
              data={messageData}
              contentContainerStyle={styles.listContentContainerStyle}
              style={styles.listInner}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              renderItem={this.renderItem}/>
          </View>
          <View>
            <View style={styles.hinTextWrapper}>
              <Text style={styles.hintText}>
                Text message didn't populate? Try again
              </Text>
            </View>
            <RoundedBtn
              innerStyle={{
                height: width(8),
                width: width(70),
                borderRadius: width(5),
                borderWidth: 1,
                borderColor: '#BABCBE'

              }}
              textStyle={{
                color: '#7F8082',
                fontSize: width(3.1),
                marginTop: 0
              }}
              wrapperStyle={{
                 marginBottom: width(6)
              }}
              onPress={this.onPress}
              backgroundColor='transparent'
              text={btnText}/>
          </View>

        </View>
        <ModalShowInfo onBtnPress={this.onModalSelectPhotoBtnPress}   data={modalData} visible={modalShowUserInfo}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white'
  },
  hinTextWrapper: {
   alignItems: 'center',
   justifyContent: 'center',
   paddingHorizontal: 20,
   paddingBottom: 10,
   textAlign: 'center'
  },
  hintText: {
    textAlign: 'center',
    fontSize: width(3.8),
    color: '#9F9F9F',
    lineHeight: 25,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  listWrapper: {
    flex: 1,
  },
  listInner: {
    width: width(100)
  },
  listContentContainerStyle: {
    width: width(90),
    alignSelf: 'center'
  },
  roundBtnWrapper: {
    paddingVertical: width(2),
    alignItems: 'center',
    justifyContent: 'center'
  }
})
