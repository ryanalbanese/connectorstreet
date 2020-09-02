import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SectionList, Alert, ActivityIndicator } from 'react-native'

import {NavigationActions} from 'react-navigation';
import moment from 'moment'

import { width, height, iconImages, alphabet, dayNames, monthNames } from 'constants/config'
import { checkNextProps, connectWithNavigationIsFocused } from 'utils'

import * as Models from 'models'

import NavBar from 'components/NavBar'
import Sep from 'components/Sep'
import RelationHeader from 'components/RelationHeader'
import RelationItem from 'components/RelationItem'

const fakeData = [
  {
    date: '123123',
    title: 'TUESDAY, JAN 9',
    data: [
      {
        key: '1',
        time: '3:12',
        midnight: 'pm',
        topText: 'From name',
        relationType: 'Social',
        text: 'Lorem ipsum dolor sit amet, consecte…'
      },
      {
        key: '2',
        time: '3:12',
        midnight: 'pm',
        topText: 'From name',
        relationType: 'Business',
        text: 'Lorem ipsum dolor sit amet, consecte…'
      },
    ]
  }
]

@connectWithNavigationIsFocused(
  state => ({
    getMyConnections: state.getMyConnections,
    userData: state.userData,
    updateIntroduction: state.updateIntroduction
  }),
  dispatch => ({
    actionGetMyConnections: (userId, phone) => {
      dispatch(Models.introduction.getMyConnections(userId, phone))
    },
    actionDeleteIntroduction: (id) => {
      dispatch(Models.introduction.deleteIntroduction(id))
    },
    actionGetIntroById: (id) => {
      dispatch(Models.introduction.getIntroductionById(id))
    },
    actionUpdateIntroduction: (id, keyValue) => {
      dispatch(Models.introduction.updateIntroduction(id, keyValue))
    },
    hideConnection: (id) => {
      dispatch(Models.introduction.updateIntroduction(id, keyValue))
    }
  })
)
export default class AddCustomContact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      data: []
    }
  }

  _keyExtractor = (item, index) => item.key;

  componentWillReceiveProps(nextProps) {

    const goToLogin = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'LoginStack'})],
      key: null
    })
    const { userData, navigation, actionGetMyConnections } = this.props
    const propsCheckerGetMyConnections = checkNextProps(nextProps, this.props, 'getMyConnections', 'anyway')
    if (propsCheckerGetMyConnections == 'error') {
			const error = nextProps.getMyConnections.error
      this.setState({isLoading: false});
      if (error.msg != "Token has expired.") {
        Alert.alert(error.msg)
      }
      else {
        Alert.alert('Your session has expired. Please login again.', null, [
          {text: 'Login', onPress: () => navigation.dispatch(goToLogin)}
        ])
      }
    } else if (propsCheckerGetMyConnections && propsCheckerGetMyConnections != 'empty') {
      const dataGroupedByDay = nextProps.getMyConnections.response
      console.log(dataGroupedByDay)
      this.setState({
        isLoading: false,
        data: dataGroupedByDay
      })
    } else if (propsCheckerGetMyConnections == 'empty') {
			this.setState({isLoading: false})
		}
    const propsCheckerUpdateIntroduction = checkNextProps(nextProps, this.props, 'updateIntroduction')
    if (propsCheckerUpdateIntroduction && nextProps.updateIntroduction.response === 200){
      const userId = userData.userModel.user_uid
      const phone = userData.userModel.user
      this.setState({ isLoading: true }, () => {actionGetMyConnections(userId, phone)})
    }
  }

  componentWillMount() {
    const { actionGetMyConnections, userData } = this.props
    const userId = userData.userModel.user_uid
    const phone = userData.userModel.user
    if (userId) {
      this.setState({ isLoading: true }, () => {
        actionGetMyConnections(userId, phone)
      })
    }
  }

  renderItem = ({item, index}) => {
    const { navigation, actionDeleteIntroduction, actionGetMyIntroductions, onDelete, userData, onHide, actionUpdateIntroduction } = this.props
    const {data} = this.state
    const key = 'conn_opened_'+userData.userModel.user_uid+''
    return <RelationItem type='onePerson' isViewed={item.fullDetails[key]
    ? false
    : false} swipeoutMenu={1}
    onHide={
      ()=>{
        item.fullDetails['hidden_'+userData.userModel.user_uid+''] = true;
        const keyID = item.key.split('_').slice(1).join('_');
        this.setState({ isLoading: false }, () => {actionUpdateIntroduction(keyID, item.fullDetails)})
      }
    }
    onPress={() => navigation.navigate('ConnectionDetatil', {detailsData: item.fullDetails})}
    key={item.key} item={item} idx={index} />
  }

  renderSectionHeader = ({section}) => {
    return <RelationHeader item={section} />
  }

  render() {
    const { navigation } = this.props
    const { isLoading, data } = this.state

    const navBarProps = {
      leftPart: {
        image: iconImages.navBarCrossIconWhite,
        action: () => navigation.navigate('HomeStack')
      },
      centerPart: {
        text: 'My Connections',
        fontSize: width(4.2),
        subText: 'You have been introduced to'
      },
    }
    return (
      <View style={styles.wrapper}>
        <NavBar {...navBarProps} navigation={navigation} />
        <View style={styles.content}>
          {
            data && data.length
              ? <SectionList
                  sections={data}
                  initialNumToRender={50}
                  removeClippedSubviews={true}
                  renderSectionHeader={this.renderSectionHeader}
                  keyExtractor={this._keyExtractor}
                  renderItem={this.renderItem}/>
              : null
          }
          {
            this.state.isLoading === false && data.length === 0
            ? <Text style={styles.noData}>
                You do not have any connections
              </Text>
            : null
          }
        </View>
        {
          isLoading
            ? <ActivityIndicator style={styles.loadingIndicator} animating={true}  color="#3E3E3E" size="small"/>
            : null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 100,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  wrapper: {
    flex: 1,
    backgroundColor: 'white'
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },

  titleWrapper: {
    borderLeftWidth: 4,
    borderLeftColor: '#E1E1E2',
    backgroundColor: '#F8F8F8',
    width: width(100)
  },
  titleInner: {
    marginVertical: width(5),
    marginLeft: width(6)
  },
  titleText: {
    fontSize: width(3),
    color: '#A4A4A7'
  },


  itemWrapper: {
    width: width(100)
  },
  itemInner: {
    marginVertical: width(5),
    marginHorizontal: width(6),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  timeWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  hoursText: {
    fontSize: width(3),
    color: 'black',
    textAlign: 'center'
  },
  mdText: {
    fontSize: width(2.8),
    color: '#A2A2A5',
    textAlign: 'center'
  },
  infoWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarWrapper: {
    height: width(15),
    width: width(15)
  },
  avatarImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover'
  },
  textsWrapper: {
    marginLeft: width(6)
  },
  nameText: {
    fontSize: width(3.8),
    color: 'black',
  },
  infoText: {
    fontSize: width(3),
    color: '#A2A2A5',
    marginTop: width(0.4)
  },
  nextIconWrapper: {
    height: '100%',
    width: width(4),
  },
  nextIconInner: {
    height: width(2.5),
    width: width(2.5),
    marginTop: width(4)
  },
  nextIconImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain'
  },
  sepWrapper: {
    width: width(90),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center'
  },
  noData: {
    marginTop: width(6),
    alignSelf: 'center',
    fontSize: width(3.5)
  }
})
