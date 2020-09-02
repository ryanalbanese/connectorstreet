import React, { PureComponent } from 'react';
import { View, StyleSheet, Image } from 'react-native';

import { width, height, iconImages } from 'constants/config'

export default class extends PureComponent {
	render() {
		return (
			<View style={styles.imageWrapper}>
				<Image style={styles.image} source={iconImages.homeBg} />
			</View>
		);
	}
}


const styles = StyleSheet.create({
	imageWrapper: {
		backgroundColor: '#52C2E6',
		height: height(100),
		width: width(100),
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	},
	image: {
		height: '100%',
		width: '100%',
		resizeMode: 'cover'
	}
})
