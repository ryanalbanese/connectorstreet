import React, { Component} from 'react';
import { View, StyleSheet, Text, Alert, SafeAreaView, TouchableWithoutFeedback, ScrollView, Platform, AsyncStorage} from 'react-native';
import { Icon, Button } from 'react-native-elements';
import Permissions from 'react-native-permissions'
import moment from 'moment'
import OneSignal from 'react-native-onesignal';
import Contacts from 'react-native-contacts'

import { width, height, iconImages, overlay, isIphoneX, isIphoneMax, serverUrls } from 'constants/config'
import { connectWithNavigationIsFocused, checkNextProps, fullCleanPhone } from 'utils'
import * as Models from 'models'
import * as ApiUtils from 'actions/utils'
import Buttons from './Buttons';
import Background from './Background';
import Avatar from './Avatar';
import NavBar from 'components/NavBar'

@connectWithNavigationIsFocused(
  state => ({
		userData: state.userData,
    contacts: state.contacts,
    freshContacts: state.freshContacts,
    permanentContacts: state.permanentContacts,
		getNotifications: state.getNotifications,
		updateSettings: state.updateSettings,
    makeIntroduction: state.makeIntroduction,
		getSettings: state.getSettings,
		watchedNotifications: state.watchedNotifications,
		pushIdsLocal: state.pushIdsLocal,
    introductionById: state.introductionById,
		setUserPushIds: state.setUserPushIds,
		getUserPushIds: state.getUserPushIds,
		updateUserPushIds: state.updateUserPushIds,
    setPushNotifData: state.setPushNotifData,
    contactsExist: state.contactsExist,
    setPermanentContacts: state.setPermanentContacts
  }),
	dispatch => ({
		actionGetSettings(userId) {
      dispatch(SettingsModel.getSettings(userId))
    },
    actionUpdateSettings(userId, data) {
      dispatch(SettingsModel.updateSettings(userId, data))
		},
    actionGetIntroductionById: (id) => {
      dispatch(Models.introduction.getIntroductionById(id))
    },
		setUserData: (data) => {
			dispatch(ApiUtils.setUserData(data))
		},
		actionGetSettings(userId) {
      dispatch(SettingsModel.getSettings(userId))
		},
		actionSetUserPushIds: (userId, data) => {
      dispatch(Models.pushIds.setUserPushIds(userId, data))
    },
		actionGetUserPushIds: (userId) => {
      dispatch(Models.pushIds.getUserPushIds(userId))
    },
		actionUpdateUserPushIds: (userId, data) => {
      dispatch(Models.pushIds.updateUserPushIds(userId, data))
    },
    actionMakeIntroduction: (id, data) => {
      dispatch(Models.introduction.makeIntroduction(id, data))
    },
    actionGetNotifications: (userId) => {
      dispatch(Models.notification.getNotifications(userId))
    },
    setPermanentContacts: (contacts) => {
      dispatch(ApiUtils.setPermanentContacts(contacts))
    },
    actionSetPermanentContacts: (data) => {
      dispatch(ApiUtils.setPermanentContacts(data))
    }
  })
)

export default class Home extends Component {

  constructor(props) {
  		super(props);
  		const { userData } = this.props

  		this.state = {
  			pushNotif: false,
  			avatar: userData && userData.userModel && userData.userModel.avatar,
  			firstName: userData && userData.userModel && userData.userModel.firstName,
        csContacts: []
  		}
  	}

  goToNotifications = () => {
  		const { navigation } = this.props
  		navigation.navigate('Notifications')
  	}

  goToSettings = () => {
  		const { navigation } = this.props
  		navigation.navigate('Settings', {modalSelectPhotoShow: true})
  }

