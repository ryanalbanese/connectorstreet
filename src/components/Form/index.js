import React, { PureComponent } from 'react';
import { View, StyleSheet, Text, Image, TextInput, Platform, TouchableOpacity } from 'react-native';

import { width, height, isIphoneX, iconImages} from 'constants/config';

export default class extends PureComponent {
	render() {
		const { containerStyle, icon, secure, value, onChangeText, refName, returnKeyLabel, password, onEyePress } = this.props
		return (
			<View style={[styles.wrapper, containerStyle && containerStyle]}>
				<Image style={styles.image}
					source={icon}
					resizeMode='contain'/>
				<TextInput
					{...this.props}
					style={styles.input}
					ref={comp => refName && refName(comp)}
					value={value}
					returnKeyLabel={returnKeyLabel}
					underlineColorAndroid='rgba(0,0,0,0)'
					placeholderTextColor='white'
					onChangeText={onChangeText}
					secureTextEntry={secure}/>
					{
						password
						? secure
							? <TouchableOpacity onPress={onEyePress}>
									<Image
									style={styles.passwordImage}
									source={iconImages.notVisibleIcon}
									resizeMode='contain'/>
								</TouchableOpacity>
							: <TouchableOpacity onPress={onEyePress}>
									<Image
									style={styles.passwordImage}
									source={iconImages.visibleIcon}
									resizeMode='contain'/>
								</TouchableOpacity>
						: null
					}

			</View>
		)
	}
}

const styles = StyleSheet.create({
	wrapper: {
		borderBottomWidth: 1,
		flex: 1,
		flexDirection: 'row',
		borderColor: 'rgba(255,255,255,0.7)',
		alignItems: 'center',

		paddingHorizontal: Platform.OS == 'ios'
			? isIphoneX()
				? width(4)
				: width(3)
			: width(2)
	},
	image: {
		width: isIphoneX()
			?	width(6)
			: width(5),
		height: isIphoneX()
			?	width(6)
			: width(5),
		marginLeft: width(4)
	},
	passwordImage: {
		width: isIphoneX()
			?	width(8)
			: width(6),
		height: isIphoneX()
			?	width(8)
			: width(6),
		marginRight: width(4)
	},
	input: {
		flex: 1,
		height: 90,
		color: 'white',
		fontSize: Platform.OS == 'ios'
			?	isIphoneX()
				? width(4.6)
				: width(4)
			: width(4.4),
		marginLeft: width(4),
		paddingRight: width(2.4)
	}
})
