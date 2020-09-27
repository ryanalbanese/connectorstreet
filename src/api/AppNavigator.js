import React, { Component } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, Easing, Keyboard, Linking, Platform, PermissionsAndroid, SafeAreaView, Alert, Animated, AppState, AsyncStorage } from 'react-native'
import { connect } from 'react-redux'
import { addNavigationHelpers, StackNavigator, DrawerNavigator, TabNavigator, NavigationActions } from 'react-navigation'
import Contacts from 'react-native-contacts'
import OneSignal from 'react-native-onesignal';
import Permissions from 'react-native-permissions'
import {navigatorRef} from '../index.js';
import CustomDrawerContentComponent from '../components/CustomDrawerContentComponent'
import NavigationService from '../utils/NavigationService';
import { width, height, googleApiKey, onesignalAppId, imageInBase64 } from 'constants/config'
import { checkNextProps, fullCleanPhone, cleanPhoneNumb } from 'utils'
import moment from "moment";
import store, { addListener } from './ReduxStore'

import * as ApiUtils from 'actions/utils'
import * as ApiCountryCodes from 'actions/countryCodes'
import * as Models from 'models'

// Imports for app routes
import Login from 'layouts/Login'
import SignUpWithPhone from 'layouts/SignUpWithPhone'
import Home from 'layouts/Home'

import SelectContact from 'layouts/Invite/SelectContact'
import AddContactInfo from 'layouts/Invite/AddContactInfo'
import AddContactInfo1 from 'layouts/Invite/AddContactInfo1'

import Intro from 'layouts/MakeIntroductions/Intro'
import AddCustomContact from 'layouts/MakeIntroductions/AddCustomContact'
import SelectMessage from 'layouts/MakeIntroductions/SelectMessage'
import EditMessage from 'layouts/MakeIntroductions/EditMessage'
import MakeIntroSent from 'layouts/MakeIntroductions/Sent'
import MakeIntroAddContactInfo from 'layouts/MakeIntroductions/AddContactInfo'
import MakeIntroSelectContact from 'layouts/MakeIntroductions/SelectContact'
import SelectMessageList from 'layouts/MakeIntroductions/SelectMessageList'
import SelectAndEditMsg from 'layouts/MakeIntroductions/SelectAndEditMsg'
import LandingScreen from 'layouts/Landing/'

import SendMessage from 'layouts/Notifications/SendMessage'
import Notifications from 'layouts/Notifications/Notifications'
import NotificationDetatils from 'layouts/Notifications/NotificationDetatils'
import NotificationDetatilsIntroduction from 'layouts/Notifications/NotificationDetatilsIntroduction'
import NotifSelectMessageList from 'layouts/Notifications/NotifSelectMessageList'
import NotifSelectAndEditMsg from 'layouts/Notifications/NotifSelectAndEditMsg'
import CustomMessage from 'layouts/Notifications/CustomMessage'
import SendingMessage from 'layouts/Notifications/SendingMessage'
import NotiffSelectAndEditMsg from 'layouts/Notifications/NotiffSelectAndEditMsg'
import NotifSelectAndEditTymMsg from 'layouts/Notifications/NotifSelectAndEditTymMsg'
import NotifSent from 'layouts/Notifications/NotifSent'
import PushNotification from 'layouts/Notifications/PushNotification';

import Connection from 'layouts/Connections/Connection'
import ConnectionDetatil from 'layouts/Connections/ConnectionDetatil'
import ConnectionContactDetatil from 'layouts/Connections/ConnectionContactDetatil'
import ConnIntroductionDetatils from 'layouts/Connections/ConnIntroductionDetatils'
import ConnSelectMessage from 'layouts/Connections/ConnSelectMessage'
import ConnSelectMessageList from 'layouts/Connections/ConnSelectMessageList'
import ConnSelectAndEditMsg from 'layouts/Connections/ConnSelectAndEditMsg'
import ConnSelectAndEditTymMsg from 'layouts/Connections/ConnSelectAndEditTymMsg'
import ConnSent from 'layouts/Connections/ConnSent'

import MyIntroductions from 'layouts/MyIntroductions/MyIntroductions'
import IntroductionDetatils from 'layouts/MyIntroductions/IntroductionDetatils'

