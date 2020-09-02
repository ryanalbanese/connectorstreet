import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Dimensions } from 'react-native'
import { Icon } from 'react-native-elements'
import FastImage from 'react-native-fast-image'

import { width, height, iconImages, isIphoneX, isIphoneMax } from 'constants/config'

export default class Avatar extends Component {
	render() {
		const { source, notificationsAmount, onPress } = this.props

		return (
			<TouchableOpacity onPress={onPress} style={ { } }>
				<View style={styles.wrapper}>
					<View style={styles.imageWrapper}>
						<Image
							style={styles.image}
							source={source && {
								uri: source
							} || iconImages.avatarPlaceholder}
							resizeMode={FastImage.resizeMode.cover}/>
					</View>
					{
						notificationsAmount
							? null
							: null
					}
				</View>
			</TouchableOpacity>
		);
	}
}

// <Image style={styles.image} source={source && {uri: source} || iconImages.avatarPlaceholder}/>

const styles = StyleSheet.create({
	wrapper: {
		position: 'relative',
		width: isIphoneX()
			?	width(46)
			: width(28),
		height: isIphoneX()
			?	width(46)
			: width(28),
		justifyContent: 'center',
		alignSelf: 'center',
		...Platform.select({
      android: {
				width: width(38),
				height: width(38),
				marginTop: width(15),
      },
      ios: {
				marginTop: isIphoneX()
					?	width(12)
					: isIphoneMax()
						? width(14)
						: Platform.isPad
							? width(3)
							: width(14),
      }
    }),

	},
	counter: {
		width: isIphoneX()
			?	width(10)
			: width(8),
		height: isIphoneX()
			?	width(10)
			: width(8),
		borderWidth: 1,
		borderColor: 'red',
		backgroundColor: 'white',
		borderRadius: 100,
		position: 'absolute',
		...Platform.select({
      android: {

				top: width(1),
				right: 0
      },
      ios: {
				top: isIphoneX()
					?	width(3)
					: width(-3),
				right: isIphoneX()
					?	width(5)
					: -5,
      }
    }),
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 6,
		paddingBottom: 4
	},
	imageWrapper: {
		borderColor: 'rgba(255, 255, 255, 1)',
		borderWidth: 2,
		elevation: 0,
		...Platform.select({
      android: {
				width: width(38),
				height: width(38),
				borderRadius: width(28),
				overflow: 'hidden'
      },
      ios: {
				marginLeft: isIphoneX()
					?	width(5)
					: Platform.isPad
						? width(4)
						: width(-5),
				height: isIphoneX()
					?	width(37)
					: Platform.isPad
						? width(20)
						: width(37),
				width: isIphoneX()
					?	width(37)
					: Platform.isPad
						? width(20)
						: width(37),
				borderRadius: width(37),
      }
    }),
		overflow: 'hidden'
	},
	image: {
		height: '100%',
		width: '100%',
		resizeMode: 'cover'
	}
})
