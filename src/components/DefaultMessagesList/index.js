import React, { Component } from 'react';
import { Text, View, StyleSheet, FlatList, Platform  } from 'react-native'


import { width, height, isIphoneX } from 'constants/config'

import DefaultMessageItem from './DefaultMessageItem'

export default class DefaultMessagesList extends Component {

  _keyExtractor = (item, index) => 'defaultMessageItem_' + index;

  renderItem = ({ item, index }) => {
    const { onPressItem, type } = this.props

    return (
      <DefaultMessageItem
        item={item}
        idx={index}
        type={type}
        onPress={onPressItem}
        />
    )
  }

  renderHeader = ({item, index}) => {

    const { headerText, headerText1 } = this.props

    return <View style={styles.messageHeader}>
      <Text style={styles.headerText}>{headerText}</Text>
      {
        headerText1
        ? <Text style={styles.headerText1}>{headerText1}</Text>
        : null
      }
  </View>

  };


  render() {
    const { data, extraData, onPressItems } = this.props

    return (
      <View style={styles.wrapper}>

        <FlatList
          ListHeaderComponent={this.renderHeader}
          stickyHeaderIndices={[ 0 ]}
          data={data}
          showsVerticalScrollIndicator={true}
          extraData={extraData}
          keyExtractor={this._keyExtractor}
          contentContainerStyle={styles.contentContainerStyle}
          renderItem={this.renderItem}/>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    // flex: 1
  },
  messageHeader: {
    paddingVertical: width(3),
    backgroundColor: '#FFF'
  },
  headerText: {
    fontSize: width(3.0),
  },
  headerText1: {
    fontSize: width(3.0),
    marginTop: 5
  },
  contentContainerStyle: {
    paddingBottom: Platform.OS == 'ios'
      ? isIphoneX()
          ? width(0)
          : width(20)
      : width(20)
  }
})
