import React, { Component } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Keyboard, Platform, RefreshControl,ActivityIndicator, Alert, ScrollView, TouchableOpacity, Linking, InteractionManager, Fragment, PermissionsAndroid } from 'react-native'
import { connect } from 'react-redux'
import { NavigationActions } from 'react-navigation';
import { width, height, iconImages, alphabet, imageInBase64, serverUrls } from 'constants/config'
import Permissions from 'react-native-permissions'
import openSettings from 'react-native-permissions'
import Contacts from 'react-native-contacts'
import { checkNextProps, fullCleanPhone, cleanPhoneNumb, getAuthHeader } from 'utils'
import NavBar from 'components/NavBar'
import SearchInput from 'components/SearchInput'
import RoundInput from 'components/RoundInput'
import ContactList from 'components/ContactList'
import HintModal from 'components/HintModal'
import RoundedBtn from 'components/RoundedBtn'
import * as ApiUtils from 'actions/utils'
import ButtonGroupNav from '../../components/ButtonGroupNav'
import * as Models from 'models'
import _ from 'lodash'

const errorHints = {
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


function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

@connect(
  state => ({
    userData: state.userData,
    contacts: state.contacts,
    countryCodes : state.countryCodes,
    setContacts : state.setContacts,
    permanentContacts: state.permanentContacts,
    userData: state.userData,
    getUsers: state.getUsers,
    contactsExist: state.contactsExist,
    remoteContacts: state.remoteContacts,
    makeIntroductionData: state.makeIntroductionData,
    logger: state.logger
  }),
  dispatch => ({
    setMakeIntroductionData: (data) => {
      dispatch(ApiUtils.setMakeIntroductionData(data))
    },
    actionLog: (payload) => {
      dispatch(Models.logger.logger(payload))
    },
    dispatch: dispatch,
    setContacts: (contacts, type) => {
      dispatch(ApiUtils.setContacts(contacts, type))
    },
    resetMakeIntroductionData: () => {
      dispatch(ApiUtils.resetMakeIntroductionData())
    },
    setPermanentContacts: (data, type) => {
      dispatch(ApiUtils.setPermanentContacts(data, type))
    },
    actionGetRemoteList: (token) => {
      dispatch(Models.remoteContacts.remoteContacts(token))
    },
    actionGetUsers(filters, headers) {
      dispatch(fetchServ({
        ...serverUrls.getUsers,
        url: serverUrls.getUsers.url
      }, filters, headers, 'GETUSERS'))
    }
  })
)

export default class SelectContact extends Component {

  constructor(props) {
    super(props);
    const fields = {
      search: '',
      customContact: ''
    }
    this.state = {
      fields,
      selectedIndex:
      this.props.contacts && this.props.contacts.listType === 'remote'
      ? 1
      : 0,
      showError: false,
      error: '',
      showUserErrorHint: false,
      searchFocused: false,
      isLoading: true,
      isLoadingUser: false,
      refreshing: false,
      list: alphabet,
    }
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    this.updateIndex = this.updateIndex.bind(this)

  }

  updateIndex (selectedIndex) {
    const {actionGetRemoteList, userData} = this.props
    this.setState({selectedIndex, isLoading: true, backgroundRefresh: false}, ()=> {
      if (this.state.selectedIndex === 0){
        this.getContacts()
      }
      if (this.state.selectedIndex === 1){
        actionGetRemoteList(userData.token)
      }
    })
  }

  _keyboardDidShow = () => {
    this.setState({keyboardIsOpened: true})
  }

  _keyboardDidHide = () => {
    this.setState({keyboardIsOpened: false})
  }

  _retrieveContacts = () => {

    const { setContacts, countryCodes, cleanPhoneNumb, NavigationActions, setPushNotifData, setPermanentContacts, permanentContacts, actionSendContacts, userData} = this.props

    const countryCodesArray = countryCodes.response && countryCodes.response.sort()

    let numbersArr = []

    Contacts.getAll((err, contacts) => {

        const contactsData = contacts.map(item => {

          if (!item) return null

          let mapContacts = [],
          isUser = false,
          foundDefaultPhone = '',
          foundPhoneFlag = false,
          setEmail,
          foundEmail = false

          item.phoneNumbers.map((item, index) => {

            if (item.label == 'mobile' || item.label == 'iPhone'){

              foundDefaultPhone = item.number
              foundPhoneFlag = true
            }

            if (!foundPhoneFlag){
              foundDefaultPhone = item.number
            }

            if (permanentContacts.response.length > 0){
              permanentContacts.response.map((number, index) => {
                if (item.number.replace(/\D+/g, "") == number.number && number.user == false){
                  isUser = true
                }
              })
            }
            numbersArr.push({
              mobilePhone: item.number.replace(/\D+/g, ""),
              user: false
            })

            mapContacts.push({
              label : item.label || 'Phone',
              number : item.number,
            })

          })

          item.emailAddresses.map((item, index) => {

            if (item.label === 'Connector Street'){
              setEmail = item.email
              foundEmail = true
            }

            if (!foundEmail){
              setEmail = item.email  || ''
            }

          })

          return {
            name: (item.givenName || '') +' '+ (item.familyName || ''),
            fName: item.givenName && item.givenName || '',
            isUser: isUser,
            sName: Platform.OS == 'ios'
              ? item.familyName || ''
              : item.givenName && item.givenName.split(' ')[1] || item.familyName || '',
            phoneNumbers : mapContacts,
            phone: ' ',
            defaultPhone : foundDefaultPhone || '',
            avatar: item.thumbnailPath || '',
            recordID : item.recordID,
            email: setEmail || ''
          }

        })

        if (countryCodesArray) {

          // Check if the new contacts don't match the saved contact list

          if (permanentContacts.response.length != numbersArr.length){

            // Find the difference between the two lists

            let dif = numbersArr.filter(e => !permanentContacts.response.find(a => e.number == a.number));

            let dataToSend = [],
            iterator = 0

            // Get the numbers and format the data

            dif.map((item) => {

              dataToSend.push({
                contactID: iterator.toString(),
                mobilePhone: item.number
                })

              iterator ++

            })

            // Send the Data via API

            actionSendContacts(userData.token, dataToSend)

          }

          setContacts(contactsData.map(contact => {
              return contact
            }).filter(item => item))

        }

    })

  }

  showErrorHint = () => {
    this.setState({
      showError: true
    }, () => {
      setTimeout(() => {
        this.setState({showError: false})
      }, 2000)
    })
  }

  showUserErrorHint = () => {
    this.setState({
      showUserError: true,
      isLoadingUser: false,
    }, () => {
      setTimeout(() => {
        this.setState({showUserError: false})
      }, 4000)
    })
  }

  onFieldChange = (fieldName, value) => {
    let newStateFields = this.state.fields
    newStateFields[fieldName] = value
    this.setState({fields: newStateFields})
  }

  close = () => {
    const { navigation } = this.props
    navigation.goBack()
  }

  onListItemPress = (item, sectionId, idx) => {

    const { navigation, actionGetUsers, userData } = this.props

    const personKey = navigation.state && navigation.state.params && navigation.state.params.personKey

    if (item.isUser == true){
      this.setState({
        isLoadingUser: true,
        csMobilePhone: item.csPhoneNumber
      }, () => {
        actionGetUsers({
          mobilePhone: item.csPhoneNumber
        }, getAuthHeader(userData.token))
      })
    }
    else if (item.avatar){
      navigation.navigate('AddCustomContact', {contactInfo: item, personKey: personKey, hasBase64: false})
    }
    else {
      navigation.navigate('AddCustomContact', {contactInfo: item, personKey: personKey, hasBase64: true})

    }

  }

  addCustomContact = () => {
    const { navigation } = this.props
    const personKey = navigation.state.params && navigation.state.params.personKey
    // navigation.navigate('AddCustomContact', {personKey: personKey})
    navigation.navigate('AddCustomContact', {personKey: personKey, newContact: true, hideText: true})
  }

  refreshStyle = () => {
    const {showError, isLoading} = this.state
    return {
      height: isLoading || showError
      ? width(22)
      : width(15),
      width: width(100),
      paddingHorizontal: width(4),
      alignItems: 'center'
    }
  }

  _onRefresh = () => {
    this.setState({
      refreshing: true
    }, () => {
      this.getContacts()
    })
  }

 showPermissionError = () => {
   this.setState({
     showPermissionError: true,
     refreshing: false,
     isLoading: false
   })
 }

 goToSettings = () => {

   Linking.openSettings()

 }

 updateMasterList = () => {

   const {contacts, contactsExist, setPermanentContacts, permanentContacts} = this.props

   let newContacts = []

   // Get exisiting contact list

   contacts.data.map((item) => {

    // Find the phone numbers for each contact

     item.phoneNumbers.map((contactList)=>{

       let isUser = false

       // Check App users from the API return


       contactsExist && contactsExist.response && contactsExist.response.map((foundUser) => {

         // If the user is found in API return or it's already been identified as a user mark true

         if (fullCleanPhone(contactList.number) == foundUser.mobilePhone || item.isUser == true){

           // Mark the contact as a user

           isUser = true

         }

       })

       // Create new list of updated contacts

       newContacts.push({
         mobilePhone: fullCleanPhone(contactList.number),
         user: isUser
       })

     })

   })



   // Update Local Storage with new Master List

   setPermanentContacts(newContacts)

 }

 getContacts = () => {

   const { setContacts, cleanPhoneNumb, countryCodes, contacts, permanentContacts } = this.props
   const countryCodesArray = countryCodes.response.sort()
   this.setState({refreshing: true, customContact: true, selectedIndex: 0, fields: {search: ''}})

   let numbersArr = []

   Contacts.getAll((err, contacts) => {

       if (!contacts) return null

       const contactsData = contacts.map(item => {

         if (!item) return null

         let mapContacts = [],
         isUser = false,
         foundDefaultPhone = '',
         foundPhoneFlag = false,
         setEmail,
         csPhoneNumber='',
         foundEmail = false

         item.phoneNumbers.map((item, index) => {

           if (item.label == 'mobile' || item.label == 'iPhone'){

             foundDefaultPhone = item.number
             foundPhoneFlag = true
           }

           if (!foundPhoneFlag){
             foundDefaultPhone = item.number
           }

           // Check if contact is a cstreet user
           if (permanentContacts && permanentContacts.response && permanentContacts.response.length > 0){

             permanentContacts.response.map((number, i) => {

               if (fullCleanPhone(item.number) == fullCleanPhone(number.mobilePhone) && number.user == true){
                 csPhoneNumber = fullCleanPhone(item.number)
                 isUser = true

               }

             })

           }

           numbersArr.push({
             mobilePhone: fullCleanPhone(item.number),
             user: isUser
           })

           mapContacts.push({
             label : item.label || 'Phone',
             number : item.number,
           })

         })

         item.emailAddresses.map((item, index) => {

           if (item.label === 'ConnectorStreet'){
             setEmail = item.email
             foundEmail = true
           }

           if (!foundEmail){
             setEmail = item.email  || ''
           }

         })

         return {
           name: (item.givenName || '') +' '+ (item.familyName || ''),
           fName: item.givenName && item.givenName || '',
           csPhoneNumber: csPhoneNumber,
           isUser: isUser,
           sName: Platform.OS == 'ios'
             ? item.familyName || ''
             : item.givenName && item.givenName.split(' ')[1] || item.familyName || '',
           phoneNumbers : mapContacts,
           phone: ' ',
           defaultPhone : foundDefaultPhone || '',
           avatar: item.thumbnailPath || '',
           recordID : item.recordID,
           email: setEmail || ''
         }

       })

       if (countryCodesArray) {

         setContacts(contactsData.map(contact => {
             return contact
           }, 'local').filter(item => item))

       }

       this.setState({
         isLoading: false,
       },
       () =>{
         this.showErrorHint()
       })

   })

 }

 renderLists = (contactsData, csContactsData) => {

   const {selectedIndex, sergeContacts} = this.state

   const listProps = {
     rowProps: {
       onItemPress: this.onListItemPress
     }
   }

   if (!csContactsData || csContactsData && csContactsData.length === 0){
     return <React.Fragment>
              <ContactList  {...listProps} data={contactsData} keyboardShouldPersistTaps='always'/>
            </React.Fragment>
   }
   else {
     let sortedData = _.orderBy(csContactsData, ['sName'],['asc'])
     let combinedData = [...contactsData, ...sortedData]
     return <React.Fragment>
              <ContactList  {...listProps} data={combinedData} keyboardShouldPersistTaps='always'/>
            </React.Fragment>
   }

 }

 getRemoteContacts = () => {
   const {actionGetRemoteList, userData,actionResetContacts } = this.props
   this.setState({
     isLoading: true,
     showRemote: false,
   }, ()=> {
     actionGetRemoteList(userData.token)
   })


 }

 checkPermissions = (callback) => {

   const {contacts} = this.props

   if (Platform.OS == 'android') {

     PermissionsAndroid.request(
         PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
         {
             'title': 'Allow Contact Permission',
             'message': 'In order to use Connector Street properly, you need to give access to your contact list.',
             'buttonPositive': "OK"
         }
     )
     .then(granted => {
         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
             if (contacts.length === 0){
               this.getContacts()
             }
         }
         else {
           this.setState({showPermissionError: true})
         }
     })
     .catch(err => {
         this.setState({showPermissionError: true})
     })
   }
   else {
     Permissions.check('contacts').then(response => {
       if (response == 'undetermined' || response == 'denied') {
         Permissions.request('contacts').then(response => {
           if (response == 'authorized') {
             this.getContacts()
           }
           else {
             this.setState({showPermissionError: true})
           }
         })
       }
       else if (response == 'authorized') {
         if (contacts.length === 0){
           this.getContacts()
         }
       }
       else {
         this.setState({showPermissionError: true})
       }
     })
   }

 }

 componentWillMount(){

  const {contacts, actionGetRemoteList, userData, actionLog} = this.props

  this.checkPermissions()

  if (contacts){
    actionLog({
      "level":"debug",
      "message":"{module : LOG_ANDROID_CONTACTS, method: UI_LOG_CONTACTS}",
      "data": JSON.stringify(contacts)
    })
  }


  this.setState({
    backgroundRefresh: true,
  }, ()=> {
    actionGetRemoteList(userData.token)
  })

  this.setState({isLoading: false})

 }

 componentWillReceiveProps(nextProps) {

  const {userData, navigation, setMakeIntroductionData, setContacts, remoteContacts, makeIntroductionData} = this.props

  const {newContact} = navigation.state && navigation.state.params && navigation.state.params

  const propsCheckerGetUsers = checkNextProps(nextProps, this.props, 'getUsers', 'noway')

  const propsCheckerGetRemoteContacts = checkNextProps(nextProps, this.props, 'remoteContacts', 'noway')

  const data = nextProps.getUsers.response

  if (propsCheckerGetUsers == 'error') {
    const error = nextProps.getUsers.error

    this.setState({isLoading: false})
    if (error.msg != "Token has expired.") {
      Alert.alert(error.msg)
    }
    else {
      Alert.alert('Your session has expired. Please login again.', null, [
        {text: 'Login', onPress: () => navigation.dispatch(goToLogin)}
      ])
    }
  }

  else if (propsCheckerGetUsers && nextProps.getUsers.response) {

    const data = nextProps.getUsers.response

    const personKey = navigation.state.params && navigation.state.params.personKey

    const {fields} = this.state

    if (personKey === 'sPerson' && makeIntroductionData.fPerson.phone == data.mobilePhone || personKey === 'fPerson' && makeIntroductionData.sPerson.phone == data.mobilePhone){
        this.setState({
          isLoading: false,
          error: errorHints.introduceSamePerson
        }, () => {
          this.showUserErrorHint()
        })
    }

    else if (data.mobilePhone == userData.userModel.user){
      this.setState({
        isLoading: false,
        error: errorHints.introduceYourSelf
      }, () => {
        this.showUserErrorHint()
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
              customPhone: data.mobilePhone,
              newContact : false,
              phoneNumbers : '',
              phone: data.mobilePhone,
              recordID : '',
              origCleadPhone: data.mobilePhone,
              origPhone: data.mobilePhone,
              userId: data.user_uid,
              user_uid: data.user_uid
            }
          })
          this.setState({
            isLoadingUser: false,
          }, () => {
            if (navigation.state.params.fromScreen === 'SelectAndEditMessage'){
              navigation.navigate('SelectAndEditMsg')
            }
            else {
              navigation.navigate('Intro', {localPrevScreen: 'SelectContact'})
            }
      })
    }

  }

  if (propsCheckerGetRemoteContacts){

      let data = nextProps.remoteContacts.response

      if (this.state.backgroundRefresh && data.length == 0){
        this.setState({
          showButtons: false,
          isLoading: false,
          backgroundRefresh: false
        })
      }

      if (this.state.backgroundRefresh && data.length > 0){
        this.setState({
          showButtons: true,
          isLoading: false,
          backgroundRefresh: false
        })
      }

      if (!this.state.backgroundRefresh && data.length > 0){
        this.setState({
          showButtons: true,
          isLoading: false,
          backgroundRefresh: false
        }, ()=> {
          setContacts(data.map(contact => {return contact}).filter(item => item), 'remote')
        })
      }

  }

 }

 render() {

    const { navigation, contacts, getContacts, refreshStyle, countryCodes, permanentContacts, actionGetRemoteList } = this.props

    const { list, fields, keyboardIsShown, keyboardIsOpened, searchFocused, isLoading, isLoadingUser, showError, showUserError, error,showPermissionError, selectedIndex, showButtons } = this.state

    const { search, customContact } = fields

    let setTitle = 'Add First Friend'

    if (navigation.state.params.personKey === 'sPerson'){

      setTitle = 'Add Second Friend'

    }

    const navBarProps = {
      leftPart: {
        image: iconImages.navBarCrossIconWhite,
        action: () => this.close()
      },
      centerPart: {
        text: setTitle
      },
      rightPart: {
        image: iconImages.refreshWhite,
        action: () => {
          this.setState({
            isLoading: true
          },
          () =>{
            selectedIndex === 1
            ? this.getRemoteContacts()
            : this.getContacts()
          })

        }
      }
    }

    const contactsData = contacts && contacts.data.filter(item => (item.fName + ' ' + item.sName).toLowerCase().indexOf(search.trim().toLowerCase()) != -1)

    const csContactsData = permanentContacts && permanentContacts.response && permanentContacts.response.filter(item => (item.fName + ' ' + item.sName).toLowerCase().indexOf(search.trim().toLowerCase()) != -1)

    return (
      <View style={styles.wrapper}>

        <NavBar {...navBarProps} navigation={navigation} />
        <KeyboardAvoidingView style={{flex: 1}}
         keyboardShouldPersistTaps='always' keyboardVerticalOffset={0} behavior={'padding'} enabled={false}>
          <View style={styles.content}>
          <View style={this.refreshStyle()}>
          {
            isLoading?
            <ActivityIndicator style={styles.loadingIndicator} animating={true}  color="#3E3E3E" size="small"/>
            :null
          }
          { showError?
            <View style={styles.refreshWrapper}><Text style={styles.refreshText}>Successfully updated contact list</Text></View>
          : null
        }
            <View style={styles.searchWrapper}>
              <SearchInput
                placeholder="Search address book..."
                placeholderTextColor="#5C5C5C"
                value={search}
                onFocus={() => this.setState({
                  searchFocused: true
                }) }
                onBlur={() => this.setState({
                  searchFocused: false
                }) }
                onChangeText={text => this.onFieldChange('search', text)}
                returnKeyType="done"
                onChangeText={text => this.onFieldChange('search', text)} />
            </View>
          </View>
          {
            showButtons && !showPermissionError
            ? <ButtonGroupNav
              onPress={this.updateIndex}
              selectedIndex={this.state.selectedIndex}
              buttons={
                [
                  'Phone Contacts',
                  'Chamber Contacts'
                ]
              }

              />
            : null
          }

            <View style={styles.listPart}>

            { showPermissionError
            ? <View style={styles.permissions}>
            <View style={styles.permissionWrapper}>
            <Text style={styles.permissionTitle}>Connector Street needs access to your contacts</Text>
            <Text style={styles.permissionText}>Please go to your settings and allow Connector Street access to your contacts. </Text>
            <TouchableOpacity onPress={()=> this.goToSettings()}style={styles.settingsButton}>
              <Text style={styles.settingsText}>Open settings</Text>
            </TouchableOpacity>
            </View>
            </View>

            :   this.renderLists(contactsData, csContactsData)

            }

            </View>
            {
              !searchFocused ?
                <View style={styles.bottomPartWrapper}>
                  <Text style={styles.hintText}>
                    Can't find contact? Tap refresh.
                  </Text>
                  <View style={styles.customContactWrapper}>
                    <RoundedBtn
                      innerStyle={{
                        height: width(10),
                        width: width(80),
                        borderRadius: width(8),
                        borderWidth: 1,
                        borderColor: '#E4E6E8'
                      }}
                      textStyle={{
                        color: '#8D8D8D',
                        marginTop: 0,
                        fontSize: width(3)
                      }}
                      onPress={this.addCustomContact}
                      backgroundColor="transparent"
                      text="Add Custom Contact" />
                  </View>
                </View>
                : null
            }
          </View>

        </KeyboardAvoidingView>
        {
          isLoadingUser
            ? <ActivityIndicator style={styles.loadingIndicatorUser} animating={true}  color="#3E3E3E" size="small"/>
            : null
        }
        <HintModal show={showUserError} type="text" hintData={error}/>
      </View>
    );
  }
 }

