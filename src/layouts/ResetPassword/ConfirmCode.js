import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Keyboard, Alert, ActivityIndicator, Platform } from 'react-native'
import { connect } from 'react-redux'

import { width, height, iconImages, getBackgroundImageByType, getColorByType, getButtonBackgroundImageByType, isIphoneX, serverUrls } from 'constants/config'
import { connectWithNavigationIsFocused, checkNextProps, fullCleanPhone } from 'utils'

import * as ApiUtils from 'actions/utils'

import NavBar from 'components/NavBar'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import ThreeImages from 'components/ThreeImages'
import BigTextInput from 'components/BigTextInput'
import RoundedBtn from 'components/RoundedBtn'
import StdBtn from 'components/StdBtn'

@connectWithNavigationIsFocused(
  state => ({
		resetPswdRequest: state.resetPswdRequest
  }),
  dispatch => ({
    actionResetPswdRequest: (login) => {
      dispatch(fetchServ({ ...serverUrls.resetPswdRequest, url: serverUrls.resetPswdRequest.url + '/' + login }, null, null, 'RESETPSWDREQUEST'))
    },
  })
)
export default class ConfirmCode extends Component {
  constructor(props) {
    super(props);
    const fields = {
      code0: '',
      code1: '',
      code2: '',
      code3: '',
      code4: '',
      code5: '',
    }
    this.state = {
      fields
    }
  }

  componentWillReceiveProps(nextProps) {
    const { navigation, unsetUserData } = this.props
    const propsCheckerResetRequest = checkNextProps(nextProps, this.props, 'resetPswdRequest')
    if (propsCheckerResetRequest == 'error') {
			const error = nextProps.resetPswdRequest.error
			this.setState({
				isLoading: false,
      }, () => {
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      });
    } else if (propsCheckerResetRequest) {
      this.setState({ isLoading: false }, () => {
        Alert.alert('Code has been resent', null, [
          {text: 'OK'}
        ])
      })
    }
  }

  onFieldChange = (fieldName, value) => {
    const { navigation } = this.props
    let newStateFields = this.state.fields
    newStateFields[fieldName] = value
    this.setState({fields: newStateFields}, () => {
      if (value.length >= 6) {
            Keyboard.dismiss()
            this.goToNewPassword()
      }
    })
  }

  goToNewPassword = () => {
    const { fields } = this.state
    const { navigation } = this.props
    const navParams = navigation.state.params
    navigation.navigate('NewPassword', {...navParams, code: fields.code})
  }

  onAddAvatarPress = () => {

  }

  resend = () => {
    const { actionResetPswdRequest, navigation } = this.props
    const navParams = navigation.state.params
    this.setState({
      isLoading: true,
    }, () => {
      actionResetPswdRequest(navParams.phone && fullCleanPhone(navParams.phone)||navParams.email)
    })
  }

  render() {
    const { navigation } = this.props
    const { fields, isLoading } = this.state
    const navParams = navigation.state.params
    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        action: () => navigation.goBack()
      },
      centerPart: {
        text: 'Reset Password'
      },
    }
    return (
      <View style={styles.wrapper}>
        <NavBar {...navBarProps} navBarBackgroundImage={iconImages.navBarBackgroundImageGreen} navigation={navigation} />
        <KeyboardAvoidingView style={styles.content} keyboardVerticalOffset={width(4)} behavior='padding'>
          <View style={styles.topPartWrapper}>
            <View style={styles.textsWrapper}>
              <Text style={styles.title}>
                Enter confirmation code
              </Text>
              <Text style={styles.text}>
                Enter the 7 digit code we sent to {navParams.phone}
              </Text>
            </View>
            <View style={styles.inputsWrapper}>

                      <View style={styles.inputWrapper}>
                        <StdInput
                          {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}
                          refName={comp => this['code'] = comp}
                          value={fields.code}
                          keyboardType='numeric'
                          placeholderTextColor="#7F7F7F"
                          inputStyle={{
                            fontSize: width(5),
                            textAlign: 'center',
                            borderBottomWidth: width(.4),
                            paddingBottom: width(0),
                            borderBottomColor: '#cccccc',
                            height: width(15)
                          }}
                          onChangeText={text => this.onFieldChange('code', text)} />
                      </View>

            </View>
          </View>
          <View style={styles.bottomPartWrapper}>
          <Text style={styles.codeText}>Didn't receive a confirmation code?</Text>
            <View style={styles.roundBtnWrapper}>
              <RoundedBtn
                innerStyle={{
                  height: width(9),
                  width: width(60),
                  borderRadius: width(8),
                  borderWidth: 0,
                }}
                textStyle={{
                  color: 'white',
                  fontSize: width(3),
                  marginTop: 0
                }}
                onPress={this.resend}
                backgroundColor="#8D8D8D"
                text="Resend Code" />
            </View>
          </View>
        </KeyboardAvoidingView>
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
    backgroundColor: 'white',
    height: height(100)
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    maxHeight: isIphoneX()
      ? height(85)
      : 'auto'
  },
  topPartWrapper: {
    width: width(80),
    flex: 1
  },
  textsWrapper: {
    width: '100%',
    alignItems: 'center'
  },
  title: {
    fontSize: width(4.5),
    fontWeight: '400',
    color: '#646464',
    marginTop: width(6),
    lineHeight: width(6),
    textAlign: 'center'
  },
  codeText: {
    fontSize: width(3.5),
    color: '#646464',
    textAlign: 'center'
  },
  text: {
    fontSize: width(3.5),
    color: '#646464',
    marginTop: width(6),
    marginBottom: width(6),
    lineHeight: width(6),
    textAlign: 'center'
  },
  inputsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: width(6),
    height: width(2)
  },
  inputWrapper: {
    width: '100%'
  },
  bottomPartWrapper: {
    width: '100%',
    alignItems: 'center'
  },
  roundBtnWrapper: {
    marginVertical: width(4)
  },
})
