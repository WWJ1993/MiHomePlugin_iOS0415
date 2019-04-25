/**
 * Created by zhangmingli on 2017/1/10.
 */
let ihealth = require('../CommonModules/ihealth');
let MHPluginSDK = require('NativeModules').MHPluginSDK;

function downloadActivity(bodyDic, callBack) {
    let timer;
    let timeoutFlag = false;
    //启动定时器,登录接口设置60s超时
    timer = this.setTimeout(() => {
        timeoutFlag = true;

        ihealth.log("getDeviceConfig", '下载活动-----网络访问超时！！！');
        callBack(false, '超时错误', '102');
    }, 15000);

    let configureInfo = {
        'ApiType': 'downloadactivity',
        'sc': '7c789858c0ec4ebf8189ebb14b6730a5',
        'sv': '5b0221fa8d4444dd839c07a489456607',
        'AppGuid': bodyDic.AppGuid,
        'PhoneID': bodyDic.PhoneID,
        'AppVersion': 'MiHome_i_1.0.1',
        'PhoneName': MHPluginSDK.systemInfo.mobileModel,
        'PhoneOS': MHPluginSDK.systemInfo.sysName + MHPluginSDK.systemInfo.sysVersion,
        'PhoneLanguage': 'zh',
        'PhoneRegion': 'CN',
        'QueueNum': bodyDic.queueNum,
        'Un': MHPluginSDK.userId + '@mi',
        'Token': '',
        'VerifyToken': ''
    };
    ihealth.log("downloadActivity--configureInfo", JSON.stringify(configureInfo));
    MHPluginSDK.callThirdPartyAPI("10021", [], configureInfo, (code, response) => {
        ihealth.log("downloadActivity--code:" + code, 'response:' + JSON.stringify(response));
        if (!timeoutFlag && code === 0 && response) {
            {
                ihealth.log('downloadActivity', '无超时');
                //取消登录超时
                this.clearTimeout(timer);

                let responseData = JSON.parse(JSON.parse(response).result);
                ihealth.log("downloadActivity--:", JSON.stringify(responseData));

                switch (responseData.ResultMessage) {
                    case '100': {
                        callBack(true, responseData, '100');
                        break;

                    }
                    case '208': {
                        //接收服务器返回的正确地址
                        callBack(false, '服务器地址错误', '208');
                        break;
                    }
                    case '212': {
                        //刷新token
                        callBack(false, 'token失效', '212');
                        break;
                    }
                    case '221':
                    case '218': {
                        //令牌错误或刷新令牌错误，需要重新登录获取令牌和刷新令牌
                        callBack(false, '令牌错误', '221');
                        break;
                    }
                    default: {
                        //其他错误
                        callBack(false, '其他错误', '500');
                    }
                }
            }
        }
    });
}
module.exports = downloadActivity;