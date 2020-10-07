import React, { Component } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Keyboard,Platform, ActivityIndicator, Alert, TouchableOpacity, Linking } from 'react-native'
import { connect } from 'react-redux'

import Contacts from 'react-native-contacts'
import { checkNextProps, fullCleanPhone, cleanPhoneNumb } from 'utils'
import { width, height, iconImages, alphabet } from 'constants/config'

import NavBar from 'components/NavBar'
import SearchInput from 'components/SearchInput'
import RoundInput from 'components/RoundInput'
import ContactList from 'components/ContactList'
import RoundedBtn from 'components/RoundedBtn'
import * as ApiUtils from 'actions/utils'
function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

@connect(
  state => ({
    contacts: state.contacts,
    setContacts : state.setContacts,
    permanentContacts: state.permanentContacts,
    countryCodes : state.countryCodes,
    setContacts : state.setContacts,
    contactsExist: state.contactsExist

  }),
  dispatch => ({
    setContacts: (contacts) => {
      dispatch(ApiUtils.setContacts(contacts))
    },
    setPermanentContacts: (data) => {
      dispatch(ApiUtils.setPermanentContacts(data))
    },
    setContacts: (contacts) => {
      dispatch(ApiUtils.setContacts(contacts))
    }
  })
)
export default class SelectContact extends Component {
  constructor(props) {
    super(props);
    const fields = {
      search: '',
      isLoading: '',
      customContact: ''
    }
    this.state = {
      fields,
      showError: false,
      searchFocused: false,
      list: alphabet
    }
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  _keyboardDidShow = () => {
    this.setState({keyboardIsOpened: true})
  }

  _keyboardDidHide = () => {
    this.setState({keyboardIsOpened: false})
  }


  // list: Object.keys(alphabet).map(itemKey => ({ itemKey: itemKey, data: alphabet[itemKey] })).filter(item => item.data && item.data.length).reduce((acc, cur, i) => {
  //   acc[cur.itemKey] = cur.data;
  //   return acc;
  // }, {})


  onFieldChange = (fieldName, value) => {
    let newStateFields = this.state.fields
    newStateFields[fieldName] = value
    this.setState({fields: newStateFields})
  }

  close = () => {
    const { navigation } = this.props
    navigation.navigate('HomeStack')
  }

  onListItemPress = (item, sectionId, idx) => {
    const { navigation } = this.props
    navigation.navigate('AddContactInfo', {contactInfo: item, previousScreen: 'selectContact'})
  }

  addCustomContact = () => {
    const { navigation } = this.props
    navigation.navigate('AddContactInfo', {previousScreen: 'customContact'})
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
            sName: item.familyName || '',
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

  showErrorHint = () => {
    this.setState({
      showError: true
    }, () => {
      setTimeout(() => {
        this.setState({showError: false})
      }, 2000)
    })
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

  showPermissionError = () => {
    this.setState({
      showPermissionError: true,
      refreshing: false,
      isLoading: false
    })
  }

  goToSettings = () => {

    Linking.openURL('app-settings:')

  }

  componentWillMount(){
    const {contacts} = this.props
    if (contacts && contacts.data && contacts.data.length < 1){
      this.getContacts()
    }
    else {
      this.setState({
        isLoading: false
      })
    }

  }

  render() {

    const { navigation, contacts, getContacts, refreshStyle} = this.props
    const { list, fields, keyboardIsOpened, searchFocused, isLoading, showError, error, showPermissionError } = this.state
    const { search, customContact } = fields

    const navBarProps = {
      leftPart: {
        image: iconImages.navBarCrossIconWhite,
        action: () => this.close()
      },
      centerPart: {
        text: 'Select Contact'
      },
      rightPart: {
        image: iconImages.refreshWhite,
        action: () => {
          this.setState({
            isLoading: true
          },
          () =>{
            this.getContacts()
          })
        }
      }
    }
    const listProps = {
      rowProps: {
        onItemPress: this.onListItemPress
      }
    }
    /*const contactsData = contacts && contacts.data.reduce((acc, item) => {
      const getSection = (isLetter(item.sName.charAt(0)) ? item.sName.charAt(0).toUpperCase() : "#")
      const foundIndex = acc.findIndex(element => item.sName.toLowerCase().charAt(0) === getSection)
      console.log(foundIndex)
      if (foundIndex === -1) {
        return [
          ...acc,
          {
            title: item.date,
            data: [item.imageUrl],
          },
        ];
      }
      acc[foundIndex].data = [...acc[foundIndex].data, item.imageUrl];
      return acc;
    }, []);*/

    const contactsData = contacts && contacts.data.filter(item => (item.fName + ' ' + item.sName).toLowerCase().indexOf(search.trim().toLowerCase()) != -1)



    /*
    const contactsData = contacts && contacts.data

    .filter(item => (item.fName + ' ' + item.sName).toLowerCase().indexOf(search.trim().toLowerCase()) != -1)
    .reduce((acc, cur, i) => {
      const getSection = (isLetter(cur.sName.charAt(0)) ? cur.sName.charAt(0).toUpperCase() : "#")
      if (acc[getSection]) {
        acc[getSection].push(cur)
      } else {
        acc[getSection] = [cur]
      }
      return acc;
    }, {}) || {}*/
    return (
      <View style={styles.wrapper}>
        <NavBar {...navBarProps} navigation={navigation} />
        <KeyboardAvoidingView style={{flex: 1}}
         keyboardShouldPersistTaps={"handled"} keyboardVerticalOffset={24} behavior={'padding'} enabled={false}>
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
            <View style={styles.listPart}>
            { showPermissionError
            ? <View style={styles.permissions}>
            <View style={styles.permissionWrapper}>
            <Text style={styles.permissionTitle}>Connector Street needs access to your Contacts</Text>
            <Text style={styles.permissionText}>Please go to your settings and allow Connector Street access to your Contacts. </Text>
            <TouchableOpacity onPress={()=> this.goToSettings()}style={styles.settingsButton}>
              <Text style={styles.settingsText}>Go to Settings</Text>
            </TouchableOpacity>
            </View>
            </View>

            : null }
              <ContactList {...listProps} data={contactsData} keyboardShouldPersistTaps={"handled"}/>
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

      </View>
    );
  }
}

const styles = StyleSheet.create({
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
    marginTop: width(6),
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
