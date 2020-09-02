import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ImageBackground, FlatList, Platform, SectionList } from 'react-native'
import { NavigationActions } from 'react-navigation';
import moment from 'moment'

import { width, height, iconImages, getBackgroundImageByType, getColorByType, isIphoneX, dayNames, monthNames, monthNamesFull } from 'constants/config'
import { checkNextProps} from 'utils'

import * as ApiUtils from 'actions/utils'
import * as Models from 'models'

import NavBar from 'components/NavBar'
import StdInput from 'components/StdInput'
import Sep from 'components/Sep'
import SmallRoundBtn from 'components/SmallRoundBtn'
import MessageItem from 'components/MessageItem'
import ModalSelectPhoto from './ModalShowInfo';
import RoundedBtn from 'components/RoundedBtn'

@connectWithNavigationIsFocused(
  state => ({
    makeIntroductionData: state.makeIntroductionData,
    userData: state.userData,
    deleteIntroduction: state.deletIntroduction,
    makeIntroduction: state.makeIntroduction,
    deleteIntro: state.deleteIntro,
    savedMessages: state.savedMessages,
    getUsersPushIds: state.getUsersPushIds,
    getUserCustomMessages: state.getUserCustomMessages,
    setCustomMessages: state.setCustomMessages,
    getUsersSettings: state.getUsersSettings,
    connect: state.connect
  }),
  dispatch => ({
    addNewMessage: (data) => {
      dispatch(ApiUtils.addNewMessage(data))
    },
    setMakeIntroductionData: (data) => {
      dispatch(ApiUtils.setMakeIntroductionData(data))
    },
    deleteIntroduction: (id) => {
      dispatch(Models.introduction.deleteIntroduction(id))
    },
    addNewMessage: (data) => {
      dispatch(ApiUtils.addNewMessage(data))
    },
    actionGetCustomMessages: (userId) => {
      dispatch(Models.messages.getUserCustomMessages(userId))
    },
    actionUpdateCustomMessages: (userId, keyValue) => {
      dispatch(Models.messages.updateCustomMessages(userId, keyValue))
    },
    actionAddCustomMessages: (userId, keyValue) => {
      dispatch(Models.messages.setCustomMessages(userId, keyValue))
    },
    actionUpdateIntroduction: (id, keyValue) => {
      dispatch(Models.introduction.updateIntroduction(id, keyValue))
    },
    setPushNotifData: (data) => {
      dispatch(ApiUtils.setPushNotifData(data))
    },
  })
)

export default class IntroductionDetatils extends Component {
  constructor(props) {

    super(props);

    const { deleteIntro } = this.props

    this.state = {
      messageIsSaved: false,
      deleteIntroduction: deleteIntro,
      modalShowInfo: false,
    }

  }

  _keyExtractor = (item, index) => 'key-'+item.key+'';

  componentWillMount() {

    const { userData, actionAddCustomMessages,actionUpdateIntroduction, navigation, setPushNotifData } = this.props


    const key = 'intro_opened_'+userData.userModel.user_uid+''

      if (!navigation.state.params.detailsData[key]){

        const keyID = navigation.state.params.detailsData.id.split('_').slice(1).join('_');

        navigation.state.params.detailsData['conn_opened_'+userData.userModel.user_uid+''] = true;

        actionUpdateIntroduction(keyID, navigation.state.params.detailsData)

      }

  }

  componentWillReceiveProps(nextProps, state) {

    const { userData, navigation, deleteIntro, getUserCustomMessages, actionGetCustomMessages } = this.props

    const propsCheckerGetUserCustomMessages = checkNextProps(nextProps, this.props, 'getUserCustomMessages', 'anyway')

    const propsCheckerSetCustomMessages = checkNextProps(nextProps, this.props, 'setCustomMessages', 'anyway')

    if (propsCheckerSetCustomMessages == 'error'){

      actionGetCustomMessages(userData.userModel.user_uid)

    }


    if (nextProps.getUserCustomMessages.hasSavedMessages){

      this.setState({hasCustomMessages: true})

    }

    else {
        this.setState({hasCustomMessages: false})
    }

    const propsCheckerDeleteIntroduction = checkNextProps(nextProps, this.props, 'deleteIntroduction', 'anyway')

    if (propsCheckerDeleteIntroduction == 'error'){

      //actionGetCustomMessages(userData.userModel.user_uid)

    }

  }

