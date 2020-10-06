import React, { Component } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Alert, Platform, NativeModules, ImageEditor, ActivityIndicator, Linking} from 'react-native'
import { connect } from 'react-redux'
import { Icon } from 'react-native-elements';
import ImagePicker from 'react-native-image-picker'
import openSettings from 'react-native-permissions'
import RNFetchBlob from 'rn-fetch-blob'

import RNFS from 'react-native-fs'
import ImageResizer from 'react-native-image-resizer';
import FastImage from 'react-native-fast-image'
import ImageCropper from 'react-native-image-crop-picker';

import { width, height, iconImages, imageInBase64, getBackgroundImageByType, getColorByType, getButtonBackgroundImageByType, serverUrls, requiredList, socialData, isIphoneX } from 'constants/config'
import { connectWithNavigationIsFocused, checkNextProps, filterBlackList, filterWhiteList, getAuthHeader } from 'utils'

import * as Models from 'models'
import * as ApiUtils from 'actions/utils'

import NavBar from 'components/NavBar'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import StdBtn from 'components/StdBtn'
import CountryPicker from 'components/CountryPicker'
import ShowImagePickModal from 'components/ShowImagePickModal'
import ModalSelectPhoto from './ModalSelectPhoto';

import fetchServ from 'actions/fetchServ';

const boolFields = ['emailNotif', 'pushNotif', 'textNotif', 'linkedin', 'twitter', 'facebook']

const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs

