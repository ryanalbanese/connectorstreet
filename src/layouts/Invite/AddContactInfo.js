import React, { Component } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native'

import { NavigationActions } from 'react-navigation';

import Contacts from 'react-native-contacts'
import Permissions from 'react-native-permissions'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { width, height, iconImages, isIphoneX, serverUrls } from 'constants/config'
import { connectWithNavigationIsFocused, checkNextProps, cleanPhoneNumb, getAuthHeader, fullCleanPhone } from 'utils'

import * as ApiUtils from 'actions/utils'
import fetchServ from 'actions/fetchServ'

import NavBar from 'components/NavBar'
import PhoneInput from 'components/PhoneInput'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import StdBtn from 'components/StdBtn'
import HintModal from 'components/HintModal'

const fieldsOrder = ['phone', 'email']

const errorHints = {
  emailError: {
    title: 'Invalid Email Address',
    text: 'The email address must contain an "@" sign.'
  },
  inviteYourSelf: {
    title: 'Oops! You can’t invite yourself.',
    text: 'You already have the app installed.'
  },
  requeredFieldsEmpty: {
    title: 'Oops! Some fields are empty.',
    text: 'You should fill all fields that are marked with a red dot.'
  }
}

@connectWithNavigationIsFocused(
  state => ({
    sendSms: state.sendSms,
    userData: state.userData,
    inviteFriend: state.inviteFriend,
    contacts: state.contacts,
    countryCodes: state.countryCodes,
  }),
  dispatch => ({
    actionSendSms: (data, headers) => {
			dispatch(fetchServ(serverUrls.sendSms, data, headers, 'SENDSMS'))
		},
    actionInviteFriend: (data, headers) => {
			dispatch(fetchServ(serverUrls.inviteFriend, data, headers, 'INVITEFRIEND'))
    },
    setContacts: (contacts) => {
      dispatch(ApiUtils.setContacts(contacts))
    },
  })
)
export default class AddContactInfo extends Component {

  constructor(props) {

    super(props);

    const { navigation } = this.props
    const contactInfo = navigation.state && navigation.state.params && navigation.state.params.contactInfo

    const fields = {
      phone: contactInfo && contactInfo.phoneNumbers && contactInfo.phoneNumbers.defaultPhone || contactInfo && contactInfo.phoneNumbers && contactInfo.phoneNumbers[0] && contactInfo.phoneNumbers[0].number || '',
      cleanPhone: contactInfo && contactInfo.phoneNumbers && contactInfo.phoneNumbers[0] && contactInfo.phoneNumbers[0].number  || '',
      email: contactInfo && contactInfo.email || '',
      fName: contactInfo && contactInfo.fName || '',
      sName: contactInfo && contactInfo.sName || '',
    }
    this.state = {
      fields,
      showError: false,
      isLoading: false,
      error: ''
    }
  }

  onFieldChange = (fieldName, value) => {
    let newStateFields = this.state.fields
    newStateFields[fieldName] = value
    this.setState({fields: newStateFields})
  }

