import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native'
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux'

import { width, height, iconImages, getBackgroundColorByType, getColorByType, isIphoneX } from 'constants/config'

import * as ApiUtils from 'actions/utils'

import NavBar from 'components/NavBar'
import ThreeImages from 'components/ThreeImages'
import RoundedBtn from 'components/RoundedBtn'

@connect(
  state => ({
    makeIntroductionData: state.makeIntroductionData,
    userData: state.userData
  }),
  dispatch => ({
    resetMakeIntroductionData: () => {
      dispatch(ApiUtils.resetMakeIntroductionData())
    },
  })
)

export default class Sent extends Component {
  close = () => {
    const { resetMakeIntroductionData, screenProps, navigation } = this.props
    const screenPropsNavigation = screenProps && screenProps.navigation

      const navigateAction = NavigationActions.navigate({
        routeName: 'Main',
        action: NavigationActions.navigate({ routeName: 'Main'})
      })
      resetMakeIntroductionData()
      navigation.dispatch(navigateAction)

  }

  sendAnotherIntro = () => {

    const { resetMakeIntroductionData, screenProps, navigation } = this.props

    const screenPropsNavigation = screenProps && screenProps.navigation

      resetMakeIntroductionData()

      this.props.navigation.popToTop()

  }

  back = () => {
    const { navigation } = this.props
    const navigateAction = NavigationActions.navigate({
      routeName: 'Main',
      action: NavigationActions.navigate({ routeName: 'SelectAndEditMsg'})
    })
    navigation.dispatch(navigateAction)

  }

  render() {
    const { navigation, makeIntroductionData, userData } = this.props
    const { fPerson, sPerson, otherData } = makeIntroductionData
    const navBarProps = {
      leftPart: {
        image: iconImages.homeWhite,
        action: () => this.close()
      },
      centerPart: {
        text: 'Success!'
      },

    }
    const userAvatar = userData && userData.userModel && userData.userModel.avatar

    return (
      <View style={styles.wrapper}>

        <View style={styles.overlay}>
          <Image source={getBackgroundColorByType(otherData.relationType)} style={styles.overlayImage} />
        </View>
        <View style={styles.overlay}>
          <NavBar {...navBarProps} statusBarBackgroundColor={getColorByType(otherData.relationType)} transparent navigation={navigation} />
          <View style={styles.content}>

            <View style={styles.infoWrapper}>
              <Text style={styles.info}>
                Your message to {makeIntroductionData.fPerson.fName} and {makeIntroductionData.sPerson.fName} has been sent.
              </Text>
            </View>



            <View style={styles.btnsWrapper}>
              <View style={styles.btnWrapper}>
                <RoundedBtn
                  innerStyle={{
                    height: '100%',
                    width: '100%',
                    borderRadius: width(2),
                    borderWidth: 1,
                    borderColor: 'white',
                  }}
                  textStyle={{
                    color: 'white',
                    marginTop: 0,
                    fontSize: width(3.3)
                  }}
                  flexy
                  onPress={this.sendAnotherIntro}
                  backgroundColor="transparent"
                  text="MAKE ANOTHER INTRODUCTION" />
              </View>

            </View>
          </View>
        </View>

      </View>
    );
  }
}

// <Text style={styles.title}>
// Your invite has been sent!
// </Text>

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white'
  },
  treeImagesWrapper: {
    // marginTop: width(22),
    marginLeft: width(-48)
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: height(100),
    width: width(100),
  },
  overlayImage: {
    height: '105%',
    width: '100%',
    opacity: 1
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    color: 'white',
    fontSize: width(10),
    fontWeight: '500',
    textAlign: 'center'
  },
  successIconImageWrapper: {
    height: width(10),
    width: width(10),
    marginTop: isIphoneX()
      ? width(7)
      : width(7)
    // marginTop: width(10)
  },
  successIconImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain'
  },
  infoWrapper: {
    marginTop: width(3),
    width: '90%'
  },
  messageText: {
    fontSize: width(3.5)
  },
  messagesWrapper: {
    marginTop: width(2),
    width: '80%'
  },
  messageWrapper:{
    marginTop: width(2.5),
    backgroundColor: 'white',
    width: '100%',
    padding: width(4),
    borderRadius: width(2),
  },
  messageTitle:{
    color: 'white',
    fontWeight: 'bold',
    fontSize: width(2.5)
  },
  info: {
    color: 'white',
    marginTop: width(3),
    fontSize: width(5),
    fontWeight: 'bold',
    textAlign: 'center'
  },
  btnsWrapper: {
    marginTop: width(6),
    width: width(90)
  },
  btnWrapper: {
    width: '100%',
    height: width(16),
    marginVertical: width(2)
  }
})
