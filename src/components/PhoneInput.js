import React, { Component } from 'react';
import { View, StyleSheet, Image } from 'react-native'
import { connect } from 'react-redux'

import { width, height, iconImages, isIphoneX } from 'constants/config'

import StdInput from './StdInput'

@connect(
  state => ({
    userData: state.userData,
    countryCodes: state.countryCodes,
  }),
)
export default class PhoneInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: this.getFieldsStateFormProps(props),
    }

  }


  getFieldsStateFormProps = (props) => {
    const {userData, countryCodes} = this.props
    if (!(countryCodes && countryCodes.response && countryCodes.response.length)) return null

    const sotrtedCountryCodes = countryCodes && countryCodes.response.sort()

    const pickerData = sotrtedCountryCodes.map(item => (
      { value: item.match(/^(\S+)\s(.*)/).slice(1)[0],
        label: item.match(/^(\S+)\s(.*)/).slice(1)[0],
        mask: item.match(/^(\S+)\s(.*)/).slice(1)[1]
      }
    ))

    const regexp = new RegExp(userData && userData.settings && userData.settings.isocode || 'US', 'i');

    const defaultCountry = pickerData.filter(x => regexp.test(x.value))

    let phoneArr = props.value && props.value.split(' ')
    const country = phoneArr && phoneArr.splice(0, 1)[0]
    return ({
      country: country || defaultCountry[0] && defaultCountry[0].value || 'US(+1)',
      phone: phoneArr && phoneArr.join(' ') || ''
    })

  }

  componentWillReceiveProps(nextProps){

      const state = this.state
		if (this.props.value != nextProps.value) {
      this.setState({
        fields: this.getFieldsStateFormProps(nextProps)
      })
    }
	}

  onFieldChange = (fieldName, value, isocode) => {

    let newStateFields = this.state.fields
    newStateFields[fieldName] = value

    this.setState({ fields: newStateFields }, () => {
      const { onChangeText } = this.props
      const { fields } = this.state
      const { country, phone, isocode } = fields
      const countryArr = country.split('(')
      if (value !=''){
        onChangeText((country || '') + ' ' + (phone || ''), isocode)

      }

    })
  }

  render() {

    const { fields } = this.state
    const { phoneProps, countryProps, countryCodes, wrapperStyle, icon, iconWrapperStyle, refName, placeholderTextColor, userData} = this.props

    const { country, phone } = fields

    if (!(countryCodes && countryCodes.response && countryCodes.response.length)) return null

    const sotrtedCountryCodes = countryCodes && countryCodes.response.sort()

    const pickerData = sotrtedCountryCodes.map(item => (
      { value: item.match(/^(\S+)\s(.*)/).slice(1)[0],
        label: item.match(/^(\S+)\s(.*)/).slice(1)[0],
        mask: item.match(/^(\S+)\s(.*)/).slice(1)[1]
      }
    ))

    const regexp = new RegExp(userData && userData.settings && userData.settings.isocode, 'i');

    const findCountryInData = pickerData.find(dataItem => dataItem.value.indexOf(country) != -1)

    const defaultCountry = pickerData.filter(x => regexp.test(x.value))

    let mask;
    if (findCountryInData && findCountryInData.mask != 'null'){
      mask = findCountryInData.mask
    }
    else {
      mask = '999999999999999999999999999999'
    }
    const countryInputContent = (
      <View style={[styles.countryFieldWrapper, countryProps.customFieldWrapper && countryProps.customFieldWrapper]}>
        <StdInput
          placeholderTextColor={placeholderTextColor}
          placeholder="Country"
          value={findCountryInData && findCountryInData.value || defaultCountry[0] && defaultCountry[0].value}
          type="picker"
          onSubmitEditing={value => this.onFieldChange('country', value)}
          border="Right"
          data={pickerData}
          customStyle={{borderBottomWidth: 0, borderWidth: 0, width: '100%'}}
          {...countryProps}
          inputStyle={[{color: '#78787D', ...countryProps.inputStyle}, icon && {backgroundColor: 'transparent'}]} />
      </View>
    )

    return (
      <View style={[styles.wrapper, wrapperStyle && wrapperStyle]}>
        {
          icon
            ? <View style={styles.iconInputWrapper}>
                {
                  icon
                    ? <View style={[styles.phoneIconImageWrapper, iconWrapperStyle]}>
                        <Image style={styles.phoneIconImage} source={icon} />
                      </View>
                  : null
                }
                {countryInputContent}
              </View>
              : countryInputContent
        }
        <View style={[styles.phoneFieldWrapper, phoneProps.customFieldWrapper && phoneProps.customFieldWrapper]}>
          <StdInput
            placeholderTextColor={placeholderTextColor}
            refName={comp => refName && refName(comp && comp.input || comp)}
            placeholder={phoneProps.placeholder}
            value={phone}
            isocode={country}
            clearButtonMode='always'
            keyboardType="phone-pad"
            returnKeyType={ 'done' }
            dataDetectorTypes={'phoneNumber'}
            mask={mask}
            onChangeText={text => this.onFieldChange('phone', text, country)}
            {...phoneProps}
             />
        </View>
      </View>
    );
  }
}

//{
//   icon
//     ? <View style={styles.iconInputWrapper}>
//         {
//           icon
//             ? <View style={[styles.phoneIconImageWrapper, iconWrapperStyle]}>
//                 <Image style={styles.phoneIconImage} source={icon} />
//               </View>
//           : null
//         }
//         {countryInputContent}
//         <View style={styles.arrowDownIconWrapper}>
//           <Image style={styles.arrowDownIconImage} source={iconImages.arrowDownIconGrey} />
//         </View>
//       </View>
//       : countryInputContent
// }

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  countryFieldWrapper: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',

  },
  phoneIconImageWrapper: {
    height: width(5),
    width: width(5)
  },
  phoneIconImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain'
  },
  phoneFieldWrapper: {
    flex: 5
  },
  iconInputWrapper: {
    flexDirection: 'row',
    flex:3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrowDownIconWrapper: {
    height: width(2),
    width: width(3),
    position: 'absolute',
    right: width(3),
    top: width(6)
  },
  arrowDownIconImage: {
    height: '100%',
    width: '100%'
  }
})