  fPersonEdit = () => {

    const {navigation, makeIntroductionData} = this.props

    navigation.navigate('ViewContact', {personKey: 'fPerson', contactInfo: makeIntroductionData.fPerson, fromScreen: 'SelectAndEditMessage'})

  }

  sPersonEdit = () => {

    const {navigation, makeIntroductionData} = this.props

    navigation.navigate('ViewContact', {personKey: 'sPerson', contactInfo: makeIntroductionData.sPerson, fromScreen: 'SelectAndEditMessage'})

  }

  renderItem = ({item, index}) => {

    const { messageIsSaved } = this.state
    const button = {
      text: messageIsSaved
        ? 'Saved'
        : 'Save message to library',
      onPress: () => this.saveToLibrary(item.message)
    }
    return <MessageItem
      item={item}
      avatarPress={this.avatarPress}
      button={button}
      idx={index} />
  }

  saveToLibrary = () => {

    const { navigation, userData, getUserCustomMessages, actionUpdateCustomMessages, otherData} = this.props

    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData

    const messageArr = getUserCustomMessages && getUserCustomMessages.response || []

    if (!detailsData.message == ''){

      messageArr.push(detailsData.message)

      actionUpdateCustomMessages(userData.userModel.user_uid, messageArr)

      this.setState({messageIsSaved: true, hasCustomMessages: true})

    }

  }

  onPressViewIntroduction = () => {
    const { navigation, setMakeIntroductionData } = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData

    const { user1, user2, message, relationType } = detailsData

    const bothPersonsValid = Object.keys(user1).length && Object.keys(user2).length
    if (bothPersonsValid) {
      setMakeIntroductionData({
        fPerson: user1,
        sPerson: user2,
        otherData: {
          relationType: relationType,
          message: message
        }
      })
      const navigateAction = NavigationActions.navigate({
        routeName: 'Main',
        action: NavigationActions.navigate({
          routeName: 'MakeIntroductions',
          action: NavigationActions.navigate({ routeName: 'SelectAndEditMsg' }),
          params: { prevScreen: 'IntroductionDetatils' }
        })
      })
      navigation.dispatch(navigateAction)
    }
  }

  onModalSelectPhotoBtnPress = (btnKey) => {

    switch (btnKey) {
      case 'close':
        this.setState({modalShowInfo: false})
        break
    }
  }

  onFirstPersonPress = () => {

    const { navigation } = this.props

    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData

    this.setState(
      {
        modalShowInfo: true,
        personKey : 'fPerson',
        modalData: detailsData.user1
      }
    )

  }

  onSecondPersonPress = () => {

    const { navigation } = this.props

    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData

    this.setState({
      modalShowInfo: true,
      personKey : 'sPerson',
      modalData: detailsData.user2
    })

  }

  avatarPress = () => {
    const {navigation} = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData

      this.setState(
        {
          personKey: 'introducer',
          modalShowInfo: true,
          modalData: detailsData.userBy
        }
      )
  }

