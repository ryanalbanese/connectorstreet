import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native'
import { connect } from 'react-redux'
import { NavigationActions } from 'react-navigation';

import { width, height, iconImages, alphabet, defaultImageBase64} from 'constants/config'

import { checkNextProps } from 'utils'

import * as ApiUtils from 'actions/utils'

import NavBar from 'components/NavBar'
import RoundBtn from 'components/RoundBtn'
import RoundedBtn from 'components/RoundedBtn'
@connectWithNavigationIsFocused(
  state => ({
		phoneIndex: state.phoneIndex
  })
)
@connect(
  state => ({
    makeIntroductionData: state.makeIntroductionData,
    routes: state.routes,
    phoneIndex: state.currentIndex,
    contacts: state.contacts,
    permanentContacts: state.permanentContacts,
    contactsExist: state.contactsExist
  }),
  dispatch => ({
    setContacts: (contacts) => {
      dispatch(ApiUtils.setContacts(contacts))
    },
    setMakeIntroductionData: (data) => {
      dispatch(ApiUtils.setMakeIntroductionData(data))
    },
    resetMakeIntroductionData: () => {
      dispatch(ApiUtils.resetMakeIntroductionData())
    },
  })
)
export default class Intro extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  close = () => {

  }


  addFirstFriend = () => {
    const { navigation, makeIntroductionData, userData } = this.props

    var recordID = ''
    const firstKeyIndex =  makeIntroductionData.fPerson && makeIntroductionData.fPerson.phoneIndex


    if (navigation.state.params){
        recordID = navigation.state.params.lastRecordID
    }

    if (makeIntroductionData.fPerson && Object.keys(makeIntroductionData.fPerson).length) {
      Alert.alert(
      'Edit Contact Info',
      "Do you want to edit "+makeIntroductionData.fPerson.fName+"'s contact info or select a new contact?",
        [
          {
            text: "Edit "+makeIntroductionData.fPerson.fName+"", onPress: () => {

              navigation.navigate('AddCustomContact', {personKey: 'fPerson', recordID : recordID,
              contactInfo: makeIntroductionData.fPerson, phoneIndex: firstKeyIndex, newContact: makeIntroductionData.fPerson.newContact })
          }
        },
         {text: 'New Contact', onPress: () =>{
           navigation.navigate('MakeIntroSelectContact', {personKey: 'fPerson'})
         }},
          {text: 'Cancel',  style: 'cancel'}
        ],
        { cancelable: false }
      )

    } else {
      navigation.navigate('MakeIntroSelectContact', {personKey: 'fPerson'})
    }
  }

  addSecondFriend = () => {
    var recordID = ''
    const { navigation, makeIntroductionData } = this.props
    const secondKeyIndex = makeIntroductionData.sPerson && makeIntroductionData.sPerson.phoneIndex
    if (makeIntroductionData.sPerson && Object.keys(makeIntroductionData.sPerson).length) {
      Alert.alert(
      'Edit Contact Info',
      "Do you want to edit "+makeIntroductionData.sPerson.fName+"'s contact info or select a new contact?",
        [
          {
            text: "Edit "+makeIntroductionData.sPerson.fName+"", onPress: () => {

              navigation.navigate('AddCustomContact', {personKey: 'sPerson', recordID : recordID,
              contactInfo: makeIntroductionData.sPerson,  newContact: makeIntroductionData.sPerson.newContact})
          }
        },
         {text: 'New Contact', onPress: () =>{
           navigation.navigate('MakeIntroSelectContact', {personKey: 'sPerson'})
         }},
          {text: 'Cancel',  style: 'cancel'}
        ],
        { cancelable: false }
      )
    }
    else {
      navigation.navigate('MakeIntroSelectContact', {personKey: 'sPerson'})
    }
  }

  pressRoundedBtn = (btnType) => {
    const { navigation, setMakeIntroductionData, makeIntroductionData } = this.props
    const { fPerson, sPerson, otherData } = makeIntroductionData
    const bothPersonsValid = Object.keys(fPerson).length && Object.keys(sPerson).length
    if (bothPersonsValid) {
      setMakeIntroductionData({
        otherData: {
          relationType: btnType
        }
      })
      navigation.navigate('SelectAndEditMsg')
    }
  }

  render() {

    const { navigation, makeIntroductionData, resetMakeIntroductionData, screenProps, state } = this.props

    const localPrevScreen = navigation && navigation.state && navigation.state.params && navigation.state.params.localPrevScreen

    const prevScreen = navigation.state && navigation.state.params && navigation.state.params.prevScreen

    const { fPerson, sPerson, otherData } = makeIntroductionData

    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackArrowLongIconWhite,
        action: () => {
          let action;
          if (!localPrevScreen && prevScreen) {
            if (prevScreen == 'Home') {
              resetMakeIntroductionData()
               action = NavigationActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({ routeName: 'Main'})
                ],
               key:null
              })
            }
            if (prevScreen == 'Connection') {
              resetMakeIntroductionData()
               action = NavigationActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({ routeName: 'Connection'})
                ],
               key:null
              })
            }

            else {
              resetMakeIntroductionData()
              action = NavigationActions.reset({
                index: 0,
                actions: [
                  NavigationActions.navigate({routeName: prevScreen})
                ],
               key:null
              })
            }
          } else {
            if (!localPrevScreen) {
              resetMakeIntroductionData()
            }
            action = NavigationActions.back()
          }
          action && navigation.dispatch(action)
        }
      },
      centerPart: {
        text: 'Make an Introduction'
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

    const bothPersonsValid = Object.keys(fPerson).length && Object.keys(sPerson).length

    let iconStyle1
    let iconStyle2
    let hasApp1
    let hasApp2

    if (fPerson && fPerson.csUser){
      iconStyle1 = {
        borderWidth: 5, borderColor:'#0BDFC5'
      }
      hasApp1 = 'CStreet User'
    }

    else {
      iconStyle1 = {
        borderWidth: 1, borderColor:'#E4E4E4',
      }

    }

    if (sPerson && sPerson.csUser){
      iconStyle2 = {
        borderWidth: 5, borderColor:'#0BDFC5'
      }
      hasApp2 = 'CStreet User'
    }

    else {
      iconStyle2 = {
        borderWidth: 1, borderColor:'#E4E4E4'
      }
    }

    return (
      <View style={styles.wrapper}>
        <NavBar {...navBarProps} navigation={navigation} />
        <ScrollView showsVerticalScrollIndicator={true}>
          <View style={[styles.content, bothPersonsValid && {height: height(140)}]}>
            <View style={styles.topTextsWrapper}>
              <Text style={styles.titleText}>
                Add contact information
              </Text>
              <Text style={styles.infoText}>
                Which two friends will be struck by serendipity today?
              </Text>
            </View>
            <View style={styles.roundBtnsWrapper}>
              <RoundBtn
                onPress={this.addFirstFriend}
                widthShadow
                subText ={ hasApp1 }
                icon={iconImages.addContactIconBlue}
                wrapperStyle={{padding: width(1)}}
                innerStyle={iconStyle1}
                avatar={fPerson.avatarUrl || fPerson.avatar || (Object.keys(fPerson).length && defaultImageBase64)}
                text={
                  (fPerson.fName && fPerson.fName + (fPerson.sName && ' ' + fPerson.sName) || '') || "Add First Friend"
                } />
              <RoundBtn
                widthShadow
                subText ={ hasApp2 }
                backgroundColor="#F2F4F6"
                onPress={this.addSecondFriend}
                avatar={sPerson.avatarUrl || sPerson.avatar || (Object.keys(sPerson).length && defaultImageBase64)}
                innerStyle={iconStyle2}
                icon={iconImages.addContactIconGrey}
                text={
                  (sPerson.fName && sPerson.fName + (sPerson.sName && ' ' + sPerson.sName) || '') || "Add Second Friend"
                } />
            </View>
            {
              bothPersonsValid ?
              <View style={styles.middleTextsWrapper}>
                <View style={styles.roundedBtnsWrapper}>
                  <RoundedBtn
                    gradient={{colors: ['#42E399', '#3CB5B7'], locations:[0,0.5,0.6],start:{x: 0.0, y: 0.25},end:{x: 0.5, y: 1.0}}}
                    disabled={!bothPersonsValid}
                    elevation
                    onPress={() => this.pressRoundedBtn('Business')}
                    icon={iconImages.buildingIconWhite}
                    backgroundColor="#3BB3B7"
                    text="Business" />
                  <RoundedBtn
                    gradient={{ colors: ['#F6519F', '#FE737A'], locations: [0, 0.5, 0.6], start: { x: 0.0, y: 0.25 }, end: { x: 0.5, y: 1.0 } }}
                    disabled={!bothPersonsValid}
                    elevation
                    onPress={() => this.pressRoundedBtn('Romance')}
                    icon={iconImages.heartOutlineIconWhite}
                    backgroundColor="#F54FA0"

                    text="Romance" />
                  <RoundedBtn
                    gradient={{ colors: ['#5F79E9', '#1CE2DB'], locations: [0, 0.5, 0.6], start: { x: 0.0, y: 0.25 }, end: { x: 0.5, y: 1.0 } }}
                    disabled={!bothPersonsValid}
                    elevation
                    onPress={() => this.pressRoundedBtn('Social')}
                    icon={iconImages.martiniGlassIconWhite}
                    backgroundColor="#3BB3B7"
                    text="Social" />

                </View>
                <View >
                  <View style={styles.textsWrapper}>

                    <Text style={styles.infoTextSmall}>
                      What type of introduction?
                    </Text>
                  </View>
                </View>
              </View>

              : null
            }
          </View>

        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FBFDFF'
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  contentContainerStyle: {
    flex: 1,
  },
  topTextsWrapper: {
    marginTop: width(10),
    width: width(80),
    flexShrink: 1
  },
  titleText: {
    fontSize: width(5.4),
    color: '#646464',
    fontWeight: 'bold'
  },
  infoText: {
    marginTop: width(2),
    fontSize: width(4.4),
    color: '#ADADAD',
    lineHeight: width(7)
  },
  infoTextSmall: {
    marginTop: width(2),
    fontSize: width(3.4),
    textAlign: 'center',
    color: '#ADADAD',
    lineHeight: width(7)
  },

  roundBtnsWrapper: {
    ...Platform.select({
      android: {
        marginTop: width(10),
      },
      ios: {
        marginTop: width(15),
      }
    }),

    width: width(78),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  middleTextsWrapper: {
    marginTop: width(14),
    width: width(78),
    flexShrink: 1
  },
  roundedBtnsWrapper: {
    ...Platform.select({
      android: {
        marginTop: width(1),
      },
      ios: {
        marginTop: width(5),
      }
    }),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'

  }
})
