import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, SectionList, Text, TouchableOpacity, Image } from 'react-native'

import SectionListContacts from 'react-native-tag-contacts'

import { width, height, iconImages, alphabet } from 'constants/config'

import SectionTitle from './SectionTitle'
import ListRow from './ListRow'

export default class CountryCodes extends Component {


  render() {

    const { wrapperStyle, sectionListStyle, rowProps, sectionProps } = this.props

    return (
      <View style={styles.wrapper}>
               <SectionListContacts
                  sectionHeaderTextStyle = {styles.sectionHeader}
                  showAlphabet = {false}
                  enableClippedSubviews = {true}
                   ref={s=>this.sectionList=s}
                   sectionListData={this.props.data}
                   renderItem={this._renderItem}
                   scrollAnimation = {true}
                   initialNumToRender={0}
                   showsVerticalScrollIndicator={true}
                   SectionListClickCallback={(item,index)=>{

                   }}
                   otherAlphabet="#"
               />
           </View>
    );
  }
  _renderItem=(item,index,section)=>{
    const {rowProps} = this.props

    return <TouchableOpacity onPress={() => rowProps.onItemPress(item)}>
    <View style={styles.itemWrapper}>
      <View style={styles.inner}>
      <View style={styles.avatarImageWrapper}>
        <Image resizeMethod="scale" source={iconImages.countryIcon} style={styles.avatarImage} />
      </View>
        <Text style={styles.nameText}>
          {item.name}
        </Text>
        <Text style={styles.ccText}>
          {item.countryCode}
        </Text>
      </View>
    </View>
    </TouchableOpacity>
  }
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingBottom: 20,
    paddingTop: 5,
    backgroundColor: '#F3F3F3',


  },
  text: {
    fontWeight: 'bold',
    marginLeft:width(5)
  },
  wrapper: {
    flex: 1
  },
  itemWrapper: {
    borderBottomWidth: 1,
    borderColor: "#E1E6EE",
    paddingVertical: width(2.8),
    paddingHorizontal: width(3.8),
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
    marginLeft: width(2)
  },
  ccText: {
    fontSize: width(3.6),
    marginLeft: width(1),
    opacity: .3
  },
  avatarImageWrapper: {
    width: 15,
    height: 15,
    resizeMode: "cover"
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  sectionList: {
    backgroundColor: 'transparent',
    paddingRight: width(2),
    zIndex: 600,
    top: width(0),
    bottom: width(0),
    marginTop: width(0),
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
})
