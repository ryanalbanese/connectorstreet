import React, { Component} from 'react';

import { View, Text, Image, Platform, TouchableNativeFeedback, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

import Background from '../Background';
import Logo from '../Logo';

import { width, height, iconImages } from 'constants/config'

export class Page1 extends Component {
    render () {
        return (
            <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: 'transparent' }}>
							<Background />
                <View>
									<View
										style={{
											alignSelf: 'center',
											flexDirection: 'row',
											marginTop: width(10),
											marginBottom: width(13)
										}}>
										<Icon
											name='circle'
											type='font-awesome'
											size={width(2.6)}
											color='white'/>
										<Icon
											name='circle-o'
											type='font-awesome'
											color='white'
											containerStyle={{
													marginHorizontal: width(3)
											}}
											size={width(2.6)}/>
										<Icon
											name='circle-o'
											type='font-awesome'
											color='white'
											size={width(2.6)}/>
									</View>
									<Logo />
                </View>
                <View
									style={{
										paddingHorizontal: width(14),
									}}>
									<View
										style={{
											flexDirection: 'row',
											justifyContent: 'center'
										}}>
                  <Image
                    style={{
                        width: width(18),
                        height: width(18),
                    }}
                    source={iconImages.handshakeIconWhite}
                    resizeMode='contain'/>
                  <Image
                    style={{
                      width: width(18),
                      height: width(18),
                    }}
                    source={iconImages.peopleIconWhite}
                    resizeMode='contain'/>
                  <Image
                    style={{
                      width: width(18),
                      height: width(18),
                    }}
                    source={iconImages.connectionIconWhite}
                    resizeMode='contain'/>
										</View>
										<View>
										<Text
											style={{
												fontSize: width(4.4),
												color: 'white',
												textAlign: 'center',
												width: width(80),
												alignSelf: 'center',
												marginTop: width(5)
											}}>
											Connect friends and colleagues in just a few clicks.
										</Text>
										</View>
                </View>


                <View style={styles.walkthroughWrapper}>
									<TouchableOpacity style={styles.walkthroughBtnWrapper} onPress={() => this.props.navigation.navigate('Main')}>
										<View style={styles.walkthroughInner}>
											<Text style={{ color: 'white', fontSize: width(3.6)}}>
												SKIP
											</Text>
										</View>
									</TouchableOpacity>
									<TouchableOpacity style={[styles.walkthroughBtnWrapper, {borderLeftWidth: 1, borderLeftColor: 'white'}]} onPress={() => this.props.navigation.navigate('Page2')}>
										<View style={styles.walkthroughInner}>
											<Text style={{ color: 'white', fontSize: width(3.6)}}>
												NEXT
											</Text>
										</View>
									</TouchableOpacity>
								</View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
	walkthroughWrapper: {
		width: width(100),
		height: width(14),
		flexDirection: 'row'
	},
	walkthroughBtnWrapper: {
		flex: 1
	},
	walkthroughInner: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: 'white',
		borderTopWidth: 1,
	}
})
