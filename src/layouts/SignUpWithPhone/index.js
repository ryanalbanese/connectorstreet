import React, { Component} from 'react';
import { ScrollView, View, StyleSheet, Text, Alert, Platform, ImageEditor, ActivityIndicator, TouchableOpacity, Linking} from 'react-native';
import { Button } from 'react-native-elements';
import ImagePicker from 'react-native-image-picker'
import { NavigationActions } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import moment from 'moment'

import RNFS from 'react-native-fs'
import ImageResizer from 'react-native-image-resizer';
import ImageCropper from 'react-native-image-crop-picker';

import { width, height, iconImages, serverUrls, requiredList, imageInBase64, mainPath, isIphoneX } from 'constants/config';
import { connectWithNavigationIsFocused, checkNextProps, fullCleanPhone } from 'utils'

import Modal from './Modal';
import ModalSelectPhoto from './ModalSelectPhoto';
import ModalComplete from './ModalComplete';
import Background from './Background';
import Forms from './Forms';
import Avatar from './Avatar';
import NavBar from 'components/NavBar'

import fetchServ from 'actions/fetchServ'

var options = {
  title: 'Select Avatar',
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

@connectWithNavigationIsFocused(
	state => ({
		createUser: state.createUser
	}),
  dispatch => ({
    actionCreateUser: (data, headers) => {
      dispatch(fetchServ(serverUrls.createUser, data, headers, 'CREATEUSER'))
    }
  })
)

export default class SignUpWithPhone extends Component {

	constructor(props) {
		super(props);
		const { navigation } = this.props
		const navParams = navigation.state.params
		const navFields = navParams && navParams.fields
		const fields = {
			fName: navFields && navFields.fName || '',
			sName: navFields && navFields.sName || '',
			phone: navFields && navFields.phone || '',
      isocode: navFields && navFields.isocode || '',
			email: navFields && navFields.email || '',
			password: '',
      passwordConfirm: '',
			avatar: navFields && navFields.avatar || '',
			avatarSource: navFields && navFields.avatarSource || '',
			avatarExtension: navFields && navFields.avatarExtension || ''
		}
		this.state = {
			fields,
			modalSelectPhotoShow: false,
			modalCompleteShow: false,
			modalAreYouSureShow: false,
			checkedPhotoId: -1,
			isLoading: false,
			typeOfConfirmImageModal: null,
			prevValue: '',
      showEye: true,
		}
	}

	componentWillReceiveProps(nextProps) {
		const { navigation } = this.props
		const { fields } = this.state
		const propsCheckerCreateUser = checkNextProps(nextProps, this.props, 'createUser')
		if (propsCheckerCreateUser == 'error') {
			const error = nextProps.createUser.error
			this.setState({
        isLoading: false,
			}, () => {
				Alert.alert(error.msg, null, [
					{text: 'OK'}
				])
			});
    }
    else if (propsCheckerCreateUser && propsCheckerCreateUser != 'empty') {
			const data = nextProps.createUser.response
			this.setState({ isLoading: false }, () => {
				navigation.navigate('SignUpConfirmCode', {
					signUpCredentials: navigation.state && navigation.state.params && navigation.state.params.signUpCredentials,
					fields: {
						...fields,
            isocode: this.state.isocode,
						mfa_id: String(data.mfa_id)
					}
				})
			})
    }
    else if (propsCheckerCreateUser == 'empty') {
      this.setState({
        isLoading: false,
      });
    }
	}

	onFieldChange = (fieldName, value, isocode) => {
    let newStateFields = this.state.fields
		newStateFields[fieldName] = value
    this.setState({fields: newStateFields})
  }

	onGetStartedPress = () => {
		const { fields, checkedPhotoId } = this.state
		const { avatar, avatarSource } =fields
		if (this.checkFields()) {
			if (!avatar && !avatarSource && checkedPhotoId == -1) {
				this.setState({ modalAreYouSureShow: true });
				// this.setState({modalSelectPhotoShow: true})
			} else {
				this.setState({ typeOfConfirmImageModal: null }, () => this.requestCreateUser())
			}
		}
	}

	requestCreateUser = () => {
		const { actionCreateUser } = this.props
		const { fields  } = this.state
    let parameters = fields.phone && fields.phone.split(' ')[0].replace(/\d/g,'');
    let isocode1 = fields.phone.replace(/[0-9]/g, "")[0]
    let isocode2 = fields.phone.replace(/[0-9]/g, "")[1]

		this.setState({ isLoading: true, isocode: isocode1+isocode2}, () => {
			actionCreateUser({
        "isocode": isocode1+isocode2,
				"phone": fullCleanPhone(fields.phone),
				"email": fields.email
			})
		})
	}

	checkFields = () => {
		const { fields } = this.state
    if (fields.fName && fields.fName.length <= 2){
      Alert.alert('First name should not be less than three characters.')
      return false
    }
    if (fields.sName && fields.sName.length <= 2){
      Alert.alert('Last name should not be less than three characters.')
      return false
    }
    if (!fields.fName){
      Alert.alert('First name should not be empty')
			return false
    }
    if (!fields.sName){
      Alert.alert('Last name should not be empty')
			return false
    }
    if (!fields.email){
      Alert.alert('Email should not be empty')
			return false
    }
		if (!fields.password) {
			Alert.alert('The password should not be empty')
			return false
		}
    if (!fields.passwordConfirm) {
			Alert.alert('Confirm your password')
			return false
		}
     else {
      if (!fields.email.includes("@")){
        Alert.alert('Email address must include an "@"')
        return false
      }
			if (!/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(fields.password)) {
				Alert.alert(
          'Invalid password',
          'Use 8-30 characters, one special character, a number and uppercase letter')
				return false
			}
			if (!/\d/.test(fields.password)) {
				Alert.alert(
  'Invalid password',
  'Use 8-30 characters, one special character, a number and uppercase letter')
				return false
			}
			if (!(fields.password.length >= 8 && fields.password.length <= 30)) {
				Alert.alert(
  'Invalid password',
  'Use 8-30 characters, one special character, a number and uppercase letter')
				return false
			}
			if (fields.password === fields.password.toLowerCase()) {
				Alert.alert(
  'Invalid password',
  'Use 8-30 characters, one special character, a number and uppercase letter')
				return false
			}
			if (fields.password === fields.password.toUpperCase()) {
				Alert.alert(
  'Invalid password',
  'Use 8-30 characters, one special character, a number and uppercase letter')
				return false
			}
      if (fields.password != fields.passwordConfirm){
        Alert.alert('Passwords must match')
				return false
      }
		}
		return true
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
        console.log(error.code)
        if (error.code){
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

	onGetImageResponse = (response) => {
		if (response.didCancel) {
			console.log('User cancelled image picker');
		}
		else if (response.error) {
			console.log('ImagePicker Error: ', response.error);
		}
		else if (response.customButton) {
			console.log('User tapped custom button: ', response.customButton);
		}
		else {
			this.setState({ prevValue: this.state.fields.avatarSource }, () => {
				this.onFieldChange('avatar', response.uri)
				this.onFieldChange('avatarSource', 'data:image/jpeg;base64,' + response.data)
				this.onFieldChange('avatarExtension',
					response.path && response.path.split('.') && response.path.split('.')[response.path.split('.').length - 1] && response.path.split('.')[response.path.split('.').length - 1].toLowerCase() ||
					response.fileName && response.fileName.split('.') && response.fileName.split('.')[response.fileName.split('.').length -1] && response.fileName.split('.')[response.fileName.split('.').length -1].toLowerCase() ||
					'jpg'
				)
				this.setState({
					modalPhotoVisible: false,
					checkedPhotoId: -1
				}, () => {
					if (this.state.typeOfConfirmImageModal == 'profile') {
						this.setState({modalCompleteShow: true})
					}
				})
			})

		}
	}

	onModalSelectPhotoBtnPress = (btnKey, pictrueId) => {
		switch (btnKey) {
			case 'close':
				this.setState({modalSelectPhotoShow: false})
				break
			case 'cameraRoll':
				this.setState({ modalSelectPhotoShow: false }, () => {
					this.onCameraRollPress()
				})
				break
			case 'take':
				this.setState({ modalSelectPhotoShow: false }, () => {
					this.onTakePhotoPress()
				})
				break
			case 'picture':

				if (pictrueId != -1) {

					this.setState({
						checkedPhotoId: pictrueId
					}, () => {
						setTimeout(() => {

							  this.setState({ prevValue: this.state.fields.avatarSource }, () => {
								this.onFieldChange('avatar', imageInBase64[pictrueId])
								this.onFieldChange('avatarSource', imageInBase64[pictrueId])
								this.onFieldChange('avatarExtension', 'png')
								this.setState({ modalSelectPhotoShow: false }, () => this.setState({ modalCompleteShow: true }))
							})
						}, 500)
					})
					break
				}
		}
	}

	onModalCompleteBtnPress = (btnKey) => {
		switch (btnKey) {
			case 'close':
				this.setState({modalCompleteShow: false})
				break
			case 'back':
				const { prevValue } = this.state
				this.onFieldChange('avatar', prevValue)
				this.onFieldChange('avatarSource', prevValue)
				this.setState({
					prevValue: null,
					modalCompleteShow: false,
					checkedPhotoId: -1
				})
				break
			case 'confirm':
				this.setState({ modalCompleteShow: false }, () => {
					if (this.state.typeOfConfirmImageModal != 'profile') {
						this.requestCreateUser()
					} else {
						this.setState({modalCompleteShow: false})
					}
				})
				break
		}
	}

	onModalAreYouSureBtnPress = (btnKey) => {
		switch (btnKey) {
			case 'close':
				this.setState({modalAreYouSureShow: false})
				break
			case 'later':
				this.setState({ modalAreYouSureShow: false }, () => {
					this.requestCreateUser()
				})
				break
			case 'select':
				this.setState({ modalAreYouSureShow: false }, () => {
					this.setState({modalSelectPhotoShow: true})
				})
				break
		}
	}

	onAvatarAddPress = () => {
		this.setState({modalSelectPhotoShow: true, typeOfConfirmImageModal: 'profile'})

	}

  onEyePress= () => {
    this.setState({
      showEye: this.state.showEye == true? false : true
    })
  }

	render () {
		const { navigation } = this.props
		const { fields, modalSelectPhotoShow, modalCompleteShow, modalAreYouSureShow, checkedPhotoId, isLoading } = this.state
		const { avatar, avatarSource } = fields

    const resetAction = NavigationActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'LoginStack'})
      ],
     key:null
    })

		const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackArrowLongIconWhite,
        action: () =>   navigation.dispatch(resetAction)
      },
      centerPart: {
				image: iconImages.navBarLogoImage,
        imageWrapperCustomStyle: {
					width: width(50),
					height: width(20),
          marginLeft: width(7),
					alignItems: 'center',
					justifyContent: 'center',
				},
				imageCustomStyles: {
					height: '100%',
					width: '100%',
          marginLeft: width(2),
					marginTop: width(4),
				}
      },
		}

		return (
				<View style={styles.wrapper}  contentContainerStyle={{flex: 1}}>
					<Background />
					<View style={styles.content}>

						<NavBar {...navBarProps} transparent navigation={navigation} />
            <KeyboardAwareScrollView style={{flex: 1, zIndex: 0}} extraScrollHeight={0} keyboardShouldPersistTaps="handled" enableOnAndroid={true}>
						<Text style={styles.titleText}>
							Complete Profile
						</Text>
						<Avatar avatar={avatar} onPress={this.onAvatarAddPress}/>
						<View style={styles.formsWrapper}>
							<Forms
                isSecure={this.state.showEye}
                onEyePress={this.onEyePress}
                onSubmit={this.onGetStartedPress}
                fields={fields}
                onFieldChange={this.onFieldChange}
              />
						</View>
						</KeyboardAwareScrollView>
							<TouchableOpacity
                buttonTextStyle={styles.buttonTextStyle}
								title='Get Started'
								textStyle={{ fontSize: width(4)}}
								containerStyle={styles.getStartedBtnContainer}
								style={styles.getStartedBtn}
								onPress={this.onGetStartedPress}>
                  <Text style={styles.buttonTextStyle}>GET STARTED</Text>
                </TouchableOpacity>
						</View>
						<ModalSelectPhoto
							onBtnPress={this.onModalSelectPhotoBtnPress}
							checkedPhotoId={checkedPhotoId}
							visible={modalSelectPhotoShow}/>
						<ModalComplete
							avatar={avatar}
							onBtnPress={this.onModalCompleteBtnPress}
							visible={modalCompleteShow}/>
						<Modal
							onBtnPress={this.onModalAreYouSureBtnPress}
							visible={modalAreYouSureShow} />
              {
                isLoading
                  ? <ActivityIndicator style={styles.loadingIndicator} animating={true}  color="#FFF" size="small"/>
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
    zIndex: 0,
		flex: 1,
		backgroundColor: 'rgba(80, 210, 194, 0.95)',
	},
	contentContainerStyle: {
		// justifyContent: 'space-between',
		flex: 1
	},
	content: {
		flex: 1,

	},
	titleText: {
		fontSize: width(5.5),
		textAlign: 'center',
		color: 'white',
    marginBottom: width(5),
		//  marginBottom: height(1),
		 marginTop: isIphoneX()
     ? width(10)
     : -2
	},
	getStartedBtn: {
    zIndex: 1,
		width: width(100),
		height: isIphoneX()
    ? width(15)
    : width(15),
    color: '#207295',
		alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 1)'
	},
  buttonTextStyle: {
    color: '#207295',
    fontWeight: 'bold'
  },
	getStartedBtnContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0
	},
	formsWrapper: {
		marginTop: width(0),
		flex: 1
	}
})
