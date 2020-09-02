import React, { Component } from 'react';
import { View, TouchableOpacity, TouchableWithoutFeedback, Image, StyleSheet } from 'react-native';
import Overlay from 'react-native-modal-overlay';
import { Button, Text, Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

import { width, height, iconImages } from 'constants/config'

import Buttons from './Buttons';

export default class Modal extends Component {
	render() {
		const { visible, onBtnPress, closeOnTouchOutside } = this.props
		return (
			<Overlay visible={visible}
				closeOnTouchOutside={closeOnTouchOutside}
				onClose={() => onBtnPress('close')}
				animationType='slideInUp'
				containerStyle={{
						backgroundColor: 'rgba(37, 8, 10, 0.78)',
						justifyContent: 'center',
						alignItems: 'center'
				}}
				childrenWrapperStyle={{
						backgroundColor: '#FFFFFF',
						borderRadius: 10,
						height: width(120),
						width: width(81)
				}}
				animationDuration={10}            >
				<View style={styles.crossIconWrapper}>
				<TouchableOpacity onPress={() => onBtnPress('close')}>
					<View style={styles.crossIconInner}>
						<Image style={styles.crossIconImage} source={iconImages.crossIconImage} />
					</View>
				</TouchableOpacity>
				</View>
				<View
					style={{
							flex: 1,
							justifyContent: 'space-around'
					}}>
					<Text
						style={{
							marginTop: width(3.8),
							textAlign: 'center',
							fontSize: width(5),
							fontWeight: '400'
						}}>
						Why not add a profile picture?
					</Text>
					<TouchableOpacity onPress={() => onBtnPress('select')}>
						<Image
							source={iconImages.addPhotoIconGrey}
							style={{
									width: width(25),
									height: width(25),
									alignSelf: 'center'
							}}/>
					</TouchableOpacity>
					<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: width(3.8)}}>
						<TouchableOpacity
							onPress={() => onBtnPress('later')}
							activeOpacity={0.5}
							style={{
									width: '80%',
									height: width(11),
									justifyContent: 'center',
									alignItems: 'center',
									backgroundColor: 'rgba(190, 190, 190, 0.2)',
									borderWidth: 1,
									borderColor: 'rgba(190, 190, 190, 1)',
									borderRadius: 30,
							}}>
							<Text style={{ color: '#B5B3B3', fontSize: width(4) }}>
								Later
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Overlay>
		)
	}
}


const styles = StyleSheet.create({
		crossIconWrapper: {
		zIndex: 1,
		position: 'absolute',
		top: width(3),
		left: width(3),
		height: width(7),
		width: width(7),
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
	iconContainer: {
		position: 'absolute',
		top: 5,
		left: 5
	},
})
