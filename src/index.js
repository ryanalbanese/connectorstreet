
import React, { Component } from 'react'
import { Platform, AppState, Text, Alert, TextInput} from 'react-native'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/lib/integration/react'
import {setJSExceptionHandler, setNativeExceptionHandler, exceptionhandler, forceAppQuit, executeDefaultHandler} from 'react-native-exception-handler';

import NavigationService from 'utils/NavigationService.js';
import Store, {persistor} from 'api/ReduxStore'
import AppWithNavigationState from 'api/AppNavigator'
import { baseUrl, onesignalAppId } from 'constants/config'
import axios from "axios";

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = Text.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

export let navigatorRef;

export default class ConnectorStreet extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    return (
      <PersistGate persistor={persistor}>
        <Provider store={store}>
        <AppWithNavigationState ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}/>
        </Provider>
      </PersistGate>
    );
  }
}
