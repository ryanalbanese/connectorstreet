import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'

import { width, height, iconImages } from 'constants/config'

import Sep from 'components/Sep'
import RoundedBtn from 'components/RoundedBtn'
import SmallRoundBtn from 'components/SmallRoundBtn'


export default class MessageItem extends Component {
  render() {

    const { item, messageButton, button, actionButtons, messageInnerStyle, wrapperStyle, innerStyle, messageWrapperStyle,onIntroductionTextPress, avatarPress } = this.props
    const { nameBy, name, middleText, lastTest, dateText, message, avatar, fNameSecond, sNameSecond } = item
    return (
      <View style={[styles.wrapper, wrapperStyle && wrapperStyle]}>
        <View style={[styles.inner, innerStyle && innerStyle]}>
          <View style={styles.leftPart}>
            <TouchableOpacity onPress={avatarPress}>
            <View style={styles.avatarImageWrapper}>
              <Image resizeMethod="scale" style={styles.avatarImage} source={avatar && {uri: avatar} || iconImages.avatarPlaceholder} />
            </View>
            </TouchableOpacity>
          </View>
          <View style={styles.rightPart}>
            <View style={styles.topTextWrapper}>
            <TouchableOpacity onPress={avatarPress}>
              <Text style={styles.nameText}>
                {nameBy}
              </Text>
              </TouchableOpacity>
              {
                middleText
                  ? <Text style={styles.actionText}>
                      {middleText}
                    </Text>
                  : null
              }
              {
                lastTest
                  ? <TouchableOpacity onPress={onIntroductionTextPress.onPress}><Text style={styles.actionTextLink}>

                      {lastTest}

                    </Text>
                      </TouchableOpacity>
                  : null
              }
            </View>
            <View style={[styles.messageWrapper, messageWrapperStyle && messageWrapperStyle]}>
              <View style={[styles.messageInner, messageInnerStyle && messageInnerStyle]}>
                <View style={styles.textWrapper}>

                  {
                    fNameSecond
                      ? <Text style={styles.secondNameTopText}>
                          {name + ' please meet ' + fNameSecond}
                        </Text>
                      : null
                  }
                  <Text style={styles.messageText}>
                    {message}
                  </Text>

                </View>
                {
                  actionButtons
                    ? <View style={styles.actionButtonsWrapper}>
                        <Sep />
                        <View style={styles.actionButtonsInner}>
                          <SmallRoundBtn
                            onPress={actionButtons.onMailPress}
                            backgroundColor="#F5F6FB"
                            icon={iconImages.mailRoundBtnIconBlack}
                            customIconStyle={{
                              width: width(4),
                              height: width(4)
                            }}
                            text={'Email ' + fNameSecond}
                            textStyle={{
                              marginTop: width(1),
                              textAlign: 'center',
                              fontSize: width(2),
                              lineHeight: width(3.2)
                            }}
                            customWidth={width(10)} />
                          <View style={styles.actionButtonsRow}>
                            <SmallRoundBtn
                              onPress={actionButtons.onAddPress}
                              backgroundColor="#F5F6FB"
                              icon={iconImages.addRoundBtnIconBlack}
                              customIconStyle={{
                                width: width(4),
                                height: width(4)
                              }}
                              text={'Add ' + fNameSecond + ' To Phone'}
                              textStyle={{
                                marginTop: width(1),
                                textAlign: 'center',
                                fontSize: width(2),
                                lineHeight: width(3.2)
                              }}
                              customWidth={width(10)} />
                            <View style={styles.actionAvatarImageWrapper}>
                              <View style={styles.actionAvatarImageInner}>
                                <Image source={actionButtons.userAvatar && {uri: actionButtons.userAvatar} || iconImages.avatarPlaceholder} style={styles.actionAvatarImage}/>
                              </View>
                              <Text style={styles.secondNameText}>
                                {fNameSecond + ' ' + sNameSecond}
                              </Text>
                            </View>
                            <SmallRoundBtn
                              onPress={actionButtons.onTextPress}
                              backgroundColor="#F5F6FB"
                              text={'Text ' + fNameSecond}
                              icon={iconImages.textRoundBtnIconBlack}
                              customIconStyle={{
                                width: width(4),
                                height: width(4)
                              }}
                              textStyle={{
                                marginTop: width(1),
                                textAlign: 'center',
                                fontSize: width(2),
                                lineHeight: width(3.2)
                              }}
                              customWidth={width(10)} />
                          </View>
                          <SmallRoundBtn
                            onPress={actionButtons.onMessagePress}
                            backgroundColor="#F5F6FB"
                            text={'Message ' + fNameSecond}
                            icon={iconImages.messageRoundBtnIconBlack}
                            customIconStyle={{
                              width: width(4),
                              height: width(4)
                            }}
                            textStyle={{
                              marginTop: width(1),
                              textAlign: 'center',
                              fontSize: width(2),
                              lineHeight: width(3.2)
                            }}
                            customWidth={width(10)} />
                        </View>
                      </View>
                    : null
                }

              </View>
            </View>
            <View style={styles.bottomPartWrapper}>
              <Text style={styles.dateText}>
                {dateText}
              </Text>
              {
                button
                  ? <View style={styles.saveBtnWrapper}>
                      <RoundedBtn
                        innerStyle={{
                          height: width(8),
                          width: button.text == 'Saved'
                            ? width(70)
                            : width(70),
                          borderRadius: width(5),
                          borderWidth: 1,
                          borderColor: button.text == 'Saved'
                          ? '#FFFFFF'
                          : '#BABCBE'
                        }}
                        textStyle={{
                          color: button.text == 'Saved'
                            ? 'white'
                            : '#7F8082',
                          fontSize: width(2.8),
                          marginTop: 0
                        }}
                        wrapperStyle={{
                          // marginTop: width(2)
                        }}
                        onPress={button.onPress}
                        backgroundColor={
                          button.text == 'Saved'
                            ? '#82D5D9'
                            : 'transparent'
                        }
                        text={button.text} />
                      </View>
                    : null
              }
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: width(4)
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  leftPart: {
    flex: 2.2
  },
  avatarImageWrapper: {
    height: width(12),
    width: width(12),
    borderRadius: width(12),
    overflow: 'hidden'
  },
  avatarImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover'
  },
  rightPart: {
    flex: 10
  },
  topTextWrapper: {
    flexDirection: 'row',
    marginVertical: width(4),
    alignItems: 'flex-end'
  },
  nameText: {
    fontSize: width(3.2),
    fontWeight: 'bold',
    color: '#20B6E7'
  },
  actionText: {
    marginLeft: width(1),
    fontSize: width(3.2),
    color: 'black'
  },
  actionTextBlack: {
    marginLeft: width(1),
    fontSize: width(3.2),
    color: 'black'
  },
  actionTextLink: {
    marginLeft: width(1),
    fontSize: width(3.2),
    fontWeight: 'bold',
    color: '#20B6E7'
  },
  messageWrapper: {
    marginTop: width(1),
    width: '100%',
    flexShrink: 1
  },
  messageInner: {
    backgroundColor: '#F5F6FB',
    borderRadius: width(0.8),
    width: '100%',
  },
  textWrapper: {
    paddingVertical: width(4),
    paddingHorizontal: width(4),
    width: '100%',
  },
  secondNameTopText: {
    fontSize: width(3.5),
    fontWeight: 'bold',
    color: '#6F6F6F',
    lineHeight: width(6.2),
    marginBottom: width(3)
  },
  messageText: {
    fontSize: width(3.5),
    color: '#6F6F6F',
    lineHeight: width(6.2)
  },
  btnWrapper: {

  },
  btnInner: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: width(2.8)
  },
  btnText: {
    fontSize: width(2.3),
    color: '#8D8D8D'
  },
  bottomPartWrapper: {
    justifyContent: 'space-between',
    marginVertical: width(2)
  },
  dateText: {
    fontSize: width(2.5),
    color: '#8D8D8D'
  },
  saveBtnWrapper: {
    marginTop: width(2)
  },
  actionButtonsWrapper: {
    width: '100%'
  },
  actionButtonsInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: width(4),
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: width(4),
    width: '100%'
  },
  actionAvatarImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionAvatarImageInner: {
    height: width(23),
    width: width(23),
    borderRadius: width(23),
    overflow: 'hidden'
  },
  actionAvatarImage: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover'
  },
  secondNameText: {
    fontSize: width(3),
    color: 'black',
    marginTop: width(2)
  }
})
