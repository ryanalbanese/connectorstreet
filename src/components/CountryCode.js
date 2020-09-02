import React, { Component } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Keyboard, Platform, RefreshControl,ActivityIndicator, Alert, ScrollView } from 'react-native'
import { connect } from 'react-redux'
import { NavigationActions, Navigation } from 'react-navigation';
import { width, height, iconImages, alphabet, imageInBase64 } from 'constants/config'

import Contacts from 'react-native-contacts'
import { checkNextProps, fullCleanPhone, cleanPhoneNumb } from 'utils'
import NavBar from 'components/NavBar'
import SearchInput from 'components/SearchInput'
import RoundInput from 'components/RoundInput'
import CountryCodes from 'components/CountryCodes'
import HintModal from 'components/HintModal'
import RoundedBtn from 'components/RoundedBtn'
import * as ApiUtils from 'actions/utils'
function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}
@connect(
  state => ({
    countryCodes: state.countryCodes,
  })
)

export default class CountryCode extends Component {
  constructor(props) {
    super(props);

    const fields = {
      search: ''
    }

    this.state = {
      fields,
      value : 'US(+1)',
    }
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  _keyboardDidShow = () => {
    this.setState({keyboardIsOpened: true})
  }

  _keyboardDidHide = () => {
    this.setState({keyboardIsOpened: false})
  }

  onFieldChange = (fieldName, value) => {
    let newStateFields = this.state.fields
    newStateFields[fieldName] = value
    this.setState({fields: newStateFields})
  }

  close = () => {
    const { NavigationActions, navigation } = this.props
    const fromScreen = navigation.state && navigation.state.params && navigation.state.params.fromScreen
    let fromScreenString = fromScreen.toString()

    navigation.navigate(fromScreenString)

  }
  onListItemPress = (item) => {
    const { NavigationActions, navigation } = this.props
    const fromScreen = navigation.state && navigation.state.params && navigation.state.params.fromScreen
    let fromScreenString = fromScreen.toString()
    navigation.navigate(fromScreenString, {countryCode: item.countryCode})
  }

  componentWillMount(){

  }

  render() {

    const { navigation, countryCodes} = this.props

    const { fields } = this.state

    const { search, value } = fields

    const navBarProps = {
      leftPart: {
        image: iconImages.navBarCrossIconWhite,
        action: () => this.close()
      },
      centerPart: {
        text: 'Select a Country'
      }
    }

    const listProps = {
      rowProps: {
        onItemPress: this.onListItemPress
      }
    }

    const pickerData = countryCodes && countryCodes.response

    const CountryData = pickerData && pickerData.filter(item => (item.name +''+item.countryCode).toLowerCase().indexOf(search.trim().toLowerCase()) != -1)

    return (
      <View style={styles.wrapper}>
        <NavBar {...navBarProps} navigation={navigation} />
        <KeyboardAvoidingView style={{flex: 1}}
         keyboardShouldPersistTaps={"handled"} keyboardVerticalOffset={24} behavior={'padding'} enabled={false}>
          <View style={styles.content}>
            <View style={{}}>

              <View style={styles.searchWrapper}>
                <SearchInput
                  placeholder="Search for a country..."
                  placeholderTextColor="#5C5C5C"
                  value={search}
                  onFocus={() => this.setState({
                    searchFocused: true
                  }) }
                  onBlur={() => this.setState({
                    searchFocused: false
                  }) }
                  onChangeText={text => this.onFieldChange('search', text)}
                  returnKeyType="done"
                  onChangeText={text => this.onFieldChange('search', text)} />
              </View>

            </View>
            <View style={styles.listPart}>
              <CountryCodes
              value={value}
              {...listProps}
               data={CountryData}
               keyboardShouldPersistTaps={"handled"}/>
            </View>

          </View>
        </KeyboardAvoidingView>

      </View>
    );
  }

}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  refreshWrapper: {
    height: 27
  },
  refreshText:{
    color: '#4D5150',
    paddingTop: 18,
    fontSize: 12,
  },
  loadingIndicator: {
    paddingTop: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
  },

  searchWrapper: {
    marginTop: width(6),
    marginHorizontal: width(4)
  },
  hintText: {
    marginTop: width(6),
    marginBottom: width(3),
    fontSize: width(3.8),
    color: '#9F9F9F'
  },
  customContactWrapper: {
    marginBottom: width(3),
    width: width(100),
    paddingHorizontal: width(2),
    height: width(14)
  },
  listPart: {
    flex: 1,
    marginTop: width(6),
  },
  bottomPartWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    backgroundColor: '#fff',
    width: width(100),
    paddingHorizontal: width(4),
    alignItems: 'center'
  }
})