import Settings from 'layouts/Settings/Settings'

import SignUpSocialPhoneEnter from 'layouts/SignUpSocial/SignUpSocialPhoneEnter'
import SignUpConfirmCode from 'layouts/SignUpWithPhone/SignUpConfirmCode'

import ResetPassword from 'layouts/ResetPassword/ResetPassword'
import ConfirmCode from 'layouts/ResetPassword/ConfirmCode'
import NewPassword from 'layouts/ResetPassword/NewPassword'
import Confirmation from 'layouts/ResetPassword/Confirmation'

import Loading from 'layouts/Loading'

const DrawerNavigatorConfig = {
  drawerOpenRoute: 'DrawerOpen',
  drawerCloseRoute: 'DrawerClose',
  drawerToggleRoute: 'DrawerToggle',
  drawerWidth: width(80),
  drawerPosition: 'left',
  drawerBackgroundColor: 'transparent',
  initialRouteName: 'EditMessage',
  transitionSpec: {
      duration: 800,
      timing: Animated.timing,
      easing: Easing.out(Easing.poly(4)),
    },
    screenInterpolator: sceneProps => {
       const { layout, position, scene } = sceneProps;
       const { index } = scene;
       const width = layout.initWidth;
       const translateX = position.interpolate({
         inputRange: [index - 1, index, index + 1],
         outputRange: [width, 0, 0],
       });
       if (index <= 1){
           return {};
       }

       return {transform: [{ translateX }] };
     },
  contentComponent: props => <CustomDrawerContentComponent {...props} />,
}

import LoginScreen from '../navigation/LoginScreen';
import SignUpSocial from '../navigation/SignUpSocial';
import SignUpWithPhoneScreen from '../navigation/SignUpWithPhoneScreen';
import HomeScreen from '../navigation/HomeScreen';
import MenuScreen from '../navigation/MenuScreen';
import DrawerComponent from '../navigation/DrawerComponent';
import OfflineNotice from '../components/OfflineNotice';
import countryCodesStatic from '../constants/countryCodes';
import { Page1, Page2, Page3 } from '../layouts/Walkthrough';

const tabBarConfig = {
  animationEnabled: false,
  lazy: false,
  navigationOptions: {
      tabBarVisible: false,
  },
  tabBarOptions: {
  }
};

const MyIntroductionsStack = StackNavigator({
  MyIntroductions: {
    screen: MyIntroductions
  },
  IntroductionDetatils: {
    screen: IntroductionDetatils
  },
}, {
  headerMode: 'nine'
}
)

const NotificationsStack = StackNavigator({
  Notifications: {
    screen: Notifications
  },
  NotificationDetatils: {
    screen: NotificationDetatils
  },
  NotificationDetatilsIntroduction: {
    screen: NotificationDetatilsIntroduction
  },
  NotifSelectAndEditMsg: {
    screen: NotifSelectAndEditMsg
  },
  SendMessage: {
    screen: SendMessage
  },
  NotifSelectMessageList: {
    screen: NotifSelectMessageList
  },
  CustomMessage: {
    screen: CustomMessage
  },
  SendingMessage: {
    screen: SendingMessage
  },
  NotifSelectAndEditTymMsg: {
    screen: NotifSelectAndEditTymMsg
  },
  NotiffSelectAndEditMsg: {
    screen: NotiffSelectAndEditMsg
  },
  NotifSent: {
    screen: NotifSent
  }
}, {
  headerMode: "none"
})

const ConnectionsStack = StackNavigator({
  Connection: {
    screen: Connection
  },
  ConnectionDetatil: {
    screen: ConnectionDetatil
  },
  ConnIntroductionDetatils: {
    screen: ConnIntroductionDetatils
  },
  ConnectionContactDetatil: {
    screen: ConnectionContactDetatil
  },
  ConnSelectMessage: {
    screen: ConnSelectMessage
  },
  ConnSelectMessageList: {
    screen: ConnSelectMessageList
  },
  ConnSelectAndEditTymMsg: {
    screen: ConnSelectAndEditTymMsg
  },
  ConnSelectAndEditMsg: {
    screen: ConnSelectAndEditMsg
  },
  ConnSent: {
    screen: ConnSent
  },
}, {
  headerMode: 'nine'
})

