import React, { Component } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native'
import Swipeout from 'react-native-swipeout'
import { width, height, iconImages } from 'constants/config'

export default class DefaultMessageItem extends Component {
  render() {
    const { item, onPress, idx, type } = this.props

    let swipeoutBtns = []

    if (type === 'customMessage'){

      swipeoutBtns = [
        //{
          //text: 'Hide',
          //backgroundColor: '#585BD3',
          //onPress: 'onHide'
        //}
      ]

    }

    else {
      swipeoutBtns = [

      ]
    }


    return (
      <View style={styles.wrapper}>
      <Swipeout autoClose={true}
        backgroundColor= 'transparent'
        right={swipeoutBtns}>
        <TouchableOpacity onPress={() => onPress(item, idx)}>
          <View style={styles.inner}>
            <View style={styles.messageTextWrapper}>
              <Text style={styles.messageText}>
                {item}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        </Swipeout>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: width(1.2)
  },
  inner: {
    overflow: 'hidden',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F5F6FB',
    borderRadius: width(3),
    width: '100%',

  },
  iconImageWrapper: {
    height: width(4),
    width: width(4),
    marginTop: width(2),
    marginRight: width(3)
  },
  iconImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain'
  },
  messageTextWrapper: {
    flex: 1,
    flexShrink: 1,
  },
  messageText: {
    fontSize: width(3.1),
    color: '#6F6F6F',
    lineHeight: width(5.2)
  }
})
