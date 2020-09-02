import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Navigation, NavigationActions } from 'react-navigation';
import { width, height} from 'constants/config'

import Logo from './Logo';
import Background from './Background';


export default class Landing extends Component {
	constructor(props) {
		super(props);

		this.state = {}
	}

	_registerPress = () => {

    const { navigation } = this.props

    navigation.navigate('SignUpStack')

	}

	_loginPress = () => {

    const {navigation} = this.props

    navigation.navigate('LoginScreen')

  }

	render() {
		const { fields, isLoading } = this.state

		return (
			<View style={styles.wrapper}>
				<Background />
				<Logo/>
        <View style={styles.buttonsWrapper}>
          <TouchableOpacity style={styles.getStartedButton} onPress={() => this._registerPress()}>
              <Text style={styles.getStartedButtonText}>GET STARTED</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginButton} onPress={() => this._loginPress()}>
              <Text style={styles.loginButtonText}>LOG IN</Text>
          </TouchableOpacity>
        </View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
  getStartedButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    paddingVertical: 15,
    borderRadius: 40,
    backgroundColor: '#FFF',
    marginBottom: 15
  },
  getStartedButtonText: {
    color: '#207295',
    fontSize: width(3)
  },
  loginButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    paddingVertical: 15,
    borderRadius: 40,
    backgroundColor: '#207295'
  },
  loginButtonText: {
    color: 'white',
    fontSize: width(3)
  },
  buttonsWrapper: {
     width: '100%',
     height: 150,
     justifyContent: 'center',
     alignItems: 'center',
     position: 'absolute',
     bottom: 0
},
	wrapper: {
    flex: 1,
		backgroundColor: 'rgba(80, 210, 194, 0.95)',
		height: height(110),
		width: width(100)
	}
})