  getContactById = (recordID, mobilePhone) => {

        const {contactsExist, actionSetPermanentContacts, userData} = this.props

        const getContactByIdCallback = (err, nativeContact) => {
          this.setState({
            csContacts: [...this.state.csContacts, nativeContact]
          }, ()=> {

            nativeContact.csPhoneNumber = mobilePhone

            if (contactsExist.response.length === this.state.csContacts.length){

              const contactsData = this.state.csContacts.map(item => {

                if (!item) return null

                let mapContacts = [],
                foundDefaultPhone = '',
                foundPhoneFlag = false,
                isUser = false,
                setEmail,
                foundEmail = false,
                recordID = item.recordID

                item.phoneNumbers.map((item, index) => {

                  if (item.label == 'mobile' || item.label == 'iPhone'){

                    foundDefaultPhone = item.number
                    foundPhoneFlag = true
                  }

                  if (!foundPhoneFlag){
                    foundDefaultPhone = item.number
                  }

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
                  name: 'Connector Street Friends',
                  fName: item.givenName && item.givenName || '',
                  isUser: true,
                  sName: Platform.OS == 'ios'
                    ? item.familyName || ''
                    : item.givenName && item.givenName.split(' ')[1] || item.familyName || '',
                  phoneNumbers : mapContacts,
                  phone: ' ',
                  csPhoneNumber: item.csPhoneNumber,
                  defaultPhone : foundDefaultPhone || '',
                  avatar: item.thumbnailPath || '',
                  recordID : item.recordID,
                  email: setEmail || ''
                }

              })
              actionSetPermanentContacts(contactsData)
            }


          })

        }

        Contacts.getContactById(recordID, getContactByIdCallback);

  }

  _updateMasterList = () => {

      const {contacts, contactsExist, setPermanentContacts, permanentContacts} = this.props

      // Update Local Storage with new Master List

      contactsExist.response && contactsExist.response.map((item, index) => {

        let contactId = item.contactID

        this.getContactById(contactId, item.newPhone)

      })


      //setPermanentContacts(newContacts)

    }

  componentWillMount(){

    const {actionGetNotifications, userData, navigation, setPushNotifData, actionGetIntroductionById, permanentContacts} = this.props
    if (userData && userData.userModel && userData.userModel.user_uid){
      actionGetNotifications(userData.userModel.user_uid)
    }

  }

  async componentDidMount () {

  	const { actionUpdateSettings, setUserData, actionGetUserPushIds, userData, pushIdsLocal, actionMakeIntroduction, permanentContacts, contactsExist, contacts } = this.props

    if (contactsExist.found){
        this._updateMasterList()
    }

    Permissions.check('photo').then(response => {

      if (response != 'authorized') {

        Permissions.request('photo').then(response => {

  				if (response != 'authorized') {

            Permissions.check('notification').then(response => {

              if (response != 'authorized') {

                OneSignal.registerForPushNotifications();

                Permissions.request('notification').then(response => {
                  if (response != 'authorized') {

                    this.setState({ pushNotif: true }, () => {
                      actionUpdateSettings({
                        pushNotif:  true
                      })
                      actionGetUserPushIds(userData.userModel.user_uid)
                    })
                  }
                  else {

                    this.setState({ pushNotif: false }, () => {
                      actionUpdateSettings({
                        pushNotif:  false
                      })
                    })
                  }
                })
              }
              else {
                actionGetUserPushIds(userData.userModel.user_uid)
              }
            })
  				} else {
            Permissions.check('notification').then(response => {
              if (response != 'authorized') {
                Permissions.request('notification').then(response => {
                  if (response != 'authorized') {
                    this.setState({ pushNotif: true }, () => {
                      actionUpdateSettings({
                        pushNotif:  true
                      })
                      actionGetUserPushIds(userData.userModel.user_uid)
                    })
                    Permissions.check('camera').then(response => {
                      if (response != 'authorized') {
                        Permissions.request('camera').then(response => {
                          if (response != 'authorized') {

                          } else {

                          }
                        })
                      }
                    })
                  } else {
                    this.setState({ pushNotif: false }, () => {
                      actionUpdateSettings({
                        pushNotif:  false
                      })
                    })
                    Permissions.check('camera').then(response => {
                      if (response != 'authorized') {
                        Permissions.request('camera').then(response => {
                          if (response != 'authorized') {

                          } else {

                          }
                        })
                      }
                    })
                  }
                })
              }
              else {
                actionGetUserPushIds(userData.userModel.user_uid)
              }
            })
  				}
        })
      }
    })

    actionGetUserPushIds(userData.userModel.user_uid)


  }

  componentWillReceiveProps(nextProps) {

  		const { navigation, actionGetSettings, setUserData, actionUpdateUserPushIds, actionSetUserPushIds, pushIdsLocal, permanentContacts } = this.props

      const propsCheckerGetNotifications = checkNextProps(nextProps, this.props, 'getNotifications')


      if (propsCheckerGetNotifications && this.props.isFocused && nextProps.getNotifications.response){

        const data = nextProps.getNotifications.response

       }

    	const propsCheckerUpdateSettings = checkNextProps(nextProps, this.props, 'updateSettings')
      if (propsCheckerUpdateSettings  == 'error' && this.props.isFocused) {
  			const error = nextProps.updateSettings.error
  			this.setState({
  				isLoading: false,
        }, () => {
          /*Alert.alert(error.msg, null, [
            {text: 'OK', onPress: () => navigation.goBack()}
          ], {
            onDismiss: () => navigation.goBack()
          })*/
        });
      }
      else if (propsCheckerUpdateSettings && this.props.isFocused && propsCheckerUpdateSettings != 'empty') {
  			const data = nextProps.getSettings.response
        actionGetSettings(nextProps.userData.userModel.user_uid)
      }
      else if (propsCheckerUpdateSettings == 'empty' && this.props.isFocused) {
        actionGetSettings(nextProps.userData.userModel.user_uid)
  		}
  		const propsCheckerGetSettings = checkNextProps(nextProps, this.props, 'getSettings')
      if (propsCheckerGetSettings== 'error' && this.props.isFocused) {
  			const error = nextProps.getSettings.error
  			this.setState({
  				isLoading: false,
        }, () => {
          /*Alert.alert(error.msg, null, [
            {text: 'OK', onPress: () => navigation.goBack()}
          ], {
            onDismiss: () => navigation.goBack()
          })*/
        });
      }
      else if (propsCheckerGetSettings && this.props.isFocused && propsCheckerGetSettings != 'empty') {
        const data = nextProps.getSettings.response

        setUserData({settings: data})
      }
      else if (propsCheckerGetSettings == 'empty') {

  		}
  		const propsCheckerUserData = checkNextProps(nextProps, this.props, 'userData', 'anyway', true)
  		if (propsCheckerUserData && this.props.isFocused && propsCheckerUserData != 'empty') {
  			this.setState({
  				avatar: nextProps.userData && nextProps.userData.userModel && nextProps.userData.userModel.avatar,
  				firstName: nextProps.userData && nextProps.userData.userModel && nextProps.userData.userModel.firstName
  			})
  		}
  		const propsCheckerGetUserPushIds = checkNextProps(nextProps, this.props, 'getUserPushIds')
      if (propsCheckerGetUserPushIds  == 'error' && this.props.isFocused) {
  			const error = nextProps.getUserPushIds.error

  			this.setState({
  				isLoading: false,
        }, () => {
          /*Alert.alert(error.msg, null, [
            {text: 'OK', onPress: () => navigation.goBack()}
          ], {
            onDismiss: () => navigation.goBack()
          })*/
        });
      }
      else if (propsCheckerGetUserPushIds && this.props.isFocused && propsCheckerGetUserPushIds != 'empty') {
  			const data = nextProps.getUserPushIds.response
  			// Alert.alert('got data ' + JSON.stringify(data))
  			// Alert.alert(JSON.stringify(pushIdsLocal) + ' userId' + nextProps.userData.userModel.user_uid)
  			if (data) {
  				actionUpdateUserPushIds(nextProps.userData && nextProps.userData.userModel && nextProps.userData.userModel.user_uid, pushIdsLocal)
  			} else {
  				actionSetUserPushIds(nextProps.userData && nextProps.userData.userModel && nextProps.userData.userModel.user_uid, pushIdsLocal)
  			}
      }
      else if (propsCheckerGetUserPushIds == 'empty' && this.props.isFocused ) {
  			actionSetUserPushIds(nextProps.userData && nextProps.userData.userModel && nextProps.userData.userModel.user_uid, pushIdsLocal)
  		}
  	}

  getTextFormTime = () => {
  		const currHour = Number(moment().format('HH'))
  		if (currHour >= 12 && currHour < 18) {
  			return 'Good Afternoon, '
  		} else if (currHour >= 18 && currHour <= 24) {
  			return 'Good Evening, '
  		} else {
  			return 'Good Morning, '
  		}
  	}

  render () {
  		const { navigation, userData, getNotifications, watchedNotifications, contactsExist } = this.props
  		const { avatar, firstName } = this.state

  		const navBarProps = {
        leftPart: {
          image: iconImages.navBarMenuIcon,
          action: () => navigation.navigate('DrawerOpen')
        },
        centerPart: {
  				image: iconImages.navBarLogoImage,
          touchable: false,
  				imageWrapperCustomStyle: {
  					width: width(70),
  					height: width(20),
  					alignItems: 'center',
  					justifyContent: 'center',
  				},
  				imageCustomStyles: {
  					height: '70%',
  					width: '70%',
  					marginTop: width(5)
  				}
        },
  		}

      let notificationsAmount = []

      if (userData.userModel && userData.userModel.user_uid){

      getNotifications.response && getNotifications.response.map((item, index) => {

        const key = 'opened_'+userData.userModel.user_uid+''

        item.data.map((opened, index) => {

          if (!opened.fullDetails[key]){
            notificationsAmount.push(opened.fullDetails)
          }

        })

      })

    }

      const newNotificationsAmount = notificationsAmount.length

  		const textFromTime = this.getTextFormTime()

  		return (
  			<View style={styles.wrapper}>

  				<Background />
  				<View style={styles.contentWrapper}>
  					<NavBar {...navBarProps} transparent statusBarBackgroundColor={'#399DC8'} navigation={navigation} />
            <ScrollView contentContainerStyle={{flexGrow : 1, justifyContent : 'center'}}>
            <View style={styles.content}>
  						<View style={styles.topPartWrapper}>
  							{
  								firstName
  									&& 	<Text style={styles.greetingText}>
  												{textFromTime + firstName}!
  											</Text>
  							}
  							{
  								avatar ?<TouchableWithoutFeedback onPress={this.goToNotifications}>
                   <Avatar source={avatar} onPress={this.goToSettings} notificationsAmount={newNotificationsAmount} />
                 </TouchableWithoutFeedback>
                  :

  									 <TouchableWithoutFeedback onPress={this.goToNotifications}>
                      <Avatar source={avatar} onPress={this.goToSettings} notificationsAmount={newNotificationsAmount} />
                    </TouchableWithoutFeedback>
  							}
  						</View>
  						<SafeAreaView >

  							<Button
  								onPress={this.goToNotifications}
  								title={
  									newNotificationsAmount
  										? 'View your notifications'
  										: 'View your notifications'
  								}
  								textStyle={styles.btnText}
  								rightIcon={
  									newNotificationsAmount
  										? null
  										: null
  									}
  								buttonStyle={styles.btn}/>
  							<Buttons
  								onMakeIntoductionPress={() => navigation.navigate('MakeIntroductions', {prevScreen: 'Home'})}
  								onMyIntoductionsPress={() => navigation.navigate('MyIntroductions')}
  								onInvitePress={() => navigation.navigate('Invite')}
  								onMyConnectionsPress={() => navigation.navigate('Connections')}
  								// onMenuButtonPress={this.onMenuButtonPress}
  								/>

  						</SafeAreaView>

  					</View>
            </ScrollView>
  				</View>
  			</View>
  		);
  	}

}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
    backgroundColor: '#43D2C3'
	},
	contentWrapper: {
		...overlay
	},
	content: {
		justifyContent: 'space-between',
		flex: 1
	},
	topPartWrapper: {
		alignItems: 'center',
		justifyContent: 'flex-start'
	},
	greetingText: {
    width: width(100),
		fontSize:
    Platform.isPad
      ? width(4)
      : width(6)
    ,
    flexWrap: "wrap",
		textAlign: 'center',
		color: '#FFFFFF',
		paddingHorizontal: width(10),
		marginTop: isIphoneX()
			?	width(20)
			: isIphoneMax()
        ? width(22)
        : Platform.isPad
          ? width(0)
          : width(8),
	},
	btnText: {
		color: 'white',
		fontSize: width(3.5),
		marginRight: width(1)
	},
	btn: {
		width: width(100),
		alignSelf: 'center',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: "rgba(255, 255, 255, .2)",
		backgroundColor: 'rgba(255, 255, 255, .1)'
	}
})