const MakeIntroductionsStack = StackNavigator({
  Intro: {
    screen: Intro
  },
  MakeIntroSelectContact: {
    screen: MakeIntroSelectContact
  },
  MakeIntroAddContactInfo: {
    screen: MakeIntroAddContactInfo
  },
  AddCustomContact: {
    screen: AddCustomContact
  },
  SelectMessage: {
    screen: SelectMessage
  },
  SelectMessageList: {
    screen: SelectMessageList
  },
  EditMessage: {
    screen: EditMessage
  },
  MakeIntroSent: {
    screen: MakeIntroSent
  },
  SelectAndEditMsg: {
    screen: SelectAndEditMsg
  },
}, {
  swipeEnabled: true,
  headerMode: 'nine',
  initialRouteName: 'Intro',
})

const InviteStack = StackNavigator({
  SelectContact: {
    screen: SelectContact
  },
  AddContactInfo: {
    screen: AddContactInfo
  },
  AddContactInfo1: {
    screen: AddContactInfo1
  },
}, {
  headerMode: 'nine'
  })

const SignUpStack = StackNavigator({

  SignUpWithPhoneScreen: { screen: SignUpWithPhoneScreen },
  SignUpConfirmCode: { screen: SignUpConfirmCode }
}, {
  headerMode: 'nine'
});

const LoginStack = StackNavigator({
  LandingScreen: {screen: LandingScreen},
  LoginScreen: { screen: LoginScreen },
  SignUpStack: { screen: SignUpStack }
}, {
  headerMode: 'nine'
});

const ResetPasswordStack = StackNavigator({
  ResetPassword: {
    screen: ResetPassword
  },
  ConfirmCode: {
    screen: ConfirmCode
  },
  NewPassword: {
    screen: NewPassword
  },
  Confirmation: {
    screen: Confirmation
  },
}, {
  headerMode: 'nine'
})

const homeStackWithOptions = StackNavigator({
      HomeScreen: { screen: HomeScreen }
  }, {
    headerMode: 'none',
  })

const MainStack = DrawerNavigator({
  HomeStack: {screen: homeStackWithOptions},
  Menu: { screen: MenuScreen },
  MakeIntroductions: {
    screen: MakeIntroductionsStack
  },
  Invite: {
    screen: InviteStack
  },
  MyIntroductions: {
    screen: MyIntroductionsStack
  },
  Connections: {
    screen: ConnectionsStack
  },
  Notifications: {
    screen: NotificationsStack
  },
  Settings: {
    screen: Settings
  },

},
{
  drawerWidth: width(80),
  contentComponent: DrawerComponent,
  contentOptions: {
      activeTintColor: '#52C986',
      itemsContainerStyle: {  marginVertical: 0 }
  }
}, { lazy: true },);

const WalkthroughTab = TabNavigator({
  Page1: {
      screen: Page1
  },
  Page2: {
      screen: Page2
  },
  Page3: {
      screen: Page3
  }
},tabBarConfig);

export const AppNavigator = StackNavigator({
  Loading: {
    screen: Loading
  },
  LoginStack: {
      screen: LoginStack
  },
  ResetPasswordStack: {
    screen: ResetPasswordStack
  },
  Connection: {
    screen: Connection
  }
  ,
  Notifications: {
    screen: Notifications
  },
  Main: {
      screen: MainStack
  },
  pushNotification: {
    screen : PushNotification
  },
  Walkthrough: {
      screen: WalkthroughTab
  },
},{
  transitionConfig: () => ({
    transitionSpec: {
      duration: 0,
    }
  }),
  headerMode: "none",
  initialRouteName: 'Loading',
  lazy: false
},
);

