import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SectionList, Alert, ActivityIndicator } from 'react-native'

import moment from 'moment'

import { width, height, iconImages, alphabet, dayNames, monthNames } from 'constants/config'
import { connectWithNavigationIsFocused, checkNextProps } from 'utils'
import * as Models from 'models'
import NavBar from 'components/NavBar'
import Sep from 'components/Sep'
import RelationHeader from 'components/RelationHeader'
import RelationItem from 'components/RelationItem'
import * as ApiUtils from 'actions/utils'
import {AsyncStorage} from 'react-native';

@connectWithNavigationIsFocused(
  state => ({
    userData: state.userData,
    getNotifications: state.getNotifications,
    updateNotifications: state.updateNotifications,
    watchedNotifications: state.watchedNotifications,
    getNotificationById: state.getNotificationById
  }),
  dispatch => ({
    addWatchedNotificationIds: (data) => {
			dispatch(ApiUtils.addWatchedNotificationIds(data))
		},
    actionUpdateNotifications: (id, keyValue) => {
      dispatch(Models.notification.updateNotifications(id, keyValue))
    },
    actionGetNotifications: (userId) => {
      dispatch(Models.notification.getNotifications(userId))
    },
    actionGetNotificationById: (id) => {
      dispatch(Models.notification.getNotificationById(id))
    }
  })
)
export default class Notifications extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      date: []
    }

  }

  componentDidMount() {
    const { addWatchedNotificationIds, watchedNotifications, getNotifications } = this.props
    if (getNotifications.response) {
      addWatchedNotificationIds(getNotifications.response.filter(notif => watchedNotifications.data.indexOf(notif.id) == -1).map(notif => notif.id))
    }
  }

  componentWillMount() {

    const { navigation, userData, getNotifications, actionGetNotifications, actionGetNotificationById } = this.props

    const hasPush = navigation.state && navigation.state.params && navigation.state.params.pushNotif

    const pushId = navigation.state && navigation.state.params && navigation.state.params.id

    if (hasPush){

      this.setState({ isLoading: true }, () => {

        actionGetNotificationById(pushId)

      })

    }

    else {

      this.setState({ isLoading: true }, () => {

        actionGetNotifications(userData.userModel.user_uid)

      })

    }

  }

  componentWillReceiveProps(nextProps) {

    const { navigation, userData, actionGetMyIntroductions, actionGetNotifications} = this.props

    const propsCheckerUpdateNotifications = checkNextProps(nextProps, this.props, 'updateNotifications')

    const propsCheckerGetNotifications = checkNextProps(nextProps, this.props, 'getNotifications')

    const propsCheckerGetNotificationById = checkNextProps(nextProps, this.props, 'getNotificationById')

    if (propsCheckerGetNotificationById && nextProps.getNotificationById.response){

     const data = nextProps.getNotificationById && nextProps.getNotificationById.response

     this.setState({
       isLoading: false,
       data: data
     }, () => {

       if (data.type == 'makeIntroduction'){

         navigation.navigate('NotificationDetatils', {detailsData: data, refresh: this.refresh})

       }

       else {

       navigation.navigate('NotificationDetatilsIntroduction', {detailsData: data, refresh: this.refresh})

        }

       })

    }

    if (propsCheckerGetNotificationById && nextProps.getNotificationById.error){
      this.setState({
        isLoading: false,
        data: []
      })

     }

    if (propsCheckerUpdateNotifications && nextProps.updateNotifications.response === 200){

     this.setState({ isLoading: true }, () => {

       actionGetNotifications(userData.userModel.user_uid)

     })

   }

    if (propsCheckerGetNotifications && nextProps.getNotifications.response){

     const data = nextProps.getNotifications.response

     this.setState({
       isLoading: false,
       data: data
     })

    }

    if (propsCheckerGetNotifications && nextProps.getNotifications.error){

      this.setState({
        isLoading: false,
        data: []
      })

     }

    if (propsCheckerGetNotifications && nextProps.getNotifications.response.status === 204){

       this.setState({
         isLoading: false,
         data: []
       })

      }

  }

  refresh = () => {

    const {actionGetNotifications, userData} = this.props

    this.setState({ isLoading: true, data: '' }, () => {

      actionGetNotifications(userData.userModel.user_uid)

    })

  }

  _keyExtractor = (item, index) => 'key-'+item.key+'';

  renderItem = ({item, index}) => {

    const { navigation, actionUpdateNotifications, userData } = this.props

    const {dataType} = item.type

    const key = 'opened_'+userData.userModel.user_uid+''
    const hiddenKey = 'hidden_'+userData.userModel.user_uid+''

      return <RelationItem type="onePerson" isViewed={item.fullDetails[key]
      ? false
      : true} onHide={
        ()=> {
          item.fullDetails[hiddenKey] = true;
          const keyID = item.key.split('_').slice(1).join('_');
          this.setState({ isLoading: true }, () => {
            actionUpdateNotifications(keyID, item.fullDetails)

          })
        }

      }
      swipeoutMenu={1} onPress={() => navigation.navigate(
        item.type === 'message'?
        'NotificationDetatilsIntroduction'
        :'NotificationDetatils'
        , {detailsData: item.fullDetails, refresh: this.refresh })} key={item.key} item={item} idx={index} />

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
        text: 'My Notifications',
        fontSize: width(4.2),
        subText: 'Notifications that have been sent to you'
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
                  renderSectionHeader={this.renderSectionHeader}
                  keyExtractor={this._keyExtractor}
                  initialNumToRender={50}
                  removeClippedSubviews={true}
                  renderItem={this.renderItem}/>
              :null
            }
            {
              this.state.isLoading === false && data && data.length === 0
              ? <Text style={styles.noData}>
                  You do not have any notifications
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
