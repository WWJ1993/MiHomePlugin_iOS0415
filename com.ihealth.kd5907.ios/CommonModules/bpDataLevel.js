var BP_WHO_RED = '1';
var BP_WHO_ORANGE_RED = '2';
var BP_WHO_YELLOW = '3';
var BP_WHO_YELLOW_GREEN = '4';
var BP_WHO_LIGHT_GREEN = '5';
var BP_WHO_GREEN = '6';

function bpDataLevel(highP, lowP) {
	var DIANum=lowP;
    var SYSNum=highP;
    var UnitWHO = '0';

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
}

module.exports = bpDataLevel;