var options = {
  title: 'Select Avatar',
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

@connectWithNavigationIsFocused(
  state => ({
    setSettings: state.setSettings,
    getSettings: state.getSettings,
    updateSettings: state.updateSettings,
    userData: state.userData,
    updateUser: state.updateUser,
    getUsers: state.getUsers,
    countryCodes: state.countryCodes,
    uploadImage: state.uploadImage
  }),
  dispatch => ({
    actionSetSettings(userId, data) {
      dispatch(Models.settings.setSettings(userId, data))
    },
    actionUpdateSettings(userId, data) {
      dispatch(Models.settings.updateSettings(userId, data))
    },
    actionGetSettings(userId) {
      dispatch(Models.settings.getSettings(userId))
    },
    actionUpdateUser(userId, keyValue, headers) {
      dispatch(fetchServ({...serverUrls.updateUser, url: serverUrls.updateUser.url + '/' + userId}, keyValue, headers, 'UPDATEUSER'))
    },
    actionGetUsers(filters, headers) {
      dispatch(fetchServ({ ...serverUrls.getUsers, url: serverUrls.getUsers.url }, filters, headers, 'GETUSERS'))
    },
    actionUploadImage(data, headers) {
      dispatch(fetchServ(serverUrls.uploadImage, data, headers, 'UPLOADIMAGE'))
    },
    setUserData: (data) => {
      dispatch(ApiUtils.setUserData(data))
    },
  })
)
export default class Settings extends Component {
  constructor(props) {
    super(props);
    const {userData, navigation} = this.props
    const fields = {
      fName: '',
      sName: '',
      nickName: '',
      password: '',
      email: '',
      isoCode: userData.userModel.isocode || '',
      emailNotif: true,
      pushNotif: true,
      textNotif: true,
      linkedin: false,
      twitter: false,
      facebook: false,
      avatar: '',
      avatarSource: '',
      avatarExtension: '',
      prevImage: ''
    }
    this.state = {
      fields,
      isLoading: false,
      signUpCredentials: [],
      // showPickerModal: false,
      modalSelectPhotoShow: false,
      checkedPhotoId: -1,
    }

  }

  componentWillMount() {
    const { userData, actionGetSettings, navigation } = this.props
    if (userData && userData.userModel) {

      const userId = userData.userModel.user_uid
      const token = userData.token
      if (userData.settings && Object.keys(userData.settings).length) {
        this.setState({ fields: {
        ...userData.settings,
        isocode: userData.userModel.isocode
      }
    }, () => {
          this.setState({ isLoading: true }, () => {
            actionGetSettings(userData.userModel.user_uid)
          })
        })
      } else {
        this.setState({ isLoading: true }, () => {
          actionGetSettings(userData.userModel.user_uid)
        })
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const { setUserData, navigation, actionGetSettings, actionGetUser, actionUploadImage, actionGetUsers } = this.props
    const { fields } = this.state

    const propsCheckerGetSettings = checkNextProps(nextProps, this.props, 'getSettings')
    if (propsCheckerGetSettings == 'error' && nextProps.isFocused) {
      const error = nextProps.getSettings.error
      this.setState({
        isLoading: false,
      }, () => {
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      });
    }
    else if (propsCheckerGetSettings && nextProps.isFocused && propsCheckerGetSettings != 'empty') {
      const data = nextProps.getSettings.response

      setUserData({settings: data})
    }
    else if (propsCheckerGetSettings == 'empty' && nextProps.isFocused) {
      const dataFormUserModel = nextProps.userData.userModel

      const { fields } = this.state
      this.setState({ isLoading: false }, () => {
        this.setState({
          fields: {
            ...fields,
            isocode: dataFormUserModel && dataFormUserModel.userModel && dataFormUserModel.userModel.isocode || 'US(+1)',
            fName: dataFormUserModel.firstName,
            sName: dataFormUserModel.lastName,
            nickName: dataFormUserModel.nickname,
            email: dataFormUserModel.email,
            avatar: dataFormUserModel.avatar || iconImages.avatarPlaceholder,
            avatarSource: ''
          }
        })
      })
    }

    const propsCheckerUpdateUser = checkNextProps(nextProps, this.props, 'updateUser')
    if (propsCheckerUpdateUser == 'error' && nextProps.isFocused) {
      const error = nextProps.getSettings.error
      this.setState({
        isLoading: false,
      }, () => {
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      });
    }
    else if (propsCheckerUpdateUser && nextProps.isFocused) {
      if (fields.avatarSource) {
        const imageData = fields.avatarSource.replace('data:image/jpeg;base64,', '').replace('data:image/png;base64,', '')

        actionUploadImage({
          image: imageData,
          type: fields.avatarExtension
        }, getAuthHeader(nextProps.userData.token))
      } else {
        actionGetUsers({
          user_uid: nextProps.userData.userModel.user_uid
        }, getAuthHeader(nextProps.userData.token))
      }
    }

    const propsCheckerUploadImage = checkNextProps(nextProps, this.props, 'uploadImage')
    if (propsCheckerUploadImage == 'error' && nextProps.isFocused) {
      const error = nextProps.uploadImage.error
      this.setState({
        isLoading: false,
      }, () => {
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      });
    }
    else if (propsCheckerUploadImage && nextProps.isFocused) {
      const data = nextProps.uploadImage.response

      // this.onFieldChange('avatar', data.avatar_url)
      actionGetUsers({
        user_uid: nextProps.userData.userModel.user_uid
      }, getAuthHeader(nextProps.userData.token))
    }

    const propsCheckerGetUser = checkNextProps(nextProps, this.props, 'getUsers')
    if (propsCheckerGetUser == 'error' && nextProps.isFocused) {
      const error = nextProps.getUsers.error
      this.setState({
        isLoading: false,
      }, () => {
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      });
    }
    else if (propsCheckerGetUser && nextProps.isFocused && propsCheckerGetUser != 'empty') {
      const data = nextProps.getUsers.response
      this.setState({
        isLoading: false,
      }, () => {
        Alert.alert('The settings are saved', null, [
          {text: 'OK'}
        ])
        setUserData({
          userModel: {
            ...data,
            avatar: data.avatar,
            nickName: nextProps.getUsers.response.nickname,
          }
        })
      })


    }

    const propsCheckerSetSettings = checkNextProps(nextProps, this.props, 'setSettings')
    if (propsCheckerSetSettings == 'error' && nextProps.isFocused) {
      const error = nextProps.setSettings.error
      this.setState({
        isLoading: false,
      }, () => {
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      });
    }
    else if (propsCheckerSetSettings && nextProps.isFocused) {
      actionGetSettings(nextProps.userData.userModel.user_uid)
      Alert.alert('The settings are saved', null, [
        {text: 'OK'}
      ])
    }

    const propsCheckerUpdateSettings = checkNextProps(nextProps, this.props, 'updateSettings')
    if (propsCheckerUpdateSettings == 'error' && nextProps.isFocused) {
      const error = nextProps.updateSettings.error
      this.setState({
        isLoading: false,
      }, () => {
        Alert.alert(error.msg, null, [
          {text: 'OK', onPress: () => navigation.goBack()}
        ], {
          onDismiss: () => navigation.goBack()
        })
      });
    }
    else if (propsCheckerUpdateSettings && nextProps.isFocused) {
      const data = nextProps.getSettings.response
      actionGetSettings(nextProps.userData.userModel.user_uid)

    }

    const propsCheckerUserData = checkNextProps(nextProps, this.props, 'userData', null, true)
    if (propsCheckerUserData && nextProps.isFocused && propsCheckerUserData != 'empty') {
      this.setState({ isLoading: false }, () => {

        const dataFormUserModel = nextProps.userData.userModel
        const savedSettings = nextProps.userData.settings
        const signUpCredentials = nextProps.userData.signUpCredentials

        let newFields = {
          ...savedSettings,
          ...this.state.fields,
          fName: dataFormUserModel.firstName,
          sName: dataFormUserModel.lastName,
          nickName: dataFormUserModel.nickname,
          email: dataFormUserModel.email,
          avatarSource: ''
        }
        if (!this.state.fields.avatar) {

          newFields = {...newFields, avatar: dataFormUserModel.avatar}
        } else {

        }
        this.setState({
          fields: newFields,
          signUpCredentials: signUpCredentials
        })
      })
    }
  }

  onFieldChange = (fieldName, value) => {
    let newStateFields = this.state.fields
    if (boolFields.indexOf(fieldName) != -1) {
      newStateFields[fieldName] = !newStateFields[fieldName]
    } else {
      newStateFields[fieldName] = value.trim()
    }

    this.setState({fields: newStateFields})
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

  onGetImageResponse = (response) => {


    if (response.didCancel) {

    }
    else if (response.error) {

    }
    else if (response.customButton) {

    }
    else {

      this.setState({ checkedPhotoId: -1 }, () => {
        this.onFieldChange('prevImage', this.state.fields.avatar)
        this.onFieldChange('avatar', response.uri)
        this.onFieldChange('avatarSource', 'data:image/jpeg;base64,' + response.data)
        this.onFieldChange('avatarExtension',
          response.path && response.path.split('.') && response.path.split('.')[1] && response.path.split('.')[1].toLowerCase() ||
          response.fileName && response.fileName.split('.') && response.fileName.split('.')[1] && response.fileName.split('.')[1].toLowerCase() ||
          'jpg'
        )
      })

    }
  }

  onAddAvatarPress = () => {
    ImagePicker.showImagePicker(options, (response) => {


      if (response.didCancel) {

      }
      else if (response.error) {

      }
      else if (response.customButton) {

      }
      else {

        ImageCropper.openCropper({
          path: response.uri,
          width: 300,
          height: 300,
          cropping: true,
          includeBase64: true
        }).then((imageObj) => {
          const res = {
            uri: imageObj.path,
            data: imageObj.data
          }
          this.onFieldChange('avatar', res.uri)
          this.onFieldChange('avatarSource', 'data:image/jpeg;base64,' + res.data)
          this.onFieldChange('avatarExtension',
            response.path && response.path.split('.') && response.path.split('.')[1] && response.path.split('.')[1].toLowerCase() ||
            response.fileName && response.fileName.split('.') && response.fileName.split('.')[1] && response.fileName.split('.')[1].toLowerCase() ||
            'jpg'
          )
        });
      }
    });
  }

  save = () => {
    const { userData, navigation, actionUpdateSettings, actionSetSettings, actionUpdateUser } = this.props
    const { fields } = this.state
    if (userData && userData.userModel && userData.userModel.user_uid) {
      let formError = false
      if (fields.fName && fields.fName.length <= 2){
        Alert.alert('First Name Error', 'Your first name must be longer than two characters.', [
          {text: 'OK'}
        ])
        formError = true
      }
      if (fields.sName && fields.sName.length <= 2){
        Alert.alert('Last Name Error', 'Your last name must be longer than two characters.', [
          {text: 'OK'}
        ])
        formError = true
      }
      const userId = userData.userModel.user_uid
      const token = userData.token
      if (!formError){
        if (userData.settings && !formError) {

          this.setState({ isLoading: true }, () => {
            actionUpdateSettings(
              userId,
              filterBlackList(
                ['fName', 'sName', 'nickName', 'avatar', 'avatarSource', 'avatarExtension'],
                fields
              )
            )
            actionUpdateUser(
              userId,
              fields,
              getAuthHeader(token)
            )
          })
        }
        else {
          this.setState({ isLoading: true }, () => {
            actionSetSettings(
              userId,
              filterBlackList(
                ['fName', 'sName', 'nickName', 'avatar', 'avatarSource', 'avatarExtension'],
                fields
              )
            )
            actionUpdateUser(
              userId,
              fields,
              getAuthHeader(token)
            )
          })
        }
      }

    }
    // navigation.navigate('HomeStack')
  }

  cancel = () => {
    const { navigation } = this.props
    navigation.navigate('HomeStack')
  }

  pickerModalCallback = (result) => {
    switch (result) {
      case 'close':
        this.setState({showPickerModal: false})
        break
      case 'takePicture':
        this.setState({showPickerModal: false}, () => this.onTakePhotoPress())
        break
      case 'cameraRoll':
        this.setState({showPickerModal: false}, () => this.onCameraRollPress())
        break
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
              this.onFieldChange('avatar', imageInBase64[pictrueId])
              this.onFieldChange('avatarSource', 'data:image/jpeg;base64,' + imageInBase64[pictrueId])
              this.onFieldChange('avatarExtension', 'png')
              this.setState({ modalSelectPhotoShow: false })
						}, 500)
					})
					break
				}
		}
  }

  onAvatarAddPress = () => {
		this.setState({modalSelectPhotoShow: true, typeOfConfirmImageModal: 'profile'})
		// this.setState({typeOfConfirmImageModal: 'profile'}, () => {
		// 	ImagePicker.showImagePicker(options, (response) => {
		// 		this.onGetImageResponse(response)
		// 	});
		// })
	}

  render() {
    const { navigation } = this.props
    const { fields, isLoading, checkedPhotoId, modalSelectPhotoShow } = this.state
    const { fName, sName, email, password, nickName, emailNotif, pushNotif, textNotif, linkedin, twitter, facebook, avatar, avatarSource, isocode } = fields

    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        action: () => navigation.goBack()
      },
      centerPart: {
        image: iconImages.navBarLogoImage,
        imageWrapperCustomStyle: {
          width: width(60),
          height: width(16),
          alignItems: 'center',
          justifyContent: 'center',
        },
        imageCustomStyles: {
          height: '70%',
          width: '70%',
          marginLeft: width(8),
          marginTop: width(2)
        }
      },
    }
    const saveDisabled = !Object.keys(fields).every(fieldKey => requiredList['settings'].includes(fieldKey)
      ? !!fields[fieldKey]
      : true
    )
    return (
      <View style={styles.wrapper} >
        <ImageBackground style={styles.settingBackgroundImage} source={iconImages.settingsBackgroundImage}>
        <NavBar {...navBarProps} navBarBackgroundImage={iconImages.navBarBackgroundImageBlue} navigation={navigation} />
        <ScrollView showsVerticalScrollIndicator={false} style={styles.content} contentContainerStyle={styles.contentContainerStyle}>
            <View style={styles.topPartWrapper}>
              <View style={styles.avatarWrapper}>
                <TouchableOpacity onPress={this.onAvatarAddPress}>
                  <View style={styles.avatarInner}>
                    <View style={styles.avatarImageWrapper}>
                      {
                        avatar
                          ? avatar.indexOf('http') != -1
                            ?  <FastImage
                                  style={styles.avatarImage}
                                  source={avatar && {
                                    uri: avatar
                                  }}
                              resizeMode={FastImage.resizeMode.cover} />
                            : <Image
                            style={styles.avatarImage}
                            source={
                              avatar
                                ? { uri: avatar }
                                : iconImages.addPhotoIcon
                            }/>
                          : <Image
                          style={styles.avatarImage}
                          source={
                            avatar
                              ? { uri: avatar }
                              : iconImages.addPhotoIcon
                          }/>
                      }
                    </View>
                    <View style={styles.avatarIconContainerWrapper}>
                      <ImageBackground resizeMode="cover" source={iconImages.smallAddIconBackgroundBlue} style={styles.avatarIconContainerBackgroundImage}>

                      </ImageBackground>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputsPart}>
              <View source={iconImages.settingsBackgroundImage} style={styles.inputsInner}>
                <View style={styles.inputWrapper}>
                  <StdInput
                    label="FIRST NAME"
                    autoCapitalize="sentences"
                    value={fName}
                    type="splited"
                    inputStyle={{
                      marginLeft: width(30),
                      color: 'white'

                    }}
                    onChangeText={text => this.onFieldChange('fName', text)} />
                  <Sep color="white" />
                </View>
                <View style={styles.inputWrapper}>
                  <StdInput
                    label="LAST NAME"
                    autoCapitalize="sentences"
                    value={sName}
                    type="splited"
                    inputStyle={{
                      marginLeft: width(30),
                      color: 'white'
                    }}
                    onChangeText={text => this.onFieldChange('sName', text)} />
                  <Sep color="white" />
                </View>

                <View style={styles.inputWrapper}>
                  <StdInput
                    label="EMAIL"
                    autoCapitalize="none"
                    value={email}
                    type="splited"
                    inputStyle={{
                      marginLeft: width(30),
                      color: 'white'
                    }}
                    onChangeText={text => this.onFieldChange('email', text)} />
                  <Sep color="white" />
                </View>
                <View style={styles.inputWrapper}>
                <View style={styles.inputWrapper}>
                <CountryPicker
                  refName={comp => this['isocode'] = comp}
                  countryProps={{
                      wrapperStyle: {
                        paddingRight: width(0),
                        borderRightWidth: width(0)
                      }
                    }}
                    value={isocode}
                    onChangeText={text => this.onFieldChange('isocode', text)}
                  />
                </View>
                  <Sep color="white" />
                </View>
                <View style={styles.inputWrapper}>
                  <StdInput
                    label="EMAIL NOTIFICATIONS"
                    value={emailNotif}
                    type="splited-switch"
                    inputStyle={{
                      marginLeft: width(0),
                      color: 'white'
                    }}
                    secureTextEntry={true}
                    onValueChange={() => this.onFieldChange('emailNotif')} />
                  <Sep color="white" />
                </View>
                <View style={styles.inputWrapper}>
                  <StdInput
                    label="PUSH NOTIFICATIONS"
                    value={pushNotif}
                    type="splited-switch"
                    inputStyle={{
                      marginLeft: width(0),
                      color: 'white'
                    }}
                    secureTextEntry={true}
                    onValueChange={() => this.onFieldChange('pushNotif')} />
                  <Sep color="white" />
                </View>
                <View style={styles.inputWrapper}>
                  <StdInput
                    label="TEXT NOTIFICATIONS"
                    value={textNotif}
                    type="splited-switch"
                    inputStyle={{
                      marginLeft: width(0),
                      color: 'white'
                    }}
                    secureTextEntry={true}
                    onValueChange={() => this.onFieldChange('textNotif')} />
                </View>
                <TouchableOpacity style={styles.deleteAccountWrapper} onPress={() => Linking.openURL('https://form.asana.com?hash=12a924bc88b391cf55ca8df2a97131f2e62b177bf2053fe82b4fe7d2f9316342&id=1125014409719632')}>
                  <Text style={styles.deleteAccountButton}>Delete account</Text>
                </TouchableOpacity>
              </View>
            </View>

        </ScrollView>

        <View style={styles.buttonsWrapper}>
          <View style={[styles.btnWrapper, {backgroundColor: '#5F9DD0'}]}>
            <TouchableOpacity onPress={() => this.cancel()}>
              <View style={styles.btnInner}>
                <Text style={styles.btnText}>
                  CANCEL
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.btnWrapper, {backgroundColor: '#52C986'}]}>
            <TouchableOpacity disabled={saveDisabled} style={[saveDisabled && {opacity: 0.5}]} onPress={() => this.save()}>
              <View style={styles.btnInner}>
                <Text style={styles.btnText}>
                  SAVE
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {
          isLoading
            ? <ActivityIndicator style={styles.loadingIndicator} animating={true}  color="#FFF" size="small"/>
            : null
        }

        <ModalSelectPhoto
          onBtnPress={this.onModalSelectPhotoBtnPress}
          checkedPhotoId={checkedPhotoId}
          visible={modalSelectPhotoShow}/>
            </ImageBackground>
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
    height: height(100),
    width: '100%',
    backgroundColor: '#3B8AC3'
  },
  content: {
    flex: 1,
    marginBottom: width(13),
    minHeight: height(85)
  },
  contentContainerStyle: {
    alignItems: 'center',
    paddingBottom: 50,
    height: isIphoneX()
      ? '100%'
      : 'auto'
  },
  topPartWrapper: {
    width: '100%'
  },
  deleteAccountWrapper:{
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteAccountButton:{
    fontSize: 14,
    color: '#FFFFFF'
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#73C9D6',
    paddingVertical: width(5)
  },
	avatarInner: {
		position: 'relative',
		justifyContent: 'center',
		alignSelf: 'center',
		paddingTop: width(1),
		marginTop: width(1)
	},
	avatarIconContainerWrapper: {
		height: width(7),
		width: width(7),
		borderWidth: 1,
		borderColor: 'white',
		position: 'absolute',
		backgroundColor: '#5C91E1',
		top: width(0.4),
		right: width(0.8),
		borderRadius: width(7),
		overflow: 'hidden',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	avatarIconContainerBackgroundImage: {
		height: '100%',
		width: '100%',
		backgroundColor: '#FFF',
	},
	avatarImageWrapper: {
		width: width(26),
		height: width(26),
		borderRadius: width(26),
		overflow: 'hidden'
	},
	avatarImage: {
		height: '100%',
		width: '100%',
  },
  inputsPart: {
    flex: 1,
    width: '100%',
    alignItems: 'center'
  },
  inputsInner: {
    flex: 1,
    width: width(90),
  },
  inputsWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputWrapper: {
    height: width(18),
    width: '100%',
  },
  settingBackgroundImage: {
    flex: 1,
    width: '100%',
    marginRight: 0,
    marginLeft: 0
  },
  buttonsWrapper: {
    width: width(100),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  btnWrapper: {
    flex: 1,
    height: width(14),
  },
  btnInner: {
    marginVertical: width(5),
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnText: {
    color: 'white',
    fontSize: width(3)
  }
})
