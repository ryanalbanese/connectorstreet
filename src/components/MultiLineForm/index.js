import React, { Component } from 'react';
import { View, Text, Image, TextInput, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';

import { width, height, iconImages, isIphoneX } from 'constants/config';

export default class MultiLineForm extends Component {
    render() {
        const { inputFocus, value, icon, onPress, title, subtitle, refName, secure, containerStyle, password, onEyePress } = this.props
        return (
            <View
                style={[{
                    borderBottomWidth: 1,
                    flexDirection: 'row',
                    borderColor: '#D8D8D8',
                    alignItems: 'center',
                    height: width(23),
                    paddingRight: 35,
                    paddingVertical: inputFocus || value
                        ? width(2)
                        : width(1.2)
                }, containerStyle]}
            >
                <Image
                    style={{
                        width: width(5),
                        height: width(5),
                        marginLeft: width(7)
                    }}
                    source={icon}
                    resizeMode='contain'
                />
                <View style={[{position: (inputFocus || value) ? 'absolute' : 'relative', top: (inputFocus || value) ? -999999 : 0}]}>
                    <TouchableWithoutFeedback
                        onPress={onPress}>
                        <View
                            style={{ paddingLeft: width(1), height: width(15.8), justifyContent: 'center' }}
                        >
                        <Text
                            style={{ color: 'white', fontSize: width(4), marginLeft: width(4)}}
                        >{title}</Text>
                        <Text
                            style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: width(3.2), marginLeft: width(4)}}
                        >{subtitle} </Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            <TextInput
                {...this.props}
                ref={comp => refName && refName(comp)}
                style={[{
                    flex:1,
                    color: 'white',
                    fontSize: width(4),
                    marginLeft: width(4)
                }, !inputFocus && !value && {position: 'absolute', top: -9999999}]}
                underlineColorAndroid='rgba(0,0,0,0)'
                placeholderTextColor='white'
                secureTextEntry={secure}
                />
                {
      						password
      						? secure
      							? <TouchableOpacity onPress={onEyePress}>
      									<Image
      									style={{
                      		width: isIphoneX()
                      			?	width(8)
                      			: width(6),
                      		height: isIphoneX()
                      			?	width(8)
                      			: width(6),
                      		marginLeft: (inputFocus || value) ? 0 : 50,
                      	}}
      									source={iconImages.notVisibleIcon}
      									resizeMode='contain'/>
      								</TouchableOpacity>
      							: <TouchableOpacity onPress={onEyePress}>
      									<Image
                        style={{
                      		width: isIphoneX()
                      			?	width(8)
                      			: width(6),
                      		height: isIphoneX()
                      			?	width(8)
                      			: width(6),
                      		marginRight: width(0)
                      	}}
      									source={iconImages.visibleIcon}
      									resizeMode='contain'/>
      								</TouchableOpacity>
      						: null
      					}
                </View>
        );
    }
}
