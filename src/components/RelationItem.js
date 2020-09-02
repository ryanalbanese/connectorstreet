import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import Swipeout from 'react-native-swipeout'
import { width, height, iconImages } from 'constants/config'
import Sep from 'components/Sep'
import * as Models from 'models'

export default class RelationItem extends Component {


  renderAvatarsByType = (type) => {
    const { item } = this.props
    switch(type) {
      case 'onePerson':
        return (
          <View style={styles.avatarWrapper}>
            <Image resizeMethod="scale" source={item.avatar && {uri: item.avatar} || iconImages.avatarPlaceholder} style={styles.avatarImage} />
          </View>
        )
      case 'twoPersons':
        return (
          <View style={styles.avatarsWrapper}>
            <View style={styles.fAvatarWrapper}>
              <Image resizeMethod="scale" source={item.avatar1 && {uri: item.avatar1}  || iconImages.avatarPlaceholder} style={styles.avatarImage} />
            </View>
            <View style={styles.sAvatarWrapper}>
              <Image resizeMethod="scale" source={item.avatar2 && {uri: item.avatar2}  || iconImages.avatarPlaceholder} style={styles.avatarImage} />
            </View>
          </View>
        )
    }
  }

  render() {
    const { item, idx, onPress, type, onDelete, onHide, swipeoutMenu, isViewed } = this.props
    const { time, midnight, topText, relationType, text } = item

    let swipeoutBtns = []

      // Buttons

      swipeoutBtns = [
        {
          text: 'Archive',
          backgroundColor: '#585BD3',
          onPress: onHide
        }
      ]
    return (
      <Swipeout autoClose={true}
        backgroundColor= 'transparent'
        right={swipeoutBtns}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.itemWrapper}>
          <View style={
            isViewed
            ?  styles.itemInner
            :  styles.itemInnerNotif
            }
            >
            <View style={styles.row}>
            {
              isViewed
              ? <View style={styles.notificationWrapper}>
                <View style={styles.notificationIcon}></View>
                </View>
              : null
            }

              <View style={styles.timeWrapper}>
                <Text style={styles.hoursText}>
                  {time}
                </Text>
                <Text style={styles.mdText}>
                  {midnight}
                </Text>
              </View>
              <View style={styles.infoWrapper}>
                {this.renderAvatarsByType(type)}
                <View style={styles.textsWrapper}>
                  <Text style={styles.nameText}>
                    {topText}
                  </Text>
                  <Text style={styles.infoText} numberOfLines={1}>
                    {text}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.nextIconWrapper}>
              <View style={styles.nextIconInner}>
                <Image source={iconImages.connectItemArrowIconGrey} style={styles.nextIconImage} />
              </View>
            </View>
          </View>
          <View style={styles.sepWrapper}>
            <Sep />
          </View>
        </View>
      </TouchableOpacity>
      </Swipeout>
    );
  }
}

const styles = StyleSheet.create({
  itemWrapper: {
    width: width(100)
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemInner: {
    marginVertical: width(5),
    marginLeft: width(3),
    marginRight: width(6),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  itemInnerNotif: {
    marginVertical: width(5),
    marginLeft: width(8.5),
    marginRight: width(6),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  timeWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  hoursText: {
    fontSize: width(3),
    color: 'black',
    textAlign: 'center'
  },
  mdText: {
    fontSize: width(2.8),
    color: '#A2A2A5',
    textAlign: 'center'
  },
  infoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: width(4)
  },
  avatarsWrapper: {
    height: width(14),
    width: width(14),
  },
  fAvatarWrapper: {
    height: width(9),
    width: width(9),
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    borderRadius: width(9),
  },
  sAvatarWrapper: {
    height: width(9),
    width: width(9),
    position: 'absolute',
    bottom: 0,
    right: 0,
    overflow: 'hidden',
    borderRadius: width(9),
  },
  avatarImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover'
  },
  avatarWrapper: {
    height: width(11),
    width: width(11),
    overflow: 'hidden',
    borderRadius: width(11)
  },
  textsWrapper: {
    marginLeft: width(4),
    width: width(50)
  },
  nameText: {
    fontSize: width(4),
    color: 'black',
  },
  infoText: {
    fontSize: width(3.2),
    color: '#A2A2A5',
    marginTop: width(1)
  },
  nextIconWrapper: {
    height: '100%',
    width: width(4),
  },
  nextIconInner: {
    height: width(2.5),
    width: width(2.5),
    marginTop: width(4)
  },
  nextIconImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain'
  },
  sepWrapper: {
    width: width(90),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  notificationWrapper: {
    marginRight: width(3),
    width: width(2.5),
    height: width(2.5),
    borderRadius: width(5),
    backgroundColor: '#007AFE'
  }
})
