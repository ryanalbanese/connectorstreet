import { NavigationActions } from 'react-navigation';
import {AsyncStorage} from 'react-native';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      type: "Navigate",
      routeName: routeName,
      params: params
    })
  )
}

// add other navigation functions that you need and export them

export default {
  navigate,
  setTopLevelNavigator,
};
