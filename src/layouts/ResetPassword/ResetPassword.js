import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Alert, ActivityIndicator, Platform } from 'react-native'
import { connect } from 'react-redux'


import { width, height, iconImages, getBackgroundImageByType, getColorByType, getButtonBackgroundImageByType, isIphoneX, serverUrls} from 'constants/config'
import { connectWithNavigationIsFocused, checkNextProps, cleanPhoneNumb, fullCleanPhone } from 'utils'

import * as ApiUtils from 'actions/utils'

import NavBar from 'components/NavBar'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import PhoneInput from 'components/PhoneInput'
import RoundedBtn from 'components/RoundedBtn'

const fieldsOrder = ['phone']

@connectWithNavigationIsFocused(
  state => ({
		resetPswdRequest: state.resetPswdRequest
  }),
  dispatch => ({
    actionResetPswdRequest: (login) => {
      dispatch(fetchServ({ ...serverUrls.resetPswdRequest, url: serverUrls.resetPswdRequest.url + '/' + login }, null, null, 'RESETPSWDREQUEST'))
    },
    unsetUserData: () => {
      dispatch(ApiUtils.unsetUserData())
    },
  })
)
export default class ResetPassword extends Component {
  constructor(props) {
    super(props);
    const fields = {
      // email: '',
      phone: ''
    }
    this.state = {
      fields,
      isLoading: false
    }
  }

  onFieldChange = (fieldName, value) => {
    let newStateFields = this.state.fields
    newStateFields[fieldName] = value
    
    this.setState({fields: newStateFields})
  }

  onAddAvatarPress = () => {

  }

  continue = () => {
    const { navigation, actionResetPswdRequest } = this.props
    const { fields } = this.state
    const { phone, email } = fields
    if (phone) {
      this.setState({
        isLoading: true,
      }, () => {
        actionResetPswdRequest(phone && fullCleanPhone(phone))
      })
    }
  }

  onSubmitEditing = (fieldName) => {
		const { onSubmit } = this.props
		const indexOfField = fieldsOrder.indexOf(fieldName)
		if (indexOfField < fieldsOrder.length - 1) {
      this[fieldsOrder[indexOfField + 1]] && this[fieldsOrder[indexOfField + 1]].focus()
    } else {
      this.continue()
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
    } else if (propsCheckerResetRequest && propsCheckerResetRequest != 'empty') {
			const data = nextProps.resetPswdRequest.response
			this.setState({
        isLoading: false,
      }, () => {
        unsetUserData()
        this.goToConfirmCode()
      });
    } else if (propsCheckerResetRequest == 'empty') {
      this.setState({
        isLoading: false,
      }, () => {
        unsetUserData()
        this.goToConfirmCode()
      });
    }
  }

  goToConfirmCode = () => {
    const { navigation } = this.props
    const { fields } = this.state
    navigation.navigate('ConfirmCode', {...fields, phone: fullCleanPhone(fields.phone)})

  }

  render() {
    const { navigation } = this.props
    const { fields, isLoading } = this.state
    const { phone } = fields
    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        action: () => navigation.navigate('LoginStack')
      },
      centerPart: {
        text: 'Reset Password'
      },
    }
    return (
      <View style={styles.wrapper}>
        <NavBar {...navBarProps} navBarBackgroundImage={iconImages.navBarBackgroundImageGreen} navigation={navigation} />
        <KeyboardAvoidingView style={styles.content} behavior='padding'>
          <View style={styles.topPartWrapper}>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>
                What’s your mobile number?
              </Text>
            </View>
            <View style={styles.inputsWrapper}>
              <View style={styles.phoneInputWrapper}>
                <PhoneInput
                  {...(Platform.OS === 'ios'? {color: '#000000'}: undefined)}
                  refName={comp => this['phone'] = comp}
                  countryProps={{
                    wrapperStyle: {paddingRight: width(0)}
                  }}
                  placeholderTextColor="#7F7F7F"
                  phoneProps={{
                    placeholder : 'Mobile number',
                    wrapperStyle: { marginLeft: width(6) },
                    redDot: true,
                    ...Platform.select({
                    ios: {
                    color: '#000000',
                    },
                    }),
                    onSubmitEditing: () => this.onSubmitEditing('phone'),
                    returnKeyLabel: 'Next'
                  }}
                  value={phone}
                  arrowIconSource={iconImages.arrowDownIconWhite}
                  onChangeText={text => this.onFieldChange('phone', text)} />
              </View>
              <Sep />
            </View>
            <Sep />
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
                  fontSize: width(3.2),
                  marginTop: 0
                }}
                onPress={this.continue}
                backgroundColor="#8D8D8D"
                text="Continue" />
            </View>
          </View>
          <View style={styles.bottomPartWrapper}>

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
    flex: 1,
  },
  titleWrapper: {
    width: '100%',
    alignItems: 'center'
  },
  title: {
    fontSize: width(4.5),
    fontWeight: '400',
    color: '#646464',
    marginTop: width(8),
    marginBottom: width(6),
    lineHeight: width(8),
    textAlign: 'center',
    width: width(90)
  },
  inputsWrapper: {
    marginTop: width(8)
  },
  phoneInputWrapper: {
    width: '100%',
    height: isIphoneX()
      ? width(20)
      : width(18)
  },
  mailInputWrapper: {
    height: width(18)
  },
  bottomPartWrapper: {
    width: '100%',
    alignItems: 'center'
  },
  roundBtnWrapper: {
    marginVertical: width(6)
  },
})

// Email for reset password
// <Sep type="andOr" />
// <View style={styles.mailInputWrapper}>
//   <StdInput
//     refName={comp => this['email'] = comp}
//     returnKeyLabel='Done'
//     onSubmitEditing={() => this.onSubmitEditing('email')}
//     placeholder="Email Address"
//     value={email}
//     keyboardType='email-address'
//     onChangeText={text => this.onFieldChange('email', text)} />
// </View>
