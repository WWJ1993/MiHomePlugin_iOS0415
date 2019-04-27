/**
 * Created by zhangmingli on 2016/11/9.
 */
'use strict';

var React = require('react-native');
var MHPluginSDK = require('NativeModules').MHPluginSDK;
var BPUsingInstructions = require('./BPUsingInstructions');
var Question = require('./Question');
var Dimensions = require('Dimensions');
var strings = require('../CommonModules/ihealthLocalizedString');
const { height,width } = Dimensions.get('window');
var {
    StyleSheet,
    WebView,
    View,
    StatusBar,
    Platform,
    Navigator,
    TouchableHighlight,
    Text,
    Component,
    Image,
    } = React;
let APPBAR_MARGINTOP = 0;

if (MHPluginSDK.systemInfo.mobileModel === "iPhone10,3" || MHPluginSDK.systemInfo.mobileModel === "iPhone10,6") {
    APPBAR_MARGINTOP = 24;
}
class BPM1MoreHelp extends Component{

    render() {
        var rowUsingInstruction = this._createUsingInstructionRow(BPUsingInstructions);
        // var rowFeedBack = this._createFeedBackRow(strings.BPFaq);
        var rowFeedBack = this._createUsingInstructionRow(Question);

        return (
            <View style={styles.containerAll}>
                <View style={{marginTop:APPBAR_MARGINTOP, height:0.5, width:width, backgroundColor: '#d0d0d0'}}>
                </View>
                <View style={styles.containerMenu}>
                    {/*使用说明*/}
                    {rowUsingInstruction}
                    {/*问题反馈*/}
                    {rowFeedBack}
                </View>
            </View>
        );
    }

    _createFeedBackRow(component) {
        return [
            (<TouchableHighlight key={"touch_"+component} style={styles.rowContainer} underlayColor='#838383' onPress={()=>MHPluginSDK.openFeedback()}>
                <View style={{flexDirection: 'row', flex: 1, height: 58}}>

                    <Text style={{fontSize: 16, alignItems: 'center', alignSelf: 'center', color: '#333333', flex: 2, width: 200, marginLeft:24}}>{component}</Text>

                    <View style={{flex: 1, justifyContent:'center', alignItems:'flex-end'}}>
                        <Image style={{ width: 15, height: 15, marginRight: 24}} source={this.props.app.sourceOfImage("sub_arrow.png")} />
                    </View>

                </View>

            </TouchableHighlight>),
            (<View key={"sep_"+component} style={styles.separator} />)
        ];
    }

    _createUsingInstructionRow(component) {
        return [
            (<TouchableHighlight key={"touch_"+component.route.title} style={styles.rowContainer} underlayColor='#838383' onPress={this._onOpenSubPage(component).bind(this)}>

                <View style={{flexDirection: 'row', flex: 1, height: 58}}>

                    <Text style={{fontSize: 16, alignItems: 'center', alignSelf: 'center', color: '#333333', flex: 2, width: 200, marginLeft:24}}>{component.route.title}</Text>

                    <View style={{flex: 1, justifyContent:'center', alignItems:'flex-end'}}>
                        <Image style={{ width: 15, height: 15, marginRight: 24}} source={this.props.app.sourceOfImage("sub_arrow.png")} />
                    </View>
                </View>
            </TouchableHighlight>),
            (<View key={"sep_"+component.route.title} style={styles.separator} />)
        ];
    }

    _onOpenSubPage(subPageComponent) {
        function subPage() {
            this.props.navigator.push({
                ...subPageComponent.route,
                passProps: {
                    message: 'amazing!',
                },
            });
        }
        return subPage;
    }
};

var styles = StyleSheet.create({
    containerAll: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#838383',
        marginTop: 64,
    },
    containerMenu: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        alignSelf: 'stretch',
    },
    rowContainer: {
        alignSelf: 'stretch',
        flexDirection: 'row',
        //flex: 1,
        height: 58,
    },
    title: {
        fontSize: 16,
        alignItems: 'center',
        alignSelf: 'center',
        color: '#333333',
        //flex: 1,
        width: 200,
        marginLeft:15
    },
    subArrow: {
        position: 'absolute',
        width: 15,
        height: 15,
        marginTop: 18,
        marginLeft: 170,
    },
    separator: {
        height: 0.5,
        alignSelf: 'stretch',
        backgroundColor: '#dddddd',
        marginLeft:15,
        marginRight: 15,
    },
});

var route = {
    key: 'BPM1MoreHelp',
    title: strings.Help,
    component: BPM1MoreHelp,
    renderNavRightComponent: function(route, navigator, index, navState) {
        return (
            <View />
        );
    }
}

module.exports = {
    component: BPM1MoreHelp,
    route: route,
}