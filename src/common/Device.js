import {Dimensions, Platform} from 'react-native';

const dimen = Dimensions.get('window');

const isIphoneX =
Platform.OS === 'ios' &&
!Platform.isPad &&
!Platform.isTVOS &&
((dimen.height === 812 || dimen.width === 812)))

export default {
  isIphoneX,
  ToolbarHeight: isIphoneX ? 35 : 0
}
