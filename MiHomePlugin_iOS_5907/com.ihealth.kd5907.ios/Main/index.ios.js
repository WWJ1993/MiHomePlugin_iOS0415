/**
 * The examples provided by Facebook are for non-commercial testing and
 * evaluation purposes only.
 *
 * Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
'use strict';

const React = require('react-native');
const BaseCode64 = require('../CommonModules/BaseCode64');
const {
  NavigationExperimental,
  Navigator,
  AppRegistry,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
  StyleSheet,
  View,
  PixelRatio,
  DeviceEventEmitter,
} = React;

// NavigationExperimental目前还有bug，只能还是先用原来的navigator
// var Navigator = NavigationExperimental.LegacyNavigator;

var MHPluginSDK = require('NativeModules').MHPluginSDK;
var {height:screenHeight, widt:screenWidth} = Dimensions.get('window');
var ImageButton = require('../CommonModules/ImageButton');
var MHNavigationBar = require('../CommonModules/MHNavigationBar');

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56;
let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}
// 首页信息
var MainPage = require('./MainPage');
var SceneMain = require('./SceneMain');
var deviceInfo = {};

class PluginApp extends React.Component {

  constructor(props) {
    super(props);

    if (MHPluginSDK.extraInfo.value) { //自定义场景入口
      this._firstPage = SceneMain;

      MHPluginSDK.loadInfoCallback(info => {
        if (info != null) {
          deviceInfo = info;
        }

        var decodeStr = BaseCode64.Base64decode(MHPluginSDK.extraInfo.value);
        var bpDataArr = decodeStr.split(",");

        deviceInfo.resultDataID = bpDataArr[0];
        deviceInfo.resultDid = bpDataArr[1];
        deviceInfo.resultHeartRate = bpDataArr[2];
        deviceInfo.resultHighP = bpDataArr[3];
        deviceInfo.resultLowP = bpDataArr[4];
        deviceInfo.resultPosition = bpDataArr[5];
        deviceInfo.resultUserID = bpDataArr[6];
        deviceInfo.resultMood = bpDataArr[7];
        deviceInfo.resultTakePill = bpDataArr[8];
        deviceInfo.resultMeasureTime = bpDataArr[9];
        //存储本地
        MHPluginSDK.saveInfo(deviceInfo);
      });
    }
    else { // 正常进入插件首页
      this._firstPage = MainPage;
    }

    var navigationBarRouteMapper = {
      LeftButton: function(route, navigator, index, navState) {
        if (route.renderNavLeftComponent) {
          return route.renderNavLeftComponent(route, navigator, index, navState);
        } else {
          var previousRoute = navState.routeStack[index - 1];
          return (
            <View style={{left:0, width:29+15*2, height:APPBAR_HEIGHT, justifyContent:'center', alignItems:'center'}}>
              <ImageButton
                source={{uri:MHPluginSDK.uriNaviBackButtonImage, scale:PixelRatio.get()}}
                onPress={() => {
                  if (index === 0) {
                    MHPluginSDK.closeCurrentPage();
                  } else {
                    navigator.pop();
                  }
                }}
                style={[{width:29, height:29, tintColor: '#000000'}, route.navLeftButtonStyle]}
              />
            </View>
          );
        }
      }.bind(this),
      RightButton: function(route, navigator, index, navState) {
        if (route.renderNavRightComponent) {
          return route.renderNavRightComponent(route, navigator, index, navState);
        } else {
          return (<View />);
        }
      }.bind(this),
      Title: function(route, navigator, index, navState) {
        if (route.renderNavTitleComponent) {
          return route.renderNavTitleComponent(route, navigator, index, navState);
        } else {
          return (
            <Text style={[styles.navBarText, styles.navBarTitleText, route.navTitleStyle]}>
              {route.title}
            </Text>
          );
        }
      }.bind(this)
    };

    this.state = {
      navBarStyle: null,
      isNavigationBarHidden: false,
      navigationBarRouteMapper: navigationBarRouteMapper
    }

  }

  componentWillMount() {
    var navigator = this.props.navigator;
    this._willFocusListener = DeviceEventEmitter.addListener('willfocus', (event) => {
      if (event.route)
      {
        this.setIsNavigationBarHidden(false);
        this.setIsNavigationBarHidden(event.route.isNavigationBarHidden);
        this.setNavigationBarStyle(event.route.navBarStyle);
        var navigationBarRouteMapper = {
          ...this.state.navigationBarRouteMapper
        }
        // alert(""+JSON.stringify(navigationBarRouteMapper));
        // this.setState({navigationBarRouteMapper:navigationBarRouteMapper});
      }
    });
    this._didFocusListener = DeviceEventEmitter.addListener('didfocus', (event) => {

    });
  }

  componentDidMount() {

    this._deviceNameChangedListener = DeviceEventEmitter.addListener('EditBPDataListView_Edit', (event) => {
      event.renderNavRightComponent=this.refreshNavigatorUI_Edit;
      this.setIsNavigationBarHidden(false);
    });

    this._deviceNameChangedListener = DeviceEventEmitter.addListener('EditBPDataListView_OK', (event) => {
      event.renderNavRightComponent=this.refreshNavigatorUI_OK;
      this.setIsNavigationBarHidden(false);
    });

    DeviceEventEmitter.emit('willfocus', {route:this._firstPage.route});
    DeviceEventEmitter.emit('didfocus', {route:this._firstPage.route});
  }

  componentWillUnmount() {
    this._willFocusListener.remove();
    this._didFocusListener.remove();
  }

  render() {
    return (
      <Navigator
        debugOverlay={false}
        style={styles.appContainer}
        initialRoute={this._firstPage.route}
        configureScene={(route, routeStack)=>({
          ...route.sceneConig || Navigator.SceneConfigs.HorizontalSwipeJump,
          gestures: { pop: false }
        })}
        onWillFocus={(route) => {
          DeviceEventEmitter.emit('willfocus', {route:route});
        }}
        onDidFocus={(route) => {
          DeviceEventEmitter.emit('didfocus', {route:route});
        }}
        renderScene={(route, navigator) => {
          if (route.component == undefined) {
            return <View />;
          }
          else {
            return <route.component navigator={navigator} app={this} {...route.passProps}/>
          }
        }}
        navigationBar={this.state.isNavigationBarHidden ? null :
          (<MHNavigationBar
            routeMapper={this.state.navigationBarRouteMapper}
            style={[styles.navBar, this.state.navBarStyle]}
          />)
        }
      />
    );
  }


  /**
    设置导航栏相关，子页面通过 this.props.app.xxx() 的方式调用
    */

  // 设置导航栏是否隐藏
  setIsNavigationBarHidden(isHidden) {
    this.setState({isNavigationBarHidden:isHidden});
  }

  // 设置导航栏背景样式
  setNavigationBarStyle(barStyle) {
    this.setState({navBarStyle:barStyle});
  }

  /**
    helper
    */

  // 获取插件包内资源路径
  pathForResource(filename) {
    return MHPluginSDK.basePath + filename;
  }

  // 获取插件包内图片source，<Image>用
  sourceOfImage(filename) {
    return {

      uri:MHPluginSDK.basePath + filename,
      // uri:this.pathForResource(filename),
      scale:PixelRatio.get()
    }
  }

  refreshNavigatorUI_Edit(route, navigator, index, navState){
      return (
          <View style={{left:0, width:29+15*2, height:APPBAR_HEIGHT, justifyContent:'center', alignItems:'center'}}>

            <Text key='edit' style={{left:0, width:29+15*2, height:APPBAR_HEIGHT, color:'#FF6633', fontSize:18, paddingLeft:10, paddingTop:10}}
                  onPress={() => {
                          DeviceEventEmitter.emit('EditBPDataListView_OK', route);
                      }}>

              完成
            </Text>
          </View>
      );
  }

  refreshNavigatorUI_OK(route, navigator, index, navState){
    return (
        <View style={{left:0, width:29+15*2, height:APPBAR_HEIGHT, justifyContent:'center', alignItems:'center'}}>

          <Text key='edit' style={{left:0, width:29+15*2, height:APPBAR_HEIGHT, color:'#FF6633', fontSize:18, paddingLeft:10, paddingTop:10}}
                onPress={() => {
                          DeviceEventEmitter.emit('EditBPDataListView_Edit', route);
                      }}>

            编辑
          </Text>
        </View>
    );
  }
}

var styles = StyleSheet.create({
  navBar: {
      marginTop:APPBAR_MARGINTOP,
      backgroundColor: '#efeff0'
  },
  navBarText: {
    fontSize: 17,
    marginVertical: 10
    },
  navBarTitleText: {
    color: '#333333',
    fontSize: 17,
    marginVertical: 14
  },
  navBarLeftButton: {
    paddingLeft: 10
  },
  appContainer: {
    backgroundColor: '#efeff0',
    flex: 1,
    height: screenHeight,
    width: screenWidth
  }
});

AppRegistry.registerComponent('com.ihealth.kd5907.ios', () => PluginApp);
