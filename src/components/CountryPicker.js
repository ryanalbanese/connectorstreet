import React, { Component } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native'
import { connect } from 'react-redux'

import { width, height, iconImages, isIphoneX } from 'constants/config'

import StdInput from './StdInput'

@connect(
  state => ({
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

    return ({
      country: props.value || 'US(+1)'
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
    const { phoneProps, countryProps, countryCodes, wrapperStyle, icon, iconWrapperStyle, refName} = this.props

    const { country, phone } = fields

    if (!(countryCodes && countryCodes.response && countryCodes.response.length)) return null

    const sotrtedCountryCodes = countryCodes && countryCodes.response.sort()
    const pickerData = sotrtedCountryCodes.map(item => (
      { value: item.match(/^(\S+)\s(.*)/).slice(1)[0].substring(0,2).trim(),
        label: item.match(/^(\S+)\s(.*)/).slice(1)[0],
        mask:  item.match(/^(\S+)\s(.*)/).slice(1)[1]
      }

    ))
    const findCountryInData = pickerData.find(dataItem => dataItem.value.indexOf(country.trim() || 'US(+1)') != -1)
    const defaultCountry = pickerData.find(dataItem => dataItem.value.indexOf('US(+1)') != -1)

    const countryInputContent = (
      <View style={[styles.countryFieldWrapper, countryProps.customFieldWrapper && countryProps.customFieldWrapper]}>
        <StdInput
          placeholder="Country"
          value={findCountryInData && findCountryInData.value.trim() || defaultCountry && defaultCountry.value.trim()}
          type="picker"
          onSubmitEditing={value => this.onFieldChange('country', value)}
          border="Right"
          data={pickerData}
          customStyle={{borderBottomWidth: 0, borderRightWidth: 0, borderWidth: 0, width: '100%'}}
          {...countryProps}
          inputStyle={[{color: '#FFFFFF', ...countryProps.inputStyle}, icon && {backgroundColor: 'transparent'}]} />
      </View>
    )

    return (
      <View style={[styles.wrapper, wrapperStyle && wrapperStyle]}>
        <View style={[styles.phoneFieldWrapper]}>
          <Text style={styles.labelText}>DEFAULT COUNTRY CODE</Text>
        </View>
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
  labelText:{
    fontSize: width(3.2),
    color: 'white',
    opacity: 0.9
  },
  countryFieldWrapper: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
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
