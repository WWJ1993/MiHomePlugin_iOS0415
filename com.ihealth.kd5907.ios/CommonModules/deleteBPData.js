/**
 * Created by zhangmingli on 2016/11/10.
 */
var configureInfo = require('./configureInfo');
var ihealth = require('../CommonModules/ihealth');
var MHPluginSDK = require('NativeModules').MHPluginSDK;
var packageInfoData = require('../packageInfo.json');

function toQueryString(obj) {
    return obj ? Object.keys(obj).sort().map(function (key) {
        var val = obj[key];
        if (Array.isArray(val)) {
            return val.sort().map(function (val2) {
                return encodeURI(key) + '=' + encodeURI(val2);
            }).join('&');
        }

        return encodeURI(key) + '=' + encodeURI(val);
    }).join('&') : '';
}

function deleteBPData(bodyDic, callBack)
{
    var timer;
    var timeoutFlag = false;
    var bodyStr='';

    //启动定时器,登录接口设置60s超时
    timer = this.setTimeout(()=>{
        timeoutFlag = true;

        ihealth.log("deleteBPData", '删除血压数据-----网络访问超时！！！');
        callBack(false, '超时错误', '102');
    }, 15000);

    var configureInfo={
        'ApiType':'bpdataUpdateBatch',
        'deviceModel':packageInfoData.models,
        'sid':'202',
        'app_version':'AJK2.0',
        "guid": bodyDic.AppGuid,
        "phoneid": bodyDic.PhoneID,
        "phoneOS": MHPluginSDK.systemInfo.sysName + MHPluginSDK.systemInfo.sysVersion,
        "phone": MHPluginSDK.systemInfo.mobileModel,
        "language": "zh",
        "region": "CN",
        "un": MHPluginSDK.userId+'@mi',
        "token": MHPluginSDK.userId+'@mi',
        "data": bodyDic.dataArr
    };

    //alert('configureInfo:'+JSON.stringify(configureInfo));

    ihealth.log("deleteBPData----:", JSON.stringify(configureInfo));
    MHPluginSDK.callThirdPartyAPI("10021",[],configureInfo, (code, response) => {

        ihealth.log("deleteBPData--code:" + code,'response:' + JSON.stringify(response));

        if (!timeoutFlag && code === 0 && response) {
            {
                ihealth.log('deleteBPData', '无超时');
                //取消登录超时
                this.clearTimeout(timer);

                var responseData = JSON.parse(JSON.parse(response).result);

                switch(responseData.message){

                    case '1':{
                        callBack(true, responseData, '100');
                        break;

                    }
                    default:{
                        //其他错误
                        callBack(false, '其他错误', '500');
                    }
                }
            }
        }
    });
}

module.exports = deleteBPData;