  render() {
    const { navigation, fPersonEdit, sPersonEdit, actionGetUsers, userData } = this.props
    const detailsData = navigation.state && navigation.state.params && navigation.state.params.detailsData
    const {modalShowInfo} = this.state
    const navBarProps = {
      leftPart: {
        image: iconImages.navBarBackIconWhite,
        action: () => navigation.goBack()
      },
      centerPart: {
        text: 'My Introduction',
        fontSize: width(4.2),
        subText: 'You introduced'
      },
    }
    const itemMoment = moment.unix(detailsData.date)
    const itemTime = itemMoment.format('hh:mm a')
    const messageData = [
      {
        key: 1,
        nameBy: 'You',
        avatar: detailsData.userBy.avatar,
        middleText: 'introduced ' + detailsData.user1.fName + ' & ' + detailsData.user2.fName,
        message: detailsData.message || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.',
        dateText: dayNames[itemMoment.isoWeekday() - 1] + ', ' + monthNames[itemMoment.month()] + ' ' + itemMoment.date() + ', ' + itemTime
      }
    ]

    return (
      <View style={styles.wrapper}>
        <View style={styles.topPartWrapper}>
          <ImageBackground source={getBackgroundImageByType(detailsData.relationType)} style={styles.topPart}>
            <NavBar {...navBarProps} statusBarBackgroundColor={getColorByType(detailsData.relationType)} transparent navigation={navigation} />
            <View style={styles.topPartContent}>
              <View style={styles.row}>
                <View style={styles.middleComp}>
                  <View style={styles.lineImageWrapper}>
                    <Image style={styles.lineImage} source={iconImages.introductionLineImage} />
                  </View>
                  <View style={styles.middleCompOverlay}>
                    <View style={styles.roundView}>
                      <Text style={styles.roundViewText}>
                        TO
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={this.onFirstPersonPress}>
                <View style={styles.personItem}>
                  <View style={styles.avatarImageWrapper}>
                    <Image resizeMethod="scale" source={detailsData.user1 && detailsData.user1.avatar && {uri: detailsData.user1.avatar} || iconImages.avatarPlaceholder} style={styles.avatarImage} />
                  </View>
                  <Text style={styles.personName}>
                    {detailsData.user1.fName + ' ' + detailsData.user1.sName}
                  </Text>
                </View>
              </TouchableOpacity>
                <TouchableOpacity onPress={this.onSecondPersonPress}>
                <View style={styles.personItem}>
                  <View style={styles.avatarImageWrapper}>
                    <Image resizeMethod="scale" source={detailsData.user2 && detailsData.user2.avatar && {uri: detailsData.user2.avatar} || iconImages.avatarPlaceholder} style={styles.avatarImage} />
                  </View>
                  <Text style={styles.personName}>
                  {detailsData.user2.fName + ' ' + detailsData.user2.sName}
                  </Text>
                </View>
                </TouchableOpacity>
              </View>
              <View style={styles.invitationBtnWrapper}>
                <TouchableOpacity onPress={this.onPressViewIntroduction}>
                  <View style={styles.invitationBtnInner}>
                    <Text style={styles.invitationBtnText}>
                      Edit Introduction
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>
        <View style={styles.content}>
          <View style={styles.listWrapper}>
            <FlatList
              data={messageData}
              extraData={this.state}
              keyExtractor={this._keyExtractor}
              renderItem={this.renderItem}/>
          </View>
        </View>
        <ModalSelectPhoto onBtnPress={this.onModalSelectPhotoBtnPress}  personKey={this.state.personKey}
        data={this.state.modalData} visible={modalShowInfo}/>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'white'
  },
  topPartWrapper: {
    width: width(100),
    height: Platform.OS == 'ios'
      ? isIphoneX()
          ? width(95)
          : width(80)
      : width(66)
  },
  topPart: {
    height: '100%',
    width: '100%'
  },
  topPartContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width(100),
    flex: 1,
    paddingTop: isIphoneX()
      ? width(10)
      : width(2)
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: width(2.5)
  },
  personItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  personName: {
    marginTop: width(2.2),
    color: 'white',
    fontSize: width(4),
  },
  avatarImageWrapper: {
    height: width(25),
    width: width(25),
    borderRadius: width(25),
    overflow: 'hidden',
    marginHorizontal: width(10),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  avatarImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  middleComp: {
    width: width(90),
    height: width(27),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  middleCompOverlay: {
    width: width(90),
    height: width(27),
    position: 'absolute',
    left: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineImageWrapper: {
    width: width(70),
    height: 3,
  },
  lineImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain'
  },
  roundView: {
    height: width(7),
    width: width(7),
    borderRadius: width(7),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  roundViewText: {
    color: '#4CD0D9',
    fontSize: width(2.5),
    fontWeight: 'bold'
  },
  deleteBtnWrapper: {
    alignItems: 'center',
  },
  deleteBtnInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width(100),
    height: isIphoneX()
      ? width(18)
      : width(13),
    backgroundColor:'#FF5A5A'
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: width(3.1),
  },
  invitationBtnWrapper: {

  },
  invitationBtnInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width(100),
    height: width(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  invitationBtnText: {
    color: 'white',
    fontSize: width(4.2),
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  listWrapper: {
    flex: 1,
    width: width(90),
  }
})