@connect(state => ({
    routes: state.routes,
    userData: state.userData,
    permanentContacts: state.permanentContacts,
    countryCodes: state.countryCodes,
    setPushNotif: state.setPushNotif,
    setPushIdsLocal: state.setPushIdsLocal,
    setPushNotifData: state.setPushNotifData,
    setPermanentContacts: state.setPermanentContacts,
    sendContacts: state.sendContacts,
    freshContacts: state.freshContacts
  }),
  dispatch => ({
    fetchCountryCodes: (data) => {
      dispatch(ApiCountryCodes.fetchCountryCodes())
    },
    dispatch: dispatch,
    setContacts: (contacts, type) => {
      dispatch(ApiUtils.setContacts(contacts, type))
    },
    setPushNotif: (notification) => {
      dispatch(ApiUtils.setPushNotif(notification))
    },
    setPushIdsLocal: (data) => {
      dispatch(ApiUtils.setPushIdsLocal(data))
    },
    setPushNotifData: (data) => {
      dispatch(ApiUtils.setPushNotifData(data))
    },
    setPermanentContacts: (data) => {
      dispatch(ApiUtils.setPermanentContacts(data))
    },
    actionSetFreshContacts: (data) => {
      dispatch(ApiUtils.setFreshContacts(data))
    },
    actionSendContacts: (token, data) => {
      dispatch(Models.contactsExist.contactsExist(token, data))
    }
  })
)

export default class AppWithNavigationState extends Component {

  state = {
    appState: AppState.currentState
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    OneSignal.removeEventListener('ids', this.onIds);
  }

  componentWillMount() {
    const { fetchCountryCodes, setPushNotifData } = this.props


    !__DEV__ && OneSignal.init(onesignalAppId);
    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);
    OneSignal.getPermissionSubscriptionState(data => {

    })
    OneSignal.configure()
    OneSignal.inFocusDisplaying(0);

