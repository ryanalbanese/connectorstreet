import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, SectionList, Text, Image, TouchableOpacity } from 'react-native'
import SectionListContacts from 'react-native-sectionlist-contacts'

import { width, height, iconImages, alphabet } from 'constants/config'

import SectionTitle from './SectionTitle'
import ListRow from './ListRow'

export default class ContactList extends Component {

  headerStyle = function(options) {
    const {header} = this.props
     return {
       paddingBottom: 10,
       paddingTop: 10,
       backgroundColor
       :
       header
       ? '#FFFFFF'
       : '#F3F3F3'
     }
   }

  render() {

    const { wrapperStyle, sectionListStyle, rowProps, sectionProps, header } = this.props
    
    return (
      <View style={styles.wrapper}>
              {
                header
              ? <View style={styles.header}><Text style={styles.headerText}>{header.text}</Text></View>
              : null
            }
               <SectionListContacts
                 keyboardShouldPersistTaps='always'
                 sectionHeaderHeight={40}
                 sectionHeaderTextStyle = {this.headerStyle()}
                 showAlphabet = {false}
                 enableClippedSubviews = {false}
                 ref={s=>this.sectionList=s}
                 sectionListData={this.props.data}
                 renderItem={this._renderItem}
                 scrollAnimation = {true}
                 initialNumToRender={1}
                 showsVerticalScrollIndicator={true}
                 otherAlphabet="Connector Street Friends"/>
           </View>
    )

  }
  _renderItem=(item,index,section)=>{

    const {rowProps} = this.props
    return <TouchableOpacity onPress={() => rowProps.onItemPress(item)}>
    <View style={styles.itemWrapper}>
      <View style={styles.inner}>
        <View style={styles.avatarImageWrapper}>
          <Image resizeMethod="scale" source={item.avatar && {uri: item.avatar} || iconImages.avatarPlaceholder} style={styles.avatarImage} />
        </View>
        <Text style={styles.nameText}>
          {item.fName}
        </Text>
        <Text style={styles.sNameText}>{item.sName}</Text>
        {
          item.isUser
          ? <Image
              style={styles.userBadge}
              source={iconImages.userBadge}
              resizeMode='contain'
          />
          : null
        }

      </View>

    </View>
    </TouchableOpacity>
  }

}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingBottom: 10,
    paddingTop: 10,
    backgroundColor: '#FFF',
  },
  text: {
    fontWeight: 'bold',
    marginLeft:width(5)
  },
  wrapper: {
    flex: 1,
  },
  header: {
    padding: 10,
    marginTop: 20,
    backgroundColor: '#F3F3F3'
  },
  headerText: {
    fontWeight: 'bold'
  },
  itemWrapper: {
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
  userBadge: {
    position: 'absolute',
    right: 1,
    height: 25,
    width: 25,
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
