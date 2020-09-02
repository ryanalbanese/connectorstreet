import React, { Component } from 'react';
import { View, Text, Image, Alert, NativeModules } from 'react-native';
import { Button } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';

import ImageCropper from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs'

import { width, height, iconImages, socialData, serverUrls, mainPath } from 'constants/config';
import { checkNextProps, connectWithNavigationIsFocused, getAuthHeader, initModels } from 'utils'

import NavBar from 'components/NavBar'
import Buttons from './Buttons';
import Background from './Background';

export default class SignUp extends Component {
	constructor(props) {
		super(props);
		// LinkedinLogin.init(
		// 	[
		// 		'r_emailaddress',
		// 		'r_basicprofile'
		// 	]
		// );
		this.state = {
			isLoading: false,
			signUpCredentials: null
		}
	}



	render() {
		const { navigation } = this.props
		const { isLoading } = this.state
		const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackArrowLongIconWhite,
        action: () => this.goBack()
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
					height: '120%',
					width: '120%',
					marginTop: width(20),
				}
      },
    }
		return (
			<View style={ { flex: 1, justifyContent: 'space-around', backgroundColor: 'rgba(80, 210, 194, 0.95)' } }>
				<Background />
				<NavBar {...navBarProps} transparent navigation={navigation} />
     		<View style={ { height: width(5) } } />
     		<Text style={ { fontSize: width(6), textAlign: 'center', color: 'white', marginBottom: width(5) } }>Sign Up With</Text>
     		<Buttons onBtnPress={this.onLoginWithBtnPress} />
     		<Text style={ { fontSize: width(3.2), textAlign: 'center', color: 'white' } }>OR</Text>
     		<Button title='Mobile Number' textStyle={ { fontSize: width(3.8) } } borderRadius={ 30 } buttonStyle={ { width: width(54), height: width(10), alignSelf: 'center', backgroundColor: 'rgba(255, 255, 255, 0.3)' } } onPress={ this.onMobileNumberPress } />
     		<View style={ { height: width(50) } }>
				</View>
				{
          isLoading
            ? <ActivityIndicator style={styles.loadingIndicator} animating={true}  color="#3E3E3E" size="small"/>
            : null
        }
				<LinkedInModal
					ref={comp => this.linkedInModal = comp}
					linkText=""
          clientID={socialData.linkedIn.clientID}
          clientSecret={socialData.linkedIn.clientSecret}
          redirectUri="https://google.com"
          onSuccess={this.getLinkedInProfile}
        />
   		</View>
		);
	}
}
