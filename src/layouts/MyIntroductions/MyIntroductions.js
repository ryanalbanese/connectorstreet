import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SectionList, Alert, ActivityIndicator, RefreshControl } from 'react-native'

import {NavigationActions} from 'react-navigation';
import moment from 'moment'

import { width, height, iconImages, alphabet, dayNames, monthNames } from 'constants/config'
import { checkNextProps, connectWithNavigationIsFocused } from 'utils'

import * as Models from 'models'

import NavBar from 'components/NavBar'
import Sep from 'components/Sep'
import MessageItem from 'components/MessageItem'
import RelationHeader from 'components/RelationHeader'
import RelationItem from 'components/RelationItem'

@connectWithNavigationIsFocused(
  state => ({
    getMyIntroductions: state.getMyIntroductions,
    userData: state.userData,
    getIntroductionById: state.getIntroductionById,
    deleteIntroduction: state.deleteIntroduction,
    updateIntroduction: state.updateIntroduction
  }),
  dispatch => ({
    actionGetMyIntroductions: (userId) => {
      dispatch(Models.introduction.getMyIntroductions(userId))
    },
    actionDeleteIntroduction: (id) => {
      dispatch(Models.introduction.deleteIntroduction(id))
    },
    actionGetIntroById: (id) => {
      dispatch(Models.introduction.getIntroductionById(id))
    },
    actionUpdateIntroduction: (id, keyValue) => {
      dispatch(Models.introduction.updateIntroduction(id, keyValue))
    }
  })
)
export default class MyIntroductions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isRefreshing: false,
      data: []
    }
  }

  componentWillMount() {

    const { actionGetMyIntroductions, userData } = this.props
    const userId = userData.userModel.user_uid
    if (userId) {
      this.setState({ isLoading: true }, () => {
        actionGetMyIntroductions(userId)
      })
    }

  }

  componentWillReceiveProps(nextProps) {
    const { navigation, userData, actionGetMyIntroductions } = this.props
    const propsCheckerGetMyIntroductions = checkNextProps(nextProps, this.props, 'getMyIntroductions')
    const propsCheckerDeleteIntroduction = checkNextProps(nextProps, this.props, 'deleteIntroduction')
    const propsCheckerGetIntroById = checkNextProps(nextProps, this.props, 'getIntroductionById')
    const propsCheckerUpdateIntroduction = checkNextProps(nextProps, this.props, 'updateIntroduction')
    const dataGroupedByDay = nextProps.getMyIntroductions.response

    const goToLogin = NavigationActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({routeName: 'LoginStack'})],
      key: null
    })

    if (propsCheckerUpdateIntroduction && nextProps.updateIntroduction.response === 200){

      this.setState({ isLoading: true }, () => {actionGetMyIntroductions(userData.userModel.user_uid)})
    }

    if (propsCheckerDeleteIntroduction && nextProps.deleteIntroduction.response === 200){
      this.setState({ isLoading: true }, () => {actionGetMyIntroductions(userData.userModel.user_uid)})
    }

    if (propsCheckerGetMyIntroductions == 'error') {
			const error = nextProps.getMyIntroductions.error
      this.setState({isLoading: false});
      if (error.msg != "Token has expired.") {
        Alert.alert(error.msg)
      }
      else {
        Alert.alert('Your session has expired. Please login again.', null, [
          {text: 'Login', onPress: () => navigation.dispatch(goToLogin)}
        ])
      }
    } else if (propsCheckerGetMyIntroductions && propsCheckerGetMyIntroductions != 'empty') {

      this.setState({
        isLoading: false,
        isRefreshing: false,
        data: dataGroupedByDay
      })
    } else if (propsCheckerGetMyIntroductions == 'empty') {
			this.setState({isLoading: false})
		}
  }

  _keyExtractor = (item, index) => 'key-'+item.key+'';

  renderItem = ({item, index}) => {
    const { navigation, actionDeleteIntroduction, actionGetMyIntroductions, onDelete, userData, onHide, actionUpdateIntroduction } = this.props
    const {data} = this.state
    const key = 'conn_opened_'+userData.userModel.user_uid+''

    return <RelationItem type='twoPersons' isViewed={item.fullDetails[key]
    ? false
    : false} onHide={
      ()=>{
        item.fullDetails['hidden'] = true;
        const keyID = item.key.split('_').slice(1).join('_');
        this.setState({ isLoading: true }, () => {actionUpdateIntroduction(keyID, item.fullDetails)})
      }
    }

    onPress={() => navigation.navigate('IntroductionDetatils', {detailsData: item.fullDetails})} key={item.key} item={item} idx={index} />
  }

  renderSectionHeader = ({section}) => {
    return <RelationHeader item={section} />
  }
  _onRefresh = () => {
    const {actionGetMyIntroductions, userData} = this.props
    this.setState({isRefreshing: true});
    actionGetMyIntroductions(userData.userModel.user_uid)
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
        text: 'My Introductions',
        fontSize: width(4.2),
        subText: 'You introduced'
      },
    }
    return (
      <View style={styles.wrapper}>
        <NavBar {...navBarProps} navigation={navigation} />
        <View style={styles.content}>
          {
            data && data.length
              ? <SectionList
              //refreshControl={
                  //<RefreshControl
                  //  refreshing={this.state.isRefreshing}
                  //  onRefresh={this._onRefresh}
                  ///>
                //}
                  sections={data}
                  renderSectionHeader={this.renderSectionHeader}
                  keyExtractor={this._keyExtractor}
                  initialNumToRender={50}
                  removeClippedSubviews={true}
                  renderItem={this.renderItem}/>
              : null
          }
          {
            this.state.isLoading === false && data.length === 0
            ? <Text style={styles.noData}>
                You do not have any introductions
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
  noData: {
    marginTop: width(6),
    alignSelf: 'center',
    fontSize: width(3.5)
  }
})