  confirm = () => {

    const { navigation, actionSendSms, userData, actionInviteFriend, contacts } = this.props
    const { fields } = this.state
    this.setState({
      isLoading: true
    })
    const { phone, email } = fields
    const cleanedPhone = fullCleanPhone(fields.phone)
    if (!fields.email == '' && !fields.email.includes("@")){
      this.setState({
        isLoading: false,
        error: errorHints.emailError
      }, () => {
        this.showErrorHint()
      })
      return null
    }
    if ('+'+cleanedPhone == userData.userModel.user || cleanedPhone == userData.userModel.user || userData.userModel.email == fields.email) {
      this.setState({ isLoading: false, error: errorHints.inviteYourSelf }, () => {
        this.showErrorHint()
      })
    } else if ((!cleanedPhone) && !email) {
      this.setState({isLoading: false,  error: errorHints.requeredFieldsEmpty }, () => {
        this.showErrorHint()
      })
    } else {

        actionInviteFriend({
          email: fields.email || '',
          fName: fields.fName || '',
          sName: fields.sName || '',
          mobilePhone: fullCleanPhone(fields.phone),
          emailTemplate: 'cs-invite.html',
          firstName: userData.userModel.firstName,
          lastName: userData.userModel.lastName,
          fromName: fields.fName,
          body: ''+userData.userModel.firstName+' '+userData.userModel.lastName+' invited you to Connector Street, a terrific app for making Instant Introductions.  \n\niOS: https://apps.apple.com/us/app/connector-street/id1063707229 \n\nAndroid: https://play.google.com/store/apps/details?id=com.connectorstreet1.app'
        }, getAuthHeader(userData.token))

        const cleanedPhone = fullCleanPhone(fields.phone)
        const findExistingPhoneIncontacts = contacts && contacts.data.find(item => item && item.cleanedPhone && item.cleanedPhone == cleanedPhone)
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

  componentWillReceiveProps(nextProps) {
    const { userData, navigation } = this.props

    const propsCheckerSendSms = checkNextProps(nextProps, this.props, 'inviteFriend')
    if (propsCheckerSendSms == 'error') {
			const error = nextProps.inviteFriend.error
			this.setState({
				isLoading: false,
      }, () => {
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      });
    } else if (propsCheckerSendSms) {
      const data = nextProps.inviteFriend.response
      this.setState({ isLoading: false }, () => {
        const resetNavigation = () => {
          const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({ routeName: 'Main'})
            ],
           key:null
          })
          navigation.dispatch(resetAction)
        }
        Alert.alert('Invitation sent successfully', null, [
          {text: 'OK', onPress: resetNavigation}
        ], {
          onDismiss: () => resetNavigation
        })
      })
    }
  }

  showErrorHint = () => {
    this.setState({ showError: true }, () => {
      setTimeout(() => {
        this.setState({ showError: false })
      }, 5000)
    })
  }

  onSubmitEditing = (fieldName) => {
		const { onSubmit } = this.props
		const indexOfField = fieldsOrder.indexOf(fieldName)
		if (indexOfField < fieldsOrder.length - 1) {
      this[fieldsOrder[indexOfField + 1]] && this[fieldsOrder[indexOfField + 1]].focus()
    } else {
      this.confirm && this.confirm()
    }
	}

  render() {
    const { navigation } = this.props
    const { fields, showError, isLoading, error, userData } = this.state
    const { phone, email, cleanPhone } = fields

    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        action: () => navigation.goBack()
      },
      centerPart: {
        text: 'Add Contact Information'
      },
    }
    const hintData = {
      text: {
        title: 'A mobile phone is required',
        text: 'We require a phone number to send invitations because the Invitees must use a phone number to sign up. '
      },
      photo: {
        avatar: iconImages.fakeHintAvatar,
        title: 'New Message from Maurice Davidson',
        text: 'Thanks for the introduction!'
      }
    }
    const fromScreen = navigation.state.params.previousScreen

    return (
      <View style={styles.wrapper} contentContainerStyle={styles.contentContainerStyle}>
        <NavBar {...navBarProps} navigation={navigation} />
        <View style={styles.content}>
          <KeyboardAwareScrollView  keyboardShouldPersistTaps={'never'} enableOnAndroid={true} extraHeight={200} showsVerticalScrollIndicator={false}>
          <View style={styles.topPart}>
            <View style={styles.textsWrapper}>
              <Text style={styles.titleText}>
                {
                  fromScreen ==='selectContact'
                  ?  'Looks good?'

                  : 'Add contact information'
              }
              </Text>
              <Text style={styles.infoText}>
              {
                fromScreen ==='selectContact'
                ?  'If not, edit the contact information below'

                :  'Enter a mobile number and/or an email address'
            }
              </Text>
            </View>
            <View style={styles.formWrapper}>
              <View style={styles.phoneInputWrapper}>
              {
                fromScreen ==='selectContact'
                ?<StdInput
                {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}
                placeholderTextColor="#7F7F7F"
                refName={comp => this['phone'] = comp}
                onSubmitEditing={() => this.onSubmitEditing('phone')}
                placeholder="Mobile number"
                clearButtonMode='always'
                keyboardType="phone-pad"
                returnKeyType={ 'done' }
                value={fields.phone}
                keyboardType='phone-pad'
                customItemStyle={{color: '#000000'}}
                onChangeText={text => this.onFieldChange('phone', text)} />
                :<PhoneInput
                {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}
                placeholderTextColor="#7F7F7F"
                refName={comp => this['phone'] = comp}
                countryProps={{
                    wrapperStyle: {
                      paddingRight: width(0)
                    }
                  }} phoneProps={{
                    ...Platform.select({
                    ios: {
                    color: '#000000',
                    },
                    }),
                    wrapperStyle: {
                      marginLeft: width(0)
                    },

                    placeholder: 'Mobile number',
                    onSubmitEditing: () => this.onSubmitEditing('phone')
                  }}
                  value={fields.phone}
                  onChangeText={text => this.onFieldChange('phone', text)}/>
              }

            </View>

              <Sep type="andOr" />
              <View style={styles.mailInputWrapper}>
                <StdInput
                  {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}
                  placeholderTextColor="#7F7F7F"
                  refName={comp => this['email'] = comp}
                  returnKeyType='done'
                  customItemStyle={{color: '#000000'}}
                  placeholder="Email Address"
                  value={email}
                  keyboardType='email-address'
                  onChangeText={text => this.onFieldChange('email', text)} />
              </View>
              <Sep />
            </View>
          </View>
          </KeyboardAwareScrollView>
          <View style={styles.bottomPart}>
            <View style={styles.btnWrapperPart}>
              <View style={styles.btnWrapper}>
                <StdBtn type="btImage" textStyle={{fontSize: width(4.5)}} text={
                  fields.fName?
                  'Invite ' + fields.fName
                  : 'Invite friend'
                  }
                  onPress={() => this.confirm()} />
              </View>
            </View>
          </View>
        </View>
        <HintModal show={showError} type="text" hintData={error} />
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
  hinTextWrapper: {
   alignItems: 'center',
   justifyContent: 'center',
   paddingHorizontal: 20,
   paddingBottom: 20,
   textAlign: 'center'
  },
  hintText: {
    textAlign: 'center',
    fontSize: width(3.8),
    color: '#9F9F9F',
    lineHeight: 25,
  },
  wrapper: {
    flex: 1,
    height: height(100),
    backgroundColor: 'white',
  },
  contentContainerStyle: {
    minHeight: '100%'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textsWrapper: {
    marginTop: width(12),
    width: width(88),
    flexShrink: 1
  },
  titleText: {
    fontSize: width(5),
    color: '#646464',
    fontWeight: '500'
  },
  infoText: {
    fontSize: width(4.2),
    color: '#ADADAD',
    marginTop: width(2),
    lineHeight: width(6.6)
  },
  formWrapper: {
    marginTop: width(4),
    width: width(90),
    justifyContent: 'flex-start'
  },
  phoneInputWrapper: {
    height: width(20),
    width: '100%'
  },
  mailInputWrapper: {
    paddingVertical: width(0.5),
    width: '100%',
    height: width(18)
  },
  bottomPart: {
  },
  btnWrapperPart: {
  },
  btnWrapper: {
    height: isIphoneX()
      ? width(18)
      : width(13),
    width: width(100),
    justifyContent: 'center',
    alignItems: 'center'
  }
})
