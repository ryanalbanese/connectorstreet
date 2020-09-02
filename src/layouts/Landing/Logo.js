import React from 'react';
import { View, Image, Text, Platform } from 'react-native';

import { width, height, iconImages, isIphoneX } from 'constants/config'

export default (props) => {
    return (
        <View style={{
            marginTop: height(40),
            marginBottom:
                  isIphoneX()
                  ? width(8)
                  : width(8)
            }}>
            <Image
                style={{ width: width(65), alignSelf: 'center',  }}
                source={iconImages.logoTagline}
                resizeMode='contain'
            />
        </View>

    );
}
