import React, { Component } from 'react';
import { View, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Image, StyleSheet, SectionList } from 'react-native';
import Overlay from 'react-native-modal-overlay';

import { Button, Text, Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

import { width, height, iconImages } from 'constants/config'


export default class ModalShowInfo extends Component {
	render() {
		const { closeOnTouchOutside, onBtnPress, visible, personKey, data } = this.props

		let renderData

		if (personKey === 'introducer'){
			renderData = [
				{title: 'First Name', data: [data.firstName]},
				{title: 'Last Name', data: [data.lastName]},
				{title: 'Phone Number', data: [data.user]},
				{title: 'Email Address', data: [data.email !=''? data.email :'N/A']}
			]
		}
		else if (personKey ==='fPerson' || personKey =='sPerson'){
			renderData = [
				{title: 'First Name', data: [data.fName]},
				{title: 'Last Name', data: [data.sName]},
				{title: 'Phone Number', data: [data.origPhone]},
				{title: 'Email Address', data: [data.email !=''? data.email :'N/A']}
			]
		}

		return (

			<Overlay visible={visible}
				closeOnTouchOutside={true}
				onClose={() => onBtnPress('close')}
				animationType='slideInUp'
				animationDuration={10}
				containerStyle={{
					backgroundColor: 'rgba(0, 0, 0, 0.92)',
					justifyContent: 'center',
					alignItems: 'center',
					flex: 1
				}}
				childrenWrapperStyle={{
					backgroundColor: 'rgba(37, 8, 10, 0.00)',
					borderRadius: 10,
					height: height(80),
					width: width(90),
					padding: 0
				}}>
				<ScrollView
					style={{
						flex: 1,
						width: '100%',

					}}>
				<View style={styles.crossIconWrapper}>
					<TouchableOpacity onPress={() => onBtnPress('close')}>
						<View style={styles.crossIconInner}>
							<Image style={styles.crossIconImage} source={iconImages.crossIconImageWhite} />
						</View>
					</TouchableOpacity>
				</View>


					<View style={styles.container}>
						{ data?
							<SectionList
			          sections={renderData}
			          renderItem={({item}) => <Text selectable style={styles.item}>{item}</Text>}
			          renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
			          keyExtractor={(item, index) => index}
			        />
						: null
					}

				</View>
				</ScrollView>
			</Overlay>
		)
	}
}

const styles = StyleSheet.create({

	container: {
	 flex: 1,
	 width: '100%',
	 marginTop: 70,
	 zIndex: 0,
	 justifyContent: 'space-around'
  },
  sectionHeader: {
		flex: 1,
    paddingTop:12,
    paddingLeft: 30,
    paddingRight: 10,
    paddingBottom: 12,
    fontSize: 16,
    fontWeight: 'bold',
		color: 'white',
    backgroundColor: 'rgba(247,247,247,0.0)',
  },
  item: {
		color: 'white',
		paddingTop:10,
    paddingLeft: 30,
    paddingRight: 10,
    paddingBottom: 12,
    fontSize: 14,
  },
	crossIconWrapper: {
		zIndex: 1,
		position: 'absolute',
		top: width(1),
		left: width(3),
		height: width(7),
		width: width(7),
	},
	crossIconInner: {
		height: width(7),
		width: width(7),
		padding: width(0.4)
	},
	crossIconImage: {
		height: '100%',
		width: '100%',
		resizeMode: 'contain',
	}
})
