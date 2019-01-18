var BP_WHO_RED = 1;
var BP_WHO_ORANGE_RED = 2;
var BP_WHO_YELLOW = 3;
var BP_WHO_YELLOW_GREEN = 4;
var BP_WHO_LIGHT_GREEN = 5;
var BP_WHO_GREEN = 6;  


var dataCompute = {

    //返回血压等级
    getBPWHOHightPressure: function(highP, lowP) {
        var DIANum=lowP;
        var SYSNum=highP;
        var UnitWHO = 0;
        
        if (SYSNum < 120)
        {
            if (DIANum < 80)
            {
                UnitWHO = BP_WHO_GREEN;
            }
            else if (DIANum >= 80 && DIANum < 85)
            {
                UnitWHO = BP_WHO_LIGHT_GREEN;
            }
            else if (DIANum >= 85 && DIANum < 90)
            {
                UnitWHO = BP_WHO_YELLOW_GREEN;
            }
            else if (DIANum >= 90 && DIANum < 100)
            {
                UnitWHO = BP_WHO_YELLOW;
            }
            else if (DIANum >= 100 && DIANum < 110)
            {
                UnitWHO = BP_WHO_ORANGE_RED;
            }
            else if (DIANum >= 110)
            {
                UnitWHO = BP_WHO_RED;
            }
        }
        else if (SYSNum >= 120 && SYSNum < 130)
        {
            if (DIANum < 85)
            {
                UnitWHO = BP_WHO_LIGHT_GREEN;
            }
            else if (DIANum >= 85 && DIANum < 90)
            {
                UnitWHO = BP_WHO_YELLOW_GREEN;
            }
            else if (DIANum >= 90 && DIANum < 100)
            {
                UnitWHO = BP_WHO_YELLOW;
            }
            else if (DIANum >= 100 && DIANum < 110)
            {
                UnitWHO = BP_WHO_ORANGE_RED;
            }
            else if (DIANum >= 110)
            {
                UnitWHO = BP_WHO_RED;
            }
        }
        else if (SYSNum >= 130 && SYSNum < 140)
        {
            if (DIANum < 90)
            {
                UnitWHO = BP_WHO_YELLOW_GREEN;
            }
            else if (DIANum >= 90 && DIANum < 100)
            {
                UnitWHO = BP_WHO_YELLOW;
            }
            else if (DIANum >= 100 && DIANum < 110)
            {
                UnitWHO = BP_WHO_ORANGE_RED;
            }
            else if (DIANum >= 110)
            {
                UnitWHO = BP_WHO_RED;
            }
        }
        else if (SYSNum >= 140 && SYSNum < 160)
        {
            if (DIANum < 100)
            {
                UnitWHO = BP_WHO_YELLOW;
            }
            else if (DIANum >= 100 && DIANum < 110)
            {
                UnitWHO = BP_WHO_ORANGE_RED;
            }
            else if (DIANum >= 110)
            {
                UnitWHO = BP_WHO_RED;
            }
        }
        else if (SYSNum >= 160 && SYSNum < 180)
        {
            if (DIANum < 110)
            {
                UnitWHO = BP_WHO_ORANGE_RED;
            }
            else if (DIANum >= 110)
            {
                UnitWHO = BP_WHO_RED;
            }
        }
        else if (SYSNum >= 180)
        {
            UnitWHO = BP_WHO_RED;
        }
        
        return UnitWHO;
    },

    //返回高压次数和正常次数
    dataStatistics: function(highPs, lowPs) {
        var normalHistory = 0;
        var highHistory = 0;
        var pressure = 0;
        var length = highPs.length;
        for (var i = 0; i < length; i++) {
            pressure = this.getBPWHOHightPressure(highPs[i], lowPs[i]);
            if (pressure <= 3) {
                highHistory++;
            }else{
                normalHistory++;
            }
        }

        return {highHistory: highHistory,
                normalHistory: normalHistory};
    },

    //求平均值
    dataAverage: function(dataArray) {
        var length = dataArray.length;
        var sum = 0;
        for (var i = 0; i < length; i++) {
            sum += dataArray[i];
        }
        return parseInt(sum/length);
    },

    //记录最大值
    dataMostHistory: function(dataArray) {
        var history = 0;
        var length = dataArray.length;
        for (var i = 0; i < length; i++) {
            if (dataArray[i] > history) {
                history = dataArray[i];
            }
        }
        return history;
    }


	// var normalHistory = 0;
	// var highHistory = 0;
	// var mostHighHistory = 0;
	// var mostLowHistory = 0;
	// var highSum = 0;
	// var lowSum = 0;
	// var pressure = 0;
	// var length = highPs.length;
	// for (var i = 0; i < length; i++) {
	// 	pressure = getBPWHOHightPressure(highPs[i], lowPs[i]);
	// 	if (pressure <= 3) {
	// 		highHistory++;
	// 	}else{
	// 		normalHistory++;
	// 	}
	// 	if (highPs[i] > mostHighHistory) {
	// 		mostHighHistory = highPs[i];
	// 	}
	// 	if (lowPs[i] > mostLowHistory) {
	// 		mostLowHistory = lowPs[i];
	// 	}
	// 	highSum += highPs[i];
	// 	lowSum += lowPs[i];
	// }

 //    var data = this.dataStatistics(highPs, lowPs);
	// var highAverage = this.dataAverage(lowPs);
	// var lowAverage = this.dataAverage(highPs);
	// var averageWrong = highAverage - lowAverage;
	// return {lowAverage: lowAverage,
 //            highAverage: highAverage,
	// 		averageWrong: averageWrong,
	// 		mostHighHistory: this.dataMostHistory(highPs),
	// 		mostLowHistory: this.dataMostHistory(lowPs),
	// 		normalHistory: data.normalHistory,
	// 		highHistory: data.highHistory};
}

module.exports = dataCompute;