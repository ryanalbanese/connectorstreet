import React, { Component } from 'react';
import { View, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Image, StyleSheet, SectionList } from 'react-native';
import Overlay from 'react-native-modal-overlay';
import { NavigationActions } from 'react-navigation';
import { Button, Text, Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

import { width, height, iconImages } from 'constants/config'
import { getUserModel } from 'utils'

export default class ModalShowContact extends Component {

	onEmailPress = (detailsData) => {

    const { userData } = this.props
    const mateUserModel = getUserModel(userData, detailsData)
    const prefix = Platform.OS == 'ios'
      ? 'mailto:'
      : 'mailto:'
      mateUserModel && Linking.openURL(prefix + mateUserModel.email + '?subject=Connector Street&body=Hi '+mateUserModel.fName+',\n\nIt’s great to meet you! \n\nBest, \n'+userData.userModel.firstName+'')
  }

  onTextPress = (detailsData) => {
    const { userData } = this.props
    const mateUserModel = getUserModel(userData, detailsData)
    const prefix = Platform.OS == 'ios'
      ? 'sms:'
      : 'sms:'
      mateUserModel && Linking.openURL(prefix + mateUserModel.phone)
  }

  onMessagePress = (detailsData) => {

    const { navigation } = this.props

    navigation.navigate('ConnSelectAndEditMsg', {detailsData})
  }

  onIntroducePress = (detailsData) => {
    const { navigation, setMakeIntroductionData, userData } = this.props
    const mateUserModel = getUserModel(userData, detailsData)
    if (mateUserModel) {
      setMakeIntroductionData({
        fPerson: mateUserModel
      })
      navigation.navigate('MakeIntroductions', {prevScreen: 'Connections'})
    }
  }

  goToDetail = () =>{
    const {navigation} = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData

    this.setState(
      {
        modalShowInfo: true,
        modalData: detailsData
      }
    )

  }

	render() {
		const { closeOnTouchOutside, onBtnPress, visible, personKey, data, detailsData, isUser, hasEmail } = this.props

		return (
			<Overlay visible={visible}
				closeOnTouchOutside={true}
				onClose={() => onBtnPress('close')}
				animationType='zoomIn'
				animationDuration={300}
				containerStyle={{
					backgroundColor: 'rgba(0, 0, 0, .8)',
					justifyContent: 'center',
					alignItems: 'center'
				}}
				childrenWrapperStyle={{
					backgroundColor: 'rgba(0, 0, 0, 0)',
					borderRadius: 10,
					height: '100%',
					width: '100%'
				}}>
				<View style={styles.crossIconWrapper}>
					<TouchableOpacity onPress={() => onBtnPress('close')}>
						<View style={styles.crossIconInner}>
							<Image style={styles.crossIconImage} source={iconImages.navBarCrossIconWhite} />
						</View>
					</TouchableOpacity>
				</View>
				<View
					style={{
						flex: 1,
						width: '100%',
						alignItems: 'center',
				    justifyContent: 'center',
					}}>

					<View style={styles.container}>

					<View style={styles.wrapper}>
						{
							hasEmail
							? <View>
									<View style={styles.row}>
						        <TouchableOpacity style={[styles.sBtn, styles.sBtnBorder]} onPress={() => onBtnPress('text')} activeOpacity={ 0.5 }>
						          <Image style={styles.btnIcon} source={ iconImages.text } resizeMode='contain' />
						          <Text style={styles.btnText}>Text Message</Text>
						        </TouchableOpacity>
										<TouchableOpacity style={[styles.fBtn, {borderBottomWidth: 0}]} onPress={() => onBtnPress('email')} activeOpacity={ 0.5 }>
											<Image style={styles.btnIcon} source={ iconImages.email } resizeMode='contain' />
											<Text style={styles.btnText}>Email</Text>
										</TouchableOpacity>
						      </View>
						      <View style={styles.row}>
						        <TouchableOpacity style={[styles.sBtn, {borderBottomWidth: 0}]} onPress={() => onBtnPress('introduce')} activeOpacity={ 0.5 }>
						          <Image style={styles.btnIcon} source={ iconImages.introduce } resizeMode='contain' />
						          <Text style={styles.btnText}>Introduce</Text>
						        </TouchableOpacity>
										<TouchableOpacity style={[styles.fBtn, {borderBottomWidth: 0}]} onPress={() => onBtnPress('add')} activeOpacity={ 0.5 }>
						          <Image style={styles.btnIcon} source={ iconImages.addToContacts } resizeMode='contain' />
						          <Text style={styles.btnText}>Add to Contacts</Text>
						        </TouchableOpacity>
						      </View>
									{
										isUser?
										<View style={styles.row}>
										<TouchableOpacity style={[styles.messageButton, styles.btnCenter]}  onPress={() => onBtnPress('message')} activeOpacity={ 0.5 } >
						          <Image style={styles.btnIcon} source={ iconImages.message } resizeMode='contain' />
						          <Text style={styles.btnText}>Message</Text>
						        </TouchableOpacity>
						      </View>
									:null
									}
								</View>
							:
							<View><View style={styles.row}>
				        <TouchableOpacity style={[styles.sBtn, styles.sBtnBorder]} onPress={() => onBtnPress('text')} activeOpacity={ 0.5 }>
				          <Image style={styles.btnIcon} source={ iconImages.text } resizeMode='contain' />
				          <Text style={styles.btnText}>Text Message</Text>
				        </TouchableOpacity>
								<TouchableOpacity style={[styles.sBtn, {borderBottomWidth: 0}]} onPress={() => onBtnPress('introduce')} activeOpacity={ 0.5 }>
				          <Image style={styles.btnIcon} source={ iconImages.introduce } resizeMode='contain' />
				          <Text style={styles.btnText}>Introduce</Text>
				        </TouchableOpacity>
				      </View>
				      <View style={styles.row}>

								<TouchableOpacity style={[styles.fBtn, {borderBottomWidth: 0}]} onPress={() => onBtnPress('add')} activeOpacity={ 0.5 }>
				          <Image style={styles.btnIcon} source={ iconImages.addToContacts } resizeMode='contain' />
				          <Text style={styles.btnText}>Add to Contacts</Text>
				        </TouchableOpacity>
								{
									isUser?
									<>
										<TouchableOpacity style={[styles.messageButton, styles.btnCenter]}  onPress={() => onBtnPress('message')} activeOpacity={ 0.5 } >
						          <Image style={styles.btnIcon} source={ iconImages.message } resizeMode='contain' />
						          <Text style={styles.btnText}>Message</Text>
						        </TouchableOpacity>
					      </>
								:null
								}
				      </View>
						</View>
						}


			    </View>
      		</View>
				</View>
			</Overlay>
		)
	}
}

const styles = StyleSheet.create({

	container: {
   marginTop: 40,
	 flex: 1,
	 width: '100%',
	 alignItems: 'center',

  },
  sectionHeader: {
		flex: 1,
    paddingTop:12,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 12,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,0.6)',
  },
  item: {
    padding: 10,
    fontSize: 14,
    height: 44,
  },
	crossIconWrapper: {
		position: 'absolute',
		top: width(8),
		left: width(0),
		height: width(10),
		width: width(10),
	},
	crossIconInner: {
		height: width(6),
		width: width(6),
		padding: width(0.4)
	},
	crossIconImage: {
		height: '100%',
		width: '100%',
		resizeMode: 'contain',
	},
	avatarImageWrapper: {
    height: width(35),
    width: width(35),
    borderRadius: width(45),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: width(20),
  },
  avatarImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover'
  },
	wrapper: {
		marginTop: width(15),
		width: width(80)
	},
	row: {
		flexDirection: 'row'
	},
	fBtn: {
		margin: 5,
		flex: 0.5,
		borderColor: 'rgba(255, 255, 255, 0)',
		backgroundColor: '#FFF',
		borderRightWidth: 1,
		borderBottomWidth: 1,
		borderRadius: 10,
		justifyContent: 'center',
		paddingVertical: width(7),
		alignItems: 'center'
	},
	messageButton: {
		flex: 0.5,
		borderRadius: 10,
		margin: 5,
		borderColor: 'rgba(255, 255, 255, 0)',
		backgroundColor: '#FFF',
		borderRightWidth: 1,
		borderBottomWidth: 1,
		justifyContent: 'center',
		paddingVertical: width(7),
		alignItems: 'center'
	},
	btnCenter: {

	},
	btnIcon: {
		width: width(14),
		height: width(14),
		marginBottom: width(.2)
	},
	btnText: {
		color: '#555A62',
		fontSize: width(3.3)
	},
	sBtn: {
		margin: 5,
		flex: 0.5,
		borderRadius: 10,
		backgroundColor: '#FFF',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: width(7)
	},
	sBtnBorder: {
		borderBottomWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0)'
	}
})
