import React, { Component } from 'react';
import { View, StyleSheet, Image } from 'react-native'
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
    let phone = props.value
    let phoneArr = props.value && props.value.split(' ')
    const country = phoneArr && phoneArr.splice(0, 1)[0]
    return ({
      phone: phone || ''
    })
  }

  componentWillReceiveProps(nextProps){
		if (this.props.value != nextProps.value) {
      this.setState({
        fields: this.getFieldsStateFormProps(nextProps)
      })
    }
	}

  onFieldChange = (fieldName, value) => {

    let newStateFields = this.state.fields

    newStateFields[fieldName] = value

    this.setState({ fields: newStateFields }, () => {

      const { onChangeText } = this.props

      const { fields } = this.state

      const { phone } = fields

      onChangeText((phone || ''))

    })

  }

  render() {

    const { fields } = this.state

    const { phoneProps, countryProps, countryCodes, wrapperStyle, icon, iconWrapperStyle, refName, phoneData} = this.props

    const { phone } = fields

    const phoneDataSet = phoneData && phoneData.map((item,index) =>({
      value: item.number,
      label: item.label + ' - '+ item.number
      }
    ))

    if (phoneData){
        phoneDataSet.unshift({
          value: 'custom',
          label: 'Select a mobile number'
        })
        phoneDataSet.push({
          value: 'customPhone',
          label: 'Add a mobile number'
        })
    }

    const findPhoneInData = phoneDataSet.find(item => item.value.indexOf(phone) != -1)


    const phoneInputContent = (
      <View>
        <StdInput
          placeholder={phoneProps.placeholder}
          placeholder="Country"
          value={findPhoneInData && findPhoneInData.value || 'custom'}
          type="picker"
          onSubmitEditing={value => this.onFieldChange('phone', value)}
          border="Right"
          data={phoneDataSet}
          customStyle={{borderBottomWidth: 0, borderWidth: 0, width: '100%'}}
          {...phoneProps}
          inputStyle={[{color: '#000000', fontSize: width(4.2), ...phoneProps.inputStyle}, icon && {backgroundColor: 'transparent'}]} />
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
                {phoneInputContent}
              </View>
              : phoneInputContent
        }

      </View>
    );
  }
}

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