const styles = StyleSheet.create({
  loadingIndicatorUser: {
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
  },
  refreshWrapper: {
    height: 32
  },
  refreshText:{
    color: '#4D5150',
    paddingTop: 18,
    fontSize: 12,
  },
  loadingIndicator: {
    paddingTop: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
  },
  permissions: {
    marginTop: width(10),
    height: height(60),
    width: width(100),
    justifyContent: 'center',
    alignItems: 'center'
  },
  permissionWrapper: {
    width: width(80),
    borderColor: '#D6D6D6',
    paddingHorizontal: 15,
    paddingTop: 20,
    borderRadius: width(2.5),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  permissionTitle : {
    fontWeight: '600',
    textAlign: 'center',
    fontSize: width(4.5),
    color: '#5F5F5F',
    marginBottom: width(2),
  },
  permissionText: {
    lineHeight: 20,
    color: '#5F5F5F',
    fontSize: width(3.5),
    textAlign: 'center',
  },
  permissionTextBottom: {
    lineHeight: 20,
    color: '#5F5F5F',
    marginTop: 20,
    fontSize: width(3.5),
    textAlign: 'center',
  },
  settingsText: {
    color: '#0084FF',
    fontSize: width(4)
  },
  settingsButton:{
    marginTop: width(5),
    width: width(80),
    borderColor: '#D6D6D6',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomLeftRadius: width(2.5),
    borderBottomRightRadius: width(2.5),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchWrapper: {
    marginTop: width(6),
    marginHorizontal: width(4)
  },
  hintText: {
    marginTop: width(6),
    marginBottom: width(3),
    fontSize: width(3.8),
    color: '#9F9F9F'
  },
  customContactWrapper: {
    marginBottom: width(3),
    width: width(100),
    paddingHorizontal: width(2),
    height: width(14)
  },
  listPart: {
    flex: 1,
    marginTop: width(3),
  },
  bottomPartWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    backgroundColor: '#fff',
    width: width(100),
    paddingHorizontal: width(4),
    alignItems: 'center'
  }
})
