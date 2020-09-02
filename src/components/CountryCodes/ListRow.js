import React, { Component, PureComponent } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native'

import { width, height, iconImages } from 'constants/config'

export default class ListRow extends PureComponent {
  render() {
    const { onItemPress, item, sectionId, idx } = this.props
    const { avatar, fName, sName, phone } = item
    let urlKey = new Date().getTime()
    return (
      <TouchableOpacity onPress={
        onItemPress
          ? () => onItemPress(item, sectionId, idx)
          : null
        }>
        <View style={styles.wrapper}>
          <View style={styles.inner}>
            <View style={styles.avatarImageWrapper}>
              <Image resizeMethod="scale" key={urlKey} source={avatar && {uri: avatar} || iconImages.avatarPlaceholder} style={styles.avatarImage} />
            </View>
            <Text style={styles.nameText}>
              {fName}
            </Text>
            <Text style={styles.sNameText}>{sName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    borderColor: "#E1E6EE",
    paddingVertical: width(1.8),
    paddingHorizontal: width(7.8),
    backgroundColor: 'white',
    width: '100%'
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  nameText: {
    fontSize: width(3.6),
    marginLeft: width(4)
  },
  sNameText: {
    fontSize: width(3.6),
    marginLeft: width(1),
    fontWeight: 'bold'
  },
  avatarImageWrapper: {
    height: width(8),
    width: width(8),
    borderRadius: width(8),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    height: '120%',
    width: '120%',
    resizeMode: 'cover',
  },
})
