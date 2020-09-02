import React, { Component } from 'react';
import { StyleSheet, ScrollView } from 'react-native'
import { ButtonGroup } from 'react-native-elements';

export default class ButtonGroupNav extends Component {

  render() {

    const { buttons, buttonStyle, onPress, selectedIndex } = this.props
    return (
        <ButtonGroup
          onPress={onPress}
          textStyle={styles.textStyle}
          buttonStyle={[styles.buttonStyle, buttonStyle]}
          innerBorderStyle={styles.innerBorderStyle}
          containerStyle={styles.containerStyle}
          selectedButtonStyle={styles.selectedButtonStyle}
          selectedIndex={selectedIndex}
          buttons={buttons}
        />
    );
  }
}

const styles = StyleSheet.create({

  // Button Group Styles

  textStyle: {
    paddingTop: 1,
    color: '#C1BBC7',
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: 'bold'
  },
  buttonStyle: {
    minWidth: 120,
    borderColor: '#FFF'
  },
  innerBorderStyle: {
    color: "#FFF"
  },

  selectedButtonStyle: {
    backgroundColor: '#51D1CC',
    borderRadius: 25
  },

  // Scroll View Styles

  containerStyle: {
    marginTop: 20,
    marginLeft: 0,
    marginRight: 0,
    paddingRight: 30,
    paddingLeft: 30,
    padding: 0,
    height: 35,
    borderColor: '#FFF'
  },
  contentContainerStyle: {
    paddingLeft: 30,
    height: 30,
  },
  contentInset: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 30
  },
  scrollContainer: {
    height: 30,
    width: '100%'
  }
})
