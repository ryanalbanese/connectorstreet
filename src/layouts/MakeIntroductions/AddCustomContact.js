import React, {Component} from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ImageEditor,
  KeyboardAvoidingView,
  ActivityIndicator,
  PermissionsAndroid
} from 'react-native'
import ImagePicker from 'react-native-image-picker'
import Contacts from 'react-native-contacts'
import Permissions from 'react-native-permissions'
import {NavigationActions} from 'react-navigation';
import RNFS from 'react-native-fs'
import ImageResizer from 'react-native-image-resizer';
import RNFetchBlob from 'rn-fetch-blob'
import FastImage from 'react-native-fast-image'
import ImageCropper from 'react-native-image-crop-picker';
import { KeyboardAccessoryView } from 'react-native-keyboard-accessory'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'

import {
  width,
  height,
  iconImages,
  alphabet,
  isIphoneX,
  requiredList,
  serverUrls,
  imageInBase64
} from 'constants/config'

import {
  checkRequestPermission,
  requestContactsPermission
} from 'constants/helpers'

import {cleanPhoneNumb, getAuthHeader, checkNextProps, fullCleanPhone, connectWithNavigationIsFocused} from 'utils'
import * as ApiUtils from 'actions/utils'
import fetchServ from 'actions/fetchServ'
import NavBar from 'components/NavBar'
import PhoneInput from 'components/PhoneInput'
import PhoneInputPicker from 'components/PhoneInputPicker'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import StdBtn from 'components/StdBtn'
import SmallRoundBtn from 'components/SmallRoundBtn'
import HintModal from 'components/HintModal'
import ShowImagePickModal from 'components/ShowImagePickModal'
import ModalSelectPhoto from './ModalSelectPhoto';
import * as Models from 'models'

