import React, { PureComponent } from 'react';
import { View, Text, NetInfo, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
import { isIphoneX, isIphoneMax } from '../constants/config'
function MiniOfflineSign() {
  return (
    <View style={styles.offlineContainer}>
      <Text style={styles.offlineText}>No Internet Connection</Text>
    </View>
  );
}

class OfflineNotice extends PureComponent {
  state = {
    isConnected: true
  };

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  }

  componentWillUnmount() {
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
  }

  handleConnectivityChange = isConnected => {
    
    if (isConnected) {
      this.setState({ isConnected });
    } else {
      this.setState({ isConnected });
    }
  };

  render() {
    if (!this.state.isConnected) {
      return <MiniOfflineSign />;
    }
    return null;
  }
}

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#FF4D4D',
    height: isIphoneX() || isIphoneMax()
      ? 80
      : 50,
    paddingTop: isIphoneX() || isIphoneMax()
      ? 30
      : 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  offlineText: {
  fontSize: isIphoneX() || isIphoneMax()
    ? 14
    : 11,
  color: '#fff' }
});

export default OfflineNotice;
