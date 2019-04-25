/**
 * Created by zhangmingli on 2017/1/10.
 */
'use strict';

import React,{Component} from 'react';
import NativeModules from 'NativeModules';
import Dimensions from 'Dimensions';
import {
    StyleSheet,
    WebView,
    View,
    StatusBar,
    Platform,
    ActivityIndicatorIOS
} from 'react-native';
const MHPluginSDK = NativeModules.MHPluginSDK;
const ResourcesPath = MHPluginSDK.basePath;

class BPStory extends Component{

    constructor(props) {
        super(props);
        this.state={
            screenWidth: Dimensions.get('window').width,
            showActivityIndicator: false
        }
    }
    render() {
        return (
            <View style={styles.container}>
                <View style={{marginTop:0, height:0.5, width:this.state.screenWidth, backgroundColor: '#d0d0d0'}}>
                </View>
                <StatusBar barStyle='default' />
                <WebView
                    style={styles.container}
                    source={{uri:this.props.activityUrl}}
                    onLoad={()=>{this.setState({showActivityIndicator: true})}}
                />
            </View>
        );
    }
    activityIndicator = ()=> {
        if(!this.state.showActivityIndicator){
            return (
                <View style={{position:'absolute', top:100, left:this.state.screenWidth/2-18}}>
                    <ActivityIndicatorIOS
                        size='large'
                        animating={true}/>
                </View>
            )
        }
    };
}
const styles = StyleSheet.create({
    container: {
        marginTop:30,
        flex:1
    },
});
module.exports = BPStory;