    fetchCountryCodes()
    this.checkPermissions()

  }

  _setContactParam = async (value) => {
    const {navigation} = this.props
    try {
      await AsyncStorage.setItem('ContactsDate', JSON.stringify(value))
      } catch (error) {
    }
  }

  _retrieveContactLength = async () => {

    try {

      const value = await AsyncStorage.getItem('ContactsDate')

      return value

    }

    // If there's an error getting the session storage

    catch (error) {

        // Run the contact list refresh code

    }


  }

  _retrieveContactParam = async () => {

    const {userData} = this.props

    const date = moment()

    const currDay = date.date().toString()

    try {

      const value = await AsyncStorage.getItem('ContactsDate')

      // IF user has a token, run the logic to match on the day

      if (userData && userData.token){

        // If session storage returns a value

        if (value !== null) {
            // If the value is not equal to the current day
            if (JSON.parse(value) != currDay){
              // Run the contact list refresh code

              this.getSendContacts()

            }

        }

        // If session storage has no value

        else if (value == null){

           // Run the contact list refresh code

            this.getSendContacts()

        }

      }

      // If there's no token, just get the contacts normally

      else {
        this.checkPermissions()
      }

    }

    // If there's an error getting the session storage

    catch (error) {

        // Run the contact list refresh code
        this.checkPermissions()

    }

  }

  _handleAppStateChange = (nextAppState) => {
    if (nextAppState == 'active'){
    this._retrieveContactParam()

    }
    this.setState({appState: nextAppState});
  }

  checkPermissions = (callback) => {

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
              this.getContacts()
          }
          else {

          }
      })
      .catch(err => {
          console.log('PermissionsAndroid', err)
      })
    }
    else {
      Permissions.check('contacts').then(response => {

        if (response == 'undetermined' || response == 'denied') {

          Permissions.request('contacts').then(response => {

            if (response == 'authorized') {
              this.getContacts()
            }
          })
        }
        else if (response == 'authorized') {
          this.getContacts()
        }
        else {
          this.getContacts()
        }
      })
    }

  }

  _setMasterContacts = async (data) => {
      try {
        await AsyncStorage.setItem('masterContactList', JSON.stringify(data));
      } catch (error) {
        console.log('Error setting contact storage')
      }
    }

  getContacts = () => {

    const { setContacts, countryCodes, cleanPhoneNumb, NavigationActions, setPushNotifData, setPermanentContacts, permanentContacts, actionSendContacts, userData, freshContacts, actionSetFreshContacts} = this.props

    const countryCodesArray = countryCodes.response && countryCodes.response.sort()

    let numbersArr = []

    Contacts.getAll((err, contacts) => {

        let iterator = 1

        const contactsData = contacts.map(item => {

          if (!item) return null

          let mapContacts = [],
          foundDefaultPhone = '',
          foundPhoneFlag = false,
          isUser = false,
          setEmail,
          foundEmail = false,
          csPhoneNumber = '',
          recordID = item.recordID

          item.phoneNumbers.map((item, index) => {

            if (item.label == 'mobile' || item.label == 'iPhone'){

              foundDefaultPhone = item.number
              foundPhoneFlag = true
            }

            if (!foundPhoneFlag){
              foundDefaultPhone = item.number
            }

            numbersArr.push({
              contactID : recordID,
              mobilePhone : fullCleanPhone(item.number),
              user : isUser
            })

            mapContacts.push({
              label : item.label || 'Phone',
              number : item.number,
            })

            iterator ++

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
            csPhoneNumber: csPhoneNumber,
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

    })

  }

  getSendContacts = () => {

    const { setContacts, countryCodes, cleanPhoneNumb, NavigationActions, setPushNotifData, setPermanentContacts, permanentContacts, actionSendContacts, userData, freshContacts, actionSetFreshContacts} = this.props

    const countryCodesArray = countryCodes.response && countryCodes.response.sort()

    const date = moment()

    const currDay = date.date().toString()

    let numbersArr = []

    Contacts.getAll((err, contacts) => {
        if (!contacts) return null
        let iterator = 1

        const contactsData = contacts.map(item => {

          if (!item) return null

          let mapContacts = [],
          foundDefaultPhone = '',
          foundPhoneFlag = false,
          isUser = false,
          setEmail,
          foundEmail = false,
          csPhoneNumber = '',
          recordID = item.recordID

          item.phoneNumbers.map((item, index) => {

            if (item.label == 'mobile' || item.label == 'iPhone'){

              foundDefaultPhone = item.number
              foundPhoneFlag = true
            }

            if (!foundPhoneFlag){
              foundDefaultPhone = item.number
            }

            numbersArr.push({
              contactID : recordID,
              mobilePhone : fullCleanPhone(item.number),
              user : isUser
            })

            mapContacts.push({
              label : item.label || 'Phone',
              number : item.number,
            })

            iterator ++

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
            csPhoneNumber: csPhoneNumber,
            defaultPhone : foundDefaultPhone || '',
            avatar: item.thumbnailPath || '',
            recordID : item.recordID,
            email: setEmail || ''
          }



        })

        if (countryCodesArray) {

          actionSendContacts(userData.token, numbersArr)

          setContacts(contactsData.map(contact => {
              return contact
            }).filter(item => item))
          this._setContactParam(currDay)
        }

    })

  }

  onReceived(notification, dispatch) {

    let notifTitle = notification.payload && notification.payload.additionalData && notification.payload.additionalData.p2p_notification.type

    const hasPayload = notification.payload.additionalData ? true : false

    if (hasPayload){
       let realTitle
       if (notifTitle && notifTitle === 'makeIntroduction'){
         realTitle = 'New Connection'
       }
       else {
         realTitle = 'New Message'
       }
       Alert.alert(
       ''+realTitle+'',
       ""+notification.payload.body+"",
         [
           {
             text: "View", onPress: () => {
               NavigationService.navigate('pushNotification', {additionalData: notification.payload.additionalData.p2p_notification.notifID});
           }
         },
           {text: 'Cancel',  style: 'cancel'}
         ],
         { cancelable: false }
       )
     }

     else {
       Alert.alert(
       'New Message',
       ""+notification.payload.body+"",
         [
           {text: 'OK',  style: 'cancel'}
         ],
         { cancelable: true }
       )
     }
  }

  onOpened = (openResult, dispatch) => {

    const {setPushNotifData} = this.props

    const hasPayload = openResult.notification.payload.additionalData ? true : false

    if (hasPayload){
      if (this.state.appState == 'background'){

        NavigationService.navigate('pushNotification', {additionalData: openResult.notification.payload.additionalData.p2p_notification.notifID});

      }

      setPushNotifData({pushNotif: true, additionalData: openResult.notification.payload.additionalData.p2p_notification.notifID})

    }

  }

  onIds = (device) => {
    const { setPushIdsLocal } = this.props

    setPushIdsLocal(device)
  }

  render() {

    const { dispatch, routes } = this.props

    const navigationProps = addNavigationHelpers({
      dispatch,
      state: routes,
      addListener
    })
    return (
      <View style={{flex: 1}}>
        <AppNavigator ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}/>
      </View>
    )
  }
}