var options = {
  title: 'Select Avatar',
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

const errorHints = {
  emailError: {
    title: 'Invalid Email Address',
    text: 'The email address must contain an "@" sign.'
  },
  introduceYourSelf: {
    title: 'Oops! You can’t introduce yourself to others.',
    text: 'We don’t allow you to introduce yourself to other people. We do this to keep the app free of spam.'
  },
  requeredFieldsEmpty: {
    title: 'Oops! Some fields are empty.',
    text: 'You should fill all fields that are marked with red dot.'
  },
  phonePickerEmpty: {
    title: 'Oops! Please enter a phone number.',
    text: 'You can select a phone number or enter a custom one. '
  },
  introduceSamePerson: {
    title: 'Oops! You can\'t introduce the same person.',
    text: 'We don’t allow you to introduce someone to themselves. We do this to keep the app free of spam.'
  }
}

const fieldsOrder = ['fName', 'sName', 'nickName','phone', 'email']

@connectWithNavigationIsFocused(state => ({
  userData: state.userData,
  inviteUser: state.inviteUser,
  getUsers: state.getUsers,
  contacts: state.contacts,
  logger: state.logger,
  countryCodes: state.countryCodes,
  phoneIndex: state.phoneIndex,
  makeIntroductionData: state.makeIntroductionData}),
dispatch => ({
  setMakeIntroductionData: (data) => {
    dispatch(ApiUtils.setMakeIntroductionData(data))
  },
  actionGetUsers(filters, headers) {
    dispatch(fetchServ({
      ...serverUrls.getUsers,
      url: serverUrls.getUsers.url
    }, filters, headers, 'GETUSERS'))
  },
  setPhoneIndex: (data) => {
    dispatch(ApiUtils.setPhoneIndex(data))
  },
  setContacts: (contacts) => {
    dispatch(ApiUtils.setContacts(contacts))
  },
  resetMakeIntroductionData: () => {
    dispatch(ApiUtils.resetMakeIntroductionData())
  },
  actionLog: (payload) => {
    dispatch(Models.logger.logger(payload))
  }
}))

export default class AddCustomContact extends Component {

  constructor(props) {
    super(props);
    const {navigation, contacts} = this.props
    const contactInfo = navigation.state && navigation.state.params && navigation.state.params.contactInfo
    const recordID = navigation.state && navigation.state.params && navigation.state.params.contactInfo && navigation.state.params.contactInfo.recordID
    const phone = navigation.state && navigation.state.params && navigation.state.params.contactInfo && navigation.state.params.contactInfo && navigation.state.params.contactInfo.phone
    const phoneNumbers = navigation.state && navigation.state.params && navigation.state.params.contactInfo && navigation.state.params.contactInfo && navigation.state.params.contactInfo.phoneNumbers
    const hasBase64 = navigation.state && navigation.state.params && navigation.state.params.hasBase64
    let foundNumbers = []
    let foundCustomPhone = ''
    let isNewContact = ''
      if (!phoneNumbers){

      }
      else {
        for (var item of contacts.data) {
          if (item.recordID === recordID){
            foundNumbers = item.phoneNumbers
          }
        }

        const findPhoneInData = contactInfo.phoneNumbers.find(item => item.number.indexOf(contactInfo.origPhone) != -1)

        if (!findPhoneInData){

          foundCustomPhone = contactInfo.origPhone

        }

      }

      let showUpdate

      if (navigation.state && navigation.state && navigation.state.params.newContact){
        showUpdate = false
      }
      else {
          if (foundNumbers && foundNumbers.length === 0){
            showUpdate = true
          }
          else {
            showUpdate = true
          }
      }
    const fields = {
      fName: contactInfo && contactInfo.fName || '',
      sName: contactInfo && contactInfo.sName || '',
      nickName: '',
      phone: contactInfo && contactInfo.defaultPhone || phone || '',
      customPhone : foundCustomPhone || '',
      origPhone : contactInfo && contactInfo.origPhone || contactInfo && contactInfo.defaultPhone || '',
      origCleadPhone: contactInfo && contactInfo.origCleadPhone || '',
      phoneNumbers: contactInfo && contactInfo.phoneNumbers || foundNumbers || '',
      recordID : recordID || '',
      newContact : navigation.state && navigation.state.params.newContact || foundNumbers && foundNumbers.length === 0 ? true : false || '',
      showUpdate: showUpdate || '',
      hideText: navigation.state && navigation.state.params.hideText,
      email: contactInfo && contactInfo.email || '',
      agree: false,
      update: false,
      avatar: contactInfo && contactInfo.avatar || '',
      avatarSource: contactInfo && contactInfo.avatarSource || ''
    }
    this.state = {
      fields,
      showCustom : foundCustomPhone
      ? true
      : false,
      showError: false,
      isLoading: false,
      hasBase64: hasBase64 || '',
      showPickerModal: false,
      modalSelectPhotoShow: false,
      checkedPhotoId: -1
    }

  }

  isRelativePath = (imageData) => {
    var pattern = /\.(gif|jpe?g|png|)$/i;
    return pattern.test(imageData)
  }

  isImageLink = (imageData) => {
    return imageData.includes('https:')
  }

  isAndroidImage = (imageData) => {
    return imageData.includes('content://')
  }

  onFieldChange = (fieldName, value) => {

    let newStateFields = this.state.fields

    if (typeof value == 'boolean') {

      newStateFields[fieldName] = !newStateFields[fieldName]

    }

    else {

      if (fieldName == 'customPhoneNum'){
        newStateFields['customPhone'] = value
        newStateFields['origPhone'] = value
        newStateFields['phone'] = value
        newStateFields['defaultPhone'] = ''
        newStateFields['picker'] = ''

      }

      if (value === 'customPhone' && fieldName ==='picker'){
        newStateFields['origPhone'] = ''
        newStateFields['phone'] = ''
        newStateFields['defaultPhone'] = ''
        newStateFields['picker'] = ''
        this.setState({
          showCustom: true
        })

      }

      else if (fieldName === 'picker'){

        newStateFields['origPhone'] = value
        newStateFields['phone'] = value
        newStateFields['defaultPhone'] = ''

        this.setState({
          showCustom: false,
        })

      }

      else if (fieldName === 'phone'){
        newStateFields['phone'] = fullCleanPhone(value)
      }
      newStateFields[fieldName] = value

    }

    this.setState({fields: newStateFields},
      () => {})

  }

  onModalSelectPhotoBtnPress = (btnKey, pictrueId) => {

    switch (btnKey) {
      case 'close':
        this.setState({modalSelectPhotoShow: false})
        break
      case 'cameraRoll':
        this.setState({
          modalSelectPhotoShow: false
        }, () => {
          this.onCameraRollPress()
        })
        break
      case 'take':
        this.setState({
          modalSelectPhotoShow: false
        }, () => {
          this.onTakePhotoPress()
        })
        break
      case 'picture':

        if (pictrueId != -1) {
          this.setState({
            checkedPhotoId: pictrueId
          }, () => {

            setTimeout(() => {
              this.setState({
                prevValue: this.state.fields.avatarSource
              }, () => {
                this.onFieldChange('avatar', imageInBase64[pictrueId])
                this.onFieldChange('avatarSource', imageInBase64[pictrueId])
                this.onFieldChange('avatarExtension', 'png')
                this.setState({
                  modalSelectPhotoShow: false
                }, () => this.setState({modalCompleteShow: true}))
              })
            }, 500)
          })
          break
        }
      }
  }

  onAddAvatarPress = () => {
    this.setState({modalSelectPhotoShow: true, hasBase64: true})
  }

  showErrorHint = () => {
    this.setState({
      showError: true
    }, () => {
      setTimeout(() => {
        this.setState({showError: false})
      }, 5000)
    })
  }

  componentWillMount(){

    const {userData, navigation, actionLog} = this.props

    const personKey = navigation.state.params && navigation.state.params.personKey

    const {fields} = this.state


    actionLog({
      "level":"debug",
      "message":"{module : CONTACT_LIST, method: UI_SELECT_CONTACT, "+JSON.stringify(userData.userModel)+", "+JSON.stringify(fields)+"}"
    })

    personKey === 'fPerson'
    ? this.setState({showCountryBanner: false},
    () => setTimeout(() => {
			this.setState({showCountryBanner: false})
		}, 5000))
    : null
  }

  componentWillReceiveProps(nextProps) {

    const {userData, navigation, setMakeIntroductionData, actionInviteUser, state, setPhoneIndex, makeIntroductionData} = this.props
    const {newContact} = navigation.state && navigation.state.params && navigation.state.params

    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'Intro'})],
      key: null
    })

    const goToLogin = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'LoginStack'})],
      key: null
    })

    const propsCheckerSendSms = checkNextProps(nextProps, this.props, 'sendSms')
    if (propsCheckerSendSms == 'error') {
      const error = nextProps.sendSms.error
      this.setState({
        isLoading: false
      }, () => {
        Alert.alert(error.msg, null, [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ], {
          onDismiss: () => navigation.goBack()
        })
      });
    }
    else if (propsCheckerSendSms) {
    const data = nextProps.sendSms.response
    }
    const propsCheckerGetUsers = checkNextProps(nextProps, this.props, 'getUsers', 'noway')

    if (propsCheckerGetUsers == 'error') {
      const error = nextProps.getUsers.error
      this.setState({isLoading: false});
      if (error.msg != "Token has expired.") {
        Alert.alert(error.msg)
      }
      else {
        Alert.alert('Your session has expired. Please login again.', null, [
          {text: 'Login', onPress: () => navigation.dispatch(goToLogin)}
        ])
      }
    }
    else if (propsCheckerGetUsers) {
      const data = nextProps.getUsers.response
      const personKey = navigation.state.params && navigation.state.params.personKey
      const {fields} = this.state
      const isLink = this.isImageLink(fields.avatar)
      const isRelative = this.isRelativePath(fields.avatar)
      const isAndriodImg = this.isAndroidImage(fields.avatar)
      const cleanedPhone = fields.customPhone? fullCleanPhone(fields.customPhone) : fullCleanPhone(fields.phone)

      if (data) {
        if (personKey === 'sPerson' && makeIntroductionData.fPerson.phone == data.mobilePhone || personKey === 'fPerson' && makeIntroductionData.sPerson.phone == data.mobilePhone){

            this.setState({
              isLoading: false,
              error: errorHints.introduceSamePerson
            }, () => {
              this.showErrorHint()
            })
        }


        else if (data.mobilePhone == userData.userModel.user){
          this.setState({
            isLoading: false,
            error: errorHints.introduceYourSelf
          }, () => {
            this.showErrorHint()
          })
        }

        else {
          setMakeIntroductionData({
            [personKey]: {
              csUser: true,
              avatar: data.avatar,
              email: data.email,
              fName: data.firstName,
              sName: data.lastName,
              nickName: data.nickname,
              customPhone: fields.customPhone || '',
              newContact : newContact?true : false,
              phoneNumbers : fields.phoneNumbers,
              phone: data.mobilePhone,
              recordID : fields.recordID,
              origCleadPhone: cleanedPhone,
              origPhone: fields.origPhone,
              userId: data.user_uid,
              user_uid: data.user_uid
            }
          })
          this.setState({
            isLoading: false,
          }, () => {
            if (navigation.state.params.fromScreen === 'SelectAndEditMessage'){
              navigation.navigate('SelectAndEditMsg')
            }
            else {

              navigation.navigate('Intro', {localPrevScreen: 'AddCustomContact'})
            }
          })
        }

      }
      else {

        if (!isLink && isRelative){
          RNFS.readFile(fields.avatar, 'base64')
           .then((data) => {

             setMakeIntroductionData({
               [personKey]: {
                 csUser: false,
                 avatar: 'data:image/jpg;base64, ' + data,
                 avatarSource:  data,
                 email: fields.email,
                 fName: fields.fName,
                 sName: fields.sName,
                 recordID : fields.recordID,
                 customPhone: fields.customPhone || '',
                 phoneNumbers : fields.phoneNumbers,
                 nickName: fields.nickName,
                 phone: cleanedPhone,
                 origCleadPhone: cleanedPhone,
                 origPhone: fields.origPhone,
                 newContact : newContact? true : false,
               }
             })
             this.setState({
               isLoading: false,
             }, () => {
               if (navigation.state.params.fromScreen === 'SelectAndEditMessage'){
                 navigation.navigate('SelectAndEditMsg')
               }
               else {

                 navigation.navigate('Intro', {localPrevScreen: 'AddCustomContact'})
               }
             })
           })
        }
        else if (isAndriodImg){

          let file  = RNFS.readFile(fields.avatar, 'base64').then(data => {
            setMakeIntroductionData({
              [personKey]: {
                csUser: false,
                avatar: 'data:image/jpg;base64, ' + data,
                avatarSource:  data,
                email: fields.email,
                fName: fields.fName,
                sName: fields.sName,
                recordID : fields.recordID,
                customPhone: fields.customPhone || '',
                phoneNumbers : fields.phoneNumbers,
                nickName: fields.nickName,
                phone: cleanedPhone,
                origCleadPhone: cleanedPhone,
                origPhone: fields.origPhone,
                newContact : newContact? true : false,
              }
            })
            this.setState({
              isLoading: false,
            }, () => {
              if (navigation.state.params.fromScreen === 'SelectAndEditMessage'){
                navigation.navigate('SelectAndEditMsg')
              }
              else {
                navigation.navigate('Intro', {localPrevScreen: 'AddCustomContact'})
              }
            })
          })

        }
        else {
          setMakeIntroductionData({
            [personKey]: {
              csUser: false,
              avatar: fields.avatar || '',
              email: fields.email,
              fName: fields.fName,
              sName: fields.sName,
              recordID : fields.recordID,
              customPhone: fields.customPhone || '',
              phoneNumbers : fields.phoneNumbers,
              nickName: fields.nickName,
              phone: cleanedPhone,
              origCleadPhone: cleanedPhone,
              origPhone: fields.origPhone,
              newContact : newContact,
            }
          })
          this.setState({
            isLoading: false,
          }, () => {
            if (navigation.state.params.fromScreen === 'SelectAndEditMessage'){
              navigation.navigate('SelectAndEditMsg')
            }
            else {
              navigation.navigate('Intro', {localPrevScreen: 'AddCustomContact'})
            }
          })
        }
      }
    }
  }

  confirm = (fields) => {
    const {state,navigation, setMakeIntroductionData, userData, actionGetUsers, contacts, makeIntroductionData} = this.props
    const {isLoading} = this.state
    const cleanedPhone = fullCleanPhone(fields.phone)

    const personKey = navigation.state.params && navigation.state.params.personKey
    if (!fields.email == '' && !fields.email.includes("@")){
      this.setState({
        error: errorHints.emailError
      }, () => {
        this.showErrorHint()
      })
    }
    else if (cleanedPhone == userData.userModel.mobilePhone || cleanedPhone == userData.userModel.user || userData.userModel.email == fields.email.toLowerCase()) {
      this.setState({
        error: errorHints.introduceYourSelf
      }, () => {
        this.showErrorHint()
      })

    }
    else if (personKey === 'sPerson' && makeIntroductionData.fPerson.phone == cleanedPhone || personKey === 'fPerson' && makeIntroductionData.sPerson.phone == cleanedPhone){
      this.setState({
        error: errorHints.introduceSamePerson
      }, () => {
        this.showErrorHint()
      })
    }
    else if (this.checkConfirmDisabled(fields)) {
      this.setState({
        error: errorHints.requeredFieldsEmpty
      }, () => {
        this.showErrorHint()
      })

    }
    else if (fields.phone === 'US(+1) ' || fields.phone === 'custom' || fields.phone === ' '){
      this.setState({
        error: errorHints.phonePickerEmpty
      }, () => {
        this.showErrorHint()
      })
    }
    else {

      const personKey = navigation.state.params && navigation.state.params.personKey

      const contactInfo = navigation.state && navigation.state.params && navigation.state.params.contactInfo

      // If update contact checkbox is checked

      if (fields.update) {

        // Retrieve a fresh contact list Copy
       Contacts.getAll((err, contacts) => {

          // Set Mobile and Email Flags

          var updateMobile = false

          var updateEmail = false

          // Find and match Record ID to current user

          let recordIDs = []

          for (let i = 0; i < contacts.length; i++) {

            if (contacts[i].recordID === contactInfo.recordID) {

              // Store Contact Object on Match

              recordIDs.push(contacts[i])

            }

          }

          // Push record ID to the Field Object

          fields.recordIDs = recordIDs

          // Loop through current list of users email addresses
          if (fields.recordIDs[0]){
            for (let i = 0; i < fields.recordIDs[0].emailAddresses.length; i++) {

              // If a duplicate record is found, do not update the contact

              if (fields.recordIDs[0].emailAddresses[i].email === fields.email) {

                updateEmail = false;

                break;

              }

              // If no duplicate is found, set flag to add email address

              else {

                  updateEmail = true;

              }

            }
            if (fields.recordIDs[0] && fields.recordIDs[0].emailAddresses.length == 0){
              updateEmail = true;
            }
            if (fields.recordIDs[0] && fields.recordIDs[0].phoneNumbers.length != 0){
              for (let i = 0; i < fields.recordIDs[0].phoneNumbers.length; i++) {

                // Format phone numbers to only contain numeric values

                var contactPhone = fields.recordIDs[0].phoneNumbers[i].number.replace(/[^0-9.]/g, "")

                // Format saved phone number to only contain numeric values

                var cleanedFormPhone = cleanedPhone.replace(/[^0-9.]/g, "")


                // If the current phone number matches what's in the fields, don't add a new phone number

                if (contactPhone === cleanedFormPhone) {

                  updateMobile = false;

                  break;

                }

                else {

                  updateMobile = true;

                }

              }
            }

            else {
              updateMobile = true;
            }

          }

          // If email and mobile flags are true, update both fields

          if (updateEmail && updateMobile){

            fields.recordIDs[0].emailAddresses.push({label: "Connector Street", email: fields.email})

            fields.recordIDs[0].phoneNumbers.push({label: "mobile", number: cleanedPhone})

          }

          else {

            // If only the email is true, only update the email address

            if (updateEmail){

              fields.recordIDs[0].emailAddresses.push({label: "Connector Street", email: fields.email})

            }

            // If only the mobile is true, only update the mobile phone

            if (updateMobile){

              fields.recordIDs[0].phoneNumbers.push({label: "Connector Street", number: cleanedPhone})

            }

          }

          if (Platform.OS === 'ios'){
            Contacts.updateContact(fields.recordIDs[0], (err) => {

              }
            )
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

                          Contacts.updateContact(fields.recordIDs[0], (err) => {


                            }
                          )
                      }
                    })
                  })
          }

        })

      }

      if (!contactInfo) {

        Contacts.getAll((err, contacts) => {



          }

        )

        if (fields.agree) {

          const findExistingPhoneIncontacts = contacts && contacts.data.find(item => item && item.cleanedPhone && item.cleanedPhone == cleanedPhone)

          if (!findExistingPhoneIncontacts) {

            const newPerson = {
              emailAddresses: [
                {
                  label: "ConnectorStreet",
                  email: fields.email
                }
              ],
              familyName: Platform.OS == 'ios'
                ? fields.sName
                : '',
              givenName: Platform.OS == 'ios'
                ? fields.fName
                : fields.fName + ' ' + fields.sName,
              phoneNumbers: [
                {
                  label: "mobile",
                  number: cleanedPhone
                }
              ]
            }

            Permissions.check('contacts').then(response => {

              if (response == 'authorized') {
                if (Platform.OS === 'ios'){
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

                        })
                      }
                    })
                  })
                }


              }
            })

          } else {

          }
        }
      }

      if (personKey) {
        const cleanedPhone = fullCleanPhone(fields.phone)
        this.setState({
          isLoading: true
        }, () => {
          actionGetUsers({
            mobilePhone: cleanedPhone
          }, getAuthHeader(userData.token))
        })

      }
    }
  }

  getContactts = () => {
    const {setContacts, countryCodes} = this.props
    const countryCodesArray = countryCodes.response
    Contacts.getAll((err, contacts) => {

      if (err === 'denied') {} else {

        const contactsData = contacts.map(item => {
          if (!item)
            return null

          return {
            name: (item.givenName || '') +' '+ (item.familyName || ''),
            fName: item.givenName && item.givenName.split(' ')[0] || '',
            sName: Platform.OS == 'ios'
              ? item.familyName || ''
              : item.givenName && item.givenName.split(' ')[1] || item.familyName || '',
            phone: item.phoneNumbers[0] && item.phoneNumbers[0].number,
            avatar: item.thumbnailPath,
            email: item.emailAddresses && item.emailAddresses[0] && item.emailAddresses[0].email
          }
        })
        if (countryCodesArray) {
          setContacts(contactsData.map(contact => {
            if (!(contact && contact.phone))
              return null
            const phoneCleaned = fullCleanPhone(contact.phone)
            contact.cleanedPhone = phoneCleaned && ('+' + phoneCleaned)
            const realNumb = phoneCleaned.slice(-10).trim()
            let countryCode = '+' + phoneCleaned.replace(realNumb, '').trim()
            if (countryCode == '+')
              countryCode = '+1'
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

  back = () => {
    const {navigation} = this.props
    navigation.goBack()
  }

  checkConfirmDisabled = (fields) => {
    return !Object.keys(fields).every(
      fieldKey => requiredList['addCustomContact'].includes(fieldKey)
      ? !!fields[fieldKey]
      : true)
  }

  onSubmitEditing = (fieldName) => {
    const {onSubmit} = this.props
    const indexOfField = fieldsOrder.indexOf(fieldName)
    if (indexOfField < fieldsOrder.length - 1) {
      //this[fieldsOrder[indexOfField + 1]] && this[fieldsOrder[indexOfField + 1]].focus()
    }
  }

  onTakePhotoPress = () => {
    setTimeout(() => {
      ImageCropper.openCamera({
        width: 300,
        height: 300,
        compressImageQuality: .3,
        cropping: true,
        includeBase64: true
      }).then((imageObj) => {

        const res = {
          uri: imageObj.path,
          data: imageObj.data
        }
        this.onGetImageResponse(res)
      })
      .catch((error) => {
        if (error.code != 'E_PICKER_CANCELLED'){
          Alert.alert('Permission required', 'You need to allow access to your camera. You can do this in your settings.', [
            {text: "Cancel", style: "cancel"},
            {text: 'Open Settings', onPress: () => Linking.openSettings()}
          ], {
            onDismiss: () => navigation.goBack()
          })
        }
      })
    }, 500)
		// ImagePicker.launchCamera(options, (response)  => {
		// 	this.onGetImageResponse(response)
		// });
	}

  onCameraRollPress = () => {
    setTimeout(() => {
      ImageCropper.openPicker({
        width: 300,
        height: 300,
        compressImageQuality: .3,
        cropping: true,
        includeBase64: true
      }).then((imageObj) => {

        const res = {
          uri: imageObj.path,
          data: imageObj.data
        }
        this.onGetImageResponse(res)
      })
      .catch((error) => {
        if (error.code != 'E_PICKER_CANCELLED'){
          Alert.alert('Permission required', 'You need to allow access to your photo library. You can do this in your settings.', [
            {text: "Cancel", style: "cancel"},
            {text: 'Open Settings', onPress: () => Linking.openSettings()}
          ], {
            onDismiss: () => navigation.goBack()
          })
        }
      })
    }, 1000)
		// ImagePicker.launchImageLibrary(options, (response)  => {
		// 	this.onGetImageResponse(response)
		// });
  }

  onKeyPress = (ref) => {
    const {state} = this.props
    this.setState({

    })
  }

  onGetImageResponse = (response) => {

    if (response.didCancel){

      this.setState({
      isLoading: false
    })}
     else if (response.error) {} else if (response.customButton) {} else {
      this.setState({
        isLoading: false
      })
      this.onFieldChange('avatar', 'data:image/jpg;base64, ' + response.data)
      this.onFieldChange('avatarSource', response.data)

    }
  }

  pickerModalCallback = (result) => {
    switch (result) {
      case 'close':
        this.setState({showPickerModal: false, isLoading: false})
        break
      case 'takePicture':
        this.setState({
          showPickerModal: false
        }, () => this.onTakePhotoPress())
        break
      case 'cameraRoll':
        this.setState({
          showPickerModal: false
        }, () => this.onCameraRollPress())
        break
    }
  }

  render() {
    const {navigation, userData, makeIntroductionData, contacts, state, resetMakeIntroductionData} = this.props
    const personKey = navigation.state.params && navigation.state.params.personKey || ''

    const {
      fields,
      showError,
      error,
      showPickerModal,
      modalSelectPhotoShow,
      checkedPhotoId,
      showCustom,
      isLoading,
      showCountryBanner,
    } = this.state
    const {
      fName,
      sName,
      nickName,
      email,
      phone,
      customPhone,
      origPhone,
      origCleadPhone,
      phoneNumbers,
      agree,
      avatar,
      avatarSource,
      update,
      showUpdate,
      hideText
    } = fields
    const {newContact} = fields

    let setTitle = 'Add First Friend'

    if (navigation.state.params.personKey === 'sPerson'){

      setTitle = 'Add Second Friend'

    }

    if (navigation.state.params.fromScreen === 'SelectAndEditMessage'){

      setTitle = 'Edit Contact Info'

    }

    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        action: () => this.back()
      },
      centerPart: {
        text:   setTitle
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

    const hintData = {
      photo: {
        avatar: iconImages.fakeHintAvatar,
        title: 'New Message from Maurice Davidson',
        text: 'Thanks for the introduction!'
      }
    }

    return (
      <View style={styles.wrapper} contentContainerStyle={styles.contentContainerStyle}>

      <NavBar {...navBarProps} navigation={navigation}/>
      <View style={styles.content}>
      {showCountryBanner
        ? <View style={styles.countryCodeWrapper}>
          <TouchableOpacity onPress={()=> navigation.navigate('Settings', {fromScreen: 'AddCustomContact', personKey: personKey})}><Text style={styles.countryCodeText}>Your default country code is {userData.userModel.isocode}. Tap to change.</Text></TouchableOpacity>
        </View>
        : null
      }

        <KeyboardAwareScrollView keyboardShouldPersistTaps={"handled"} enableOnAndroid={true} extraHeight={240}
          showsVerticalScrollIndicator={false}>

          <View style={styles.topPart}>
            <View style={styles.avatarBtnWrapper}>
              <SmallRoundBtn backgroundColor="#F6F6F6" avatar={avatar} icon={contacts.Avatar? contacts.Avatar:iconImages.photoImageBlack}
                customWidth={width(17)} onPress={this.onAddAvatarPress}/>
            </View>
            <View style={styles.inputsWrapper}>
              <View style={styles.inputWrapper}>
                <StdInput
                {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}
                style={styles.inputStyle} placeholderTextColor="#7F7F7F" redDot="redDot" refName={comp => this['fName'] = comp} returnKeyType={"next"}
                  onSubmitEditing={() => this.onSubmitEditing('fName')}
                  placeholder="First Name" value={fName} onChangeText={text => this.onFieldChange('fName', text)}/>
              </View>

              <Sep/>

              <View style={styles.inputWrapper}>
                <StdInput style={styles.inputStyle}
                {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}
                placeholderTextColor="#7F7F7F" redDot="redDot" refName={comp => this['sName'] = comp} returnKeyType={"next"}
                  onSubmitEditing={() => this.onSubmitEditing('sName')} placeholder="Last Name" value={sName}
                  onChangeText={text => this.onFieldChange('sName', text)}/>
              </View>



              <Sep/>
              {
                newContact ?

                <View style={styles.inputWrapper}>
                  <PhoneInput style={styles.inputStyle} placeholderTextColor="#7F7F7F" refName={comp => this['phone'] = comp} countryProps={{
                      wrapperStyle: {
                        paddingRight: width(0)
                      }
                    }} phoneProps={{
                      wrapperStyle: {
                        marginLeft: width(0)
                      },
                      ...Platform.select({
                      ios: {
                      color: '#000000',
                      },
                      }),
                      redDot: true,
                      placeholder: 'Mobile number',
                      onSubmitEditing: () => this.onSubmitEditing('origPhone')
                    }} value={customPhone}
                    {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}
                    customItemStyle={{height: 80}}
                    onChangeText={text => this.onFieldChange('customPhoneNum', text)}/>
                </View>
                :
                <View style={styles.inputWrapper}>
                  <PhoneInputPicker style={styles.inputStyle} placeholderTextColor="#7F7F7F" refName={comp => this['origPhone'] = comp}  phoneProps={{
                      wrapperStyle: {
                        marginLeft: width(0),
                        height:600
                      },
                      redDot: false
                    }}
                    {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}
                    customItemStyle={{placeholderTextColor: "#7F7F7F", height: 100}}
                    value={customPhone != ''?
                      'custom'
                      : origPhone}
                    phoneData={phoneNumbers} onChangeText={text => this.onFieldChange('picker', text)}
                  />
                </View>

              }
              { !newContact && showCustom?
                <Sep/>
                : null
              }
              { !newContact && showCustom?

                <View style={styles.inputWrapper}>
                  <PhoneInput style={styles.inputStyle} placeholderTextColor="#7F7F7F"  refName={comp => this['origPhone'] = comp} countryProps={{
                      wrapperStyle: {
                        paddingRight: width(0)
                      }
                    }} phoneProps={{
                      wrapperStyle: {
                        marginLeft: width(6)
                      },
                      redDot: true,
                      placeholder: 'Custom phone number'

                    }}
                    {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}
                    customItemStyle={{height: 85}}
                    value={
                                 customPhone
                              } onChangeText={text => this.onFieldChange('customPhoneNum', text)} />
                </View>

              : null
            }

            <Sep/>

              <View style={styles.inputWrapper}>
                <StdInput style={styles.inputStyle}
                {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}

                placeholderTextColor="#7F7F7F" refName={comp => this['email'] = comp} returnKeyType={'done'} onSubmitEditing={() => this.onSubmitEditing('email')}
                  placeholder="Email Address" value={email} keyboardType='email-address' onChangeText={text => this.onFieldChange('email', text)}/>
              </View>
              <Sep/>
            </View>
            {
              newContact && !showUpdate
                ? <TouchableOpacity onPress={() => this.onFieldChange('agree', !agree)}>
                    <View style={styles.checkBoxWrapper}>
                      <View style={styles.checkBoxIconImageWrapper}>
                        <Image style={styles.checkBoxIconImage} source={agree
                            ? iconImages.checkBoxCheckedImage
                            : iconImages.checkBoxImage
}/>
                      </View>

                      <Text style={styles.checkBoxText}>
                        Add to contacts?
                      </Text>

                    </View>
                  </TouchableOpacity>
                : <TouchableOpacity onPress={() => this.onFieldChange('update', !update)}>
                    <View style={styles.checkBoxWrapper}>
                      <View style={styles.checkBoxIconImageWrapper}>
                        <Image style={styles.checkBoxIconImage} source={update
                            ? iconImages.checkBoxCheckedImage
                            : iconImages.checkBoxImage
}/>
                      </View>

                      <Text style={styles.checkBoxText}>
                        Update contact info?
                      </Text>

                    </View>
                  </TouchableOpacity>

            }


          </View>
        </KeyboardAwareScrollView>
        {
          newContact && !hideText
          ? <View style={styles.hinTextWrapper}>
              <Text style={styles.hintText}>
               Mobile number not showing up?
              </Text>
              <Text style={styles.hintText}>
                Tap refresh button on previous screen.
              </Text>
            </View>
          :null
        }

        <View style={styles.bottomPart}>
          <View style={styles.btnWrapperPart}>
            <View style={styles.btnWrapper}>
              <StdBtn type="btImage" textStyle={{
                  fontSize: width(4.5)
                }} text="Confirm" onPress={() => this.confirm(fields)}/>
            </View>
          </View>
        </View>

      </View>
      <ModalSelectPhoto onBtnPress={this.onModalSelectPhotoBtnPress} checkedPhotoId={checkedPhotoId} visible={modalSelectPhotoShow}/>
      <HintModal show={showError} type="text" hintData={error}/>
      <ShowImagePickModal callback={this.pickerModalCallback} show={showPickerModal}/>
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
    flex: 1,
    backgroundColor: 'white',
    height: height(100)
  },
  inputStyle: {
    ...Platform.select({
      ios: {
        color: "#000000",
      }
    })
  },
  contentContainerStyle: {
    minHeight: '100%'
  },
  hinTextWrapper: {
   alignItems: 'center',
   justifyContent: 'center',
   paddingHorizontal: width(10),
   textAlign: 'center'
  },
  hintText: {
    textAlign: 'center',
    fontSize: width(3.8),
    color: '#9F9F9F',
  },
  countryCodeWrapper:{
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
    justifyContent:'center',
    flexDirection: 'row'
  },
  countryCodeText:{
    fontSize: 12
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  avatarBtnWrapper: {
    marginTop: width(4),
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputsWrapper: {
    marginTop: width(2),
    width: width(86)
  },
  inputWrapper: {
    width: '100%',
    height: isIphoneX()
      ? width(24)
      : width(18)
  },
  checkBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width(5),
    marginBottom: width(10)
  },
  checkBoxIconImageWrapper: {
    height: width(8),
    width: width(8)
  },
  checkBoxIconImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain'
  },
  checkBoxText: {
    fontSize: width(3.9),
    marginLeft: width(4)
  },
  topTextsWrapper: {
    marginTop: width(10),
    width: width(80),
    flexShrink: 1
  },
  titleText: {
    fontSize: width(5),
    color: '#646464'
  },
  infoText: {
    marginTop: width(2),
    fontSize: width(4.2),
    color: '#ADADAD',
    lineHeight: width(6.6)
  },
  roundBtnsWrapper: {
    marginTop: width(10),
    width: width(74),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  middleTextsWrapper: {
    marginTop: width(10),
    width: width(80)
  },
  roundedBtnsWrapper: {
    marginTop: width(5),
    width: width(86),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  viewWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomPart: {
    // marginTop: width(9.1),
    width: width(100),
    alignSelf: 'flex-end'
  },
  btnWrapper: {
    marginTop: 20,
    height: isIphoneX()
      ? width(22)
      : width(14)
  }
})
