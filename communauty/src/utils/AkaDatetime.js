var AkaDatetime = function(dateString){
    var date = [0,0,0];
    var time = [0,0,0];
    var stamp = 0;
    var weekDay = 5; //The very first day was a friday
    AkaDatetime.VERY_FIRST_DAY_DISTANCE = 3; //The very first day was a friday
    AkaDatetime.EQUALS = 1;
    AkaDatetime.LESS_THAN = 0;
    AkaDatetime.MORE_THAN = 2;

    function setWeekDay(){
        var weekSum = 7 * 24 * 60 * 60,
            sum = stamp;
        while(sum - weekSum > 0){
            sum -= weekSum;
        }
        var date_array = AkaDatetime.toDate(sum);
        var _weekDay = date_array[2] - AkaDatetime.VERY_FIRST_DAY_DISTANCE;
        weekDay =  _weekDay < 0 ? 7 + _weekDay : _weekDay;
    }

    this.getWeekDay = function(){
        return weekDay;
    }

    this.getStamp = function(){
        return stamp;
    }

    this.stringify = function(date){
        if(date instanceof Date){
            return padding(date.getFullYear(),4)+"-"+padding(date.getMonth()+1,2)+"-"+padding(date.getDate(),2)+
                   " "+padding(date.getHours(),2)+":"+padding(date.getMinutes(),2)+":"+padding(date.getSeconds(),2);
        }
        else if(date instanceof AkaDatetime){
            return padding(date.getFullYear(),4)+"-"+padding(date.getMonth(),2)+"-"+padding(date.getDay(),2)+
                " "+padding(date.getHour(),2)+":"+padding(date.getMinute(),2)+":"+padding(date.getSecond(),2);
        }
        else if(typeof date != 'string' || (!AkaDatetime.isDate(date) && !AkaDatetime.isDateTime(date) && !AkaDatetime.isTime(date)) ){
            return this.stringify(new Date());
        }
        return date;
    }

    this.setDateTime = function(date){
        extract(date);
        return this;
    }

    this.setDate = this.setDateTime;

    this.getDate = function(){
        return padding(date[0],4)+
        "-"+
            padding(date[1],2)+
        "-"+
            padding(date[2],2);
    }

    this.getTime = function(){
        return padding(time[0],2)+
        ":"+
            padding(time[1],2)+
        ":"+
            padding(time[2],2);
    }

    this.getDateTime = function(){
        return this.getDate() + " " + this.getTime();
    }

    function padding(val, _padding, _default){
        _padding = typeof _padding == "undefined" ? 0 : _padding;
        _default = typeof _default == "undefined" ? "0" : _default;
        for(var i = 0, j = _padding - (val+"").length; i < j; i++){
            val = _default + val;
        }
        return val;
    }

    /**
     * @return int|mixed
     */
    this.getYear = function(){
        return date[0];
    }

    this.getFullYear = this.getYear;

    /**
     * @return int|mixed
     */
    this.getMonth = function(){
        return date[1];
    }

    /**
     * @return int|mixed
     */
    this.getDay = function(){
        return date[2];
    }

    /**
     * @return int|mixed
     */
    this.getHour = function(){
        return time[0];
    }

    /**
     * @return int|mixed
     */
    this.getMinute = function(){
        return time[1];
    }

    /**
     * @return int|mixed
     */
    this.getSecond = function(){
        return time[2];
    }

    /**
     * @param string $date
     */
    function extract(_date){
        if(AkaDatetime.isDate(_date)){
            var list = _date.replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, "$1 $2 $3").split(" ");
            for(var i in list){
                date[i] = parseInt(list[i]);
            }
        }
        else if(AkaDatetime.isDateTime(_date)){
            var list = _date.replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})?$/, "$1 $2 $3 $4 $5 $6").split(" ");
            for(var i in list){
                if(i < 3){
                    date[i] = parseInt(list[i]);
                }
                else{
                    time[i - 3] = parseInt(list[i]);
                }
            }
            if(list.length < 6){
                time[2] = 0;
            }
        }
        else if(AkaDatetime.isTime(_date)){
            var list = _date.replace(/^([0-9]{2}):([0-9]{2}):([0-9]{2})?$/, "$1 $2 $3").split(" ");
            for(var i in list){
                time[i] = parseInt(list[i]);
            }
            if(list.length < 3){
                time[2] = 0;
            }
        }
        setStamp();
    }

    function setStamp(){
        stamp = 0;
        for(var i = date[0] - 1; i >= 0; i--){
            stamp += AkaDatetime.getYearDayQty(i);
        }
        for(var i = 1, j = date[1]; i < j; i++){
            stamp += AkaDatetime.getMonthDayQty(i, date[0]);
        }
        stamp += date[2];
        stamp *= 24 * 3600;
        stamp += time[0] * 3600;
        stamp += time[1] * 60;
        stamp += time[2];
        var date_array = AkaDatetime.toDate(stamp);
        date = date_array.slice(0,3);
        time = date_array.slice(3,6);
        setWeekDay();
    }

    this.clearDate = function(){
        date = [0,0,0];
        setStamp();
        return this;
    }

    this.clearTime = function(){
        time = [0,0,0];
        setStamp();
        return this;
    }

    /**
     * @param AkaDateTime $date
     * @return AkaDatetime
     */
    this.compareTo = function(date){
        if(stamp == date.getStamp()){
            return AkaDatetime.EQUALS;
        }
        else if(stamp > date.getStamp()){
            return AkaDatetime.MORE_THAN;
        }
        else{
            return AkaDatetime.LESS_THAN;
        }
    }

    /**
     * @param AkaDateTime $date
     * @return bool
     */
    this.isMoreThan = function(date){
        return this.compareTo(date) == AkaDatetime.MORE_THAN;
    }

    /**
     * @param AkaDateTime $date
     * @return bool
     */
    this.isLessThan = function(date){
        return this.compareTo(date) == AkaDatetime.LESS_THAN;
    }

    /**
     * @param AkaDateTime $date
     * @return bool
     */
    this.equals = function(date){
        return this.compareTo(date) == AkaDatetime.EQUALS;
    }

    this.isWeekEnd = function(){
        return weekDay > 5 || weekDay < 1;
    }
    //@new
    function refresh(){
        var date_array = AkaDatetime.toDate(stamp);
        date = date_array.slice(0,3);
        time = date_array.slice(3,3);
        setWeekDay();
    }

    //@new
    /**
     * @param AkaDateTime $min
     * @param AkaDateTime $max
     * @return bool
     */
    this.isBetween = function(min, max, strict){
        var strict = strict == undefined ? false : strict;
        if(strict){
            return stamp > min.getStamp() && stamp < max.getStamp();
        }
        return stamp >= min.getStamp() && stamp <= max.getStamp();
    }

    //@new
    this.add = function(date){
        stamp += date.getStamp();
        refresh();
        return this;
    }

    //@new
    this.sub = function(date){
        stamp -= date.getStamp();
        if(stamp < 0){
            stamp = 0;
        }
        refresh();
        return this;
    }

    /**
     * @param int $sum
     * @return int[]
     */
     AkaDatetime.toDate = function(sum){
        var seconds = sum % 60,
            minutes = Math.floor(sum / 60),
            hours = Math.floor(minutes / 60);
        minutes %= 60;
        var days = Math.floor(hours / 24);
        hours %= 24;
        var year = 0,
            ttl = 0;

        while(true){
            ttl += AkaDatetime.getYearDayQty(year);
            year++;
            if(days - ttl <= 365){
                if(days -  ttl < 0){
                    ttl -= AkaDatetime.getYearDayQty(year - 1);
                    year--;
                }
                break;
            }
        }
        days -= ttl;
        ttl = 0;
        for(var month = 1; month <= 12; month++){
            ttl += AkaDatetime.getMonthDayQty(month, year);
            if(days - ttl <= 0){
                ttl -= AkaDatetime.getMonthDayQty(month, year);
                break;
            }
        }
        days -= ttl;
        return [year, month, days, hours, minutes, seconds];
    }

    /**
     * @param int $year
     * @return int
     */
    AkaDatetime.isBissextileYear = function(year){
        return year % 4 == 0;
    }

    /**
     * @param int $year
     * @return int
     */
    AkaDatetime.getYearDayQty = function(year){
        return AkaDatetime.isBissextileYear(year) ? 366 : 365;
    }

    /**
     * @param int $month
     * @param int $year
     * @return int
     */
    AkaDatetime.getMonthDayQty = function(month, year){
        year = typeof year == "undefined" ? 1 : year;
        if(month < 1){
            return 0;
        }
        else if(month < 8){
            if(month % 2){
                return 31;
            }
            else if(month == 2){
                return AkaDatetime.isBissextileYear(year) ? 29 : 28;
            }
            return 30;
        }
        else{
            if(month % 2){
                return 30;
            }
            return 31;
        }
    }

    /**
     * @param string $date
     * @return false|int
     */
    AkaDatetime.isDate = function(date){
        return /^[0-9]{4}(-[0-9]{2}){2}$/.test(date);
    }

    /**
     * @param string $datetime
     * @return false|int
     */
    AkaDatetime.isDateTime = function(datetime){
        return /^[0-9]{4}(-[0-9]{2}){2} [0-9]{2}(:[0-9]{2}){1,2}$/.test(datetime);
    }

    /**
     * @param string $time
     * @return false|int
     */
    AkaDatetime.isTime = function(time){
        return /^[0-9]{2}(:[0-9]{2}){1,2}$/.test(time);
    }

    //@new
    AkaDatetime.sum = function(date1, date2){
        var date = new AkaDatetime('00:00:00');
        return date.add(date1).add(date2);
    }

    //@new
    AkaDatetime.diff = function(date1, date2){
        var date = new AkaDatetime('00:00:00');
        return date.add(date1).sub(date2);
    }

    AkaDatetime.now = function(){
        return new AkaDatetime(new Date()).getDateTime();
    }

    extract(this.stringify(dateString));
}



/**
 * @param int $sum
 * @return int[]
 */
AkaDatetime.toDate = function(sum){
    var seconds = sum % 60,
        minutes = Math.floor(sum / 60),
        hours = Math.floor(minutes / 60);
    minutes %= 60;
    var days = Math.floor(hours / 24);
    hours %= 24;
    var year = 0,
        ttl = 0;

    while(true){
        ttl += AkaDatetime.getYearDayQty(year);
        year++;
        if(days - ttl <= 365){
            if(days -  ttl < 0){
                ttl -= AkaDatetime.getYearDayQty(year - 1);
                year--;
            }
            break;
        }
    }
    days -= ttl;
    ttl = 0;
    for(var month = 1; month <= 12; month++){
        ttl += AkaDatetime.getMonthDayQty(month, year);
        if(days - ttl <= 0){
            ttl -= AkaDatetime.getMonthDayQty(month, year);
            break;
        }
    }
    days -= ttl;
    return [year, month, days, hours, minutes, seconds];
}

/**
 * @param int $year
 * @return int
 */
AkaDatetime.isBissextileYear = function(year){
    return year % 4 == 0;
}

/**
 * @param int $year
 * @return int
 */
AkaDatetime.getYearDayQty = function(year){
    return AkaDatetime.isBissextileYear(year) ? 366 : 365;
}

/**
 * @param int $month
 * @param int $year
 * @return int
 */
AkaDatetime.getMonthDayQty = function(month, year){
    year = typeof year == "undefined" ? 1 : year;
    if(month < 1){
        return 0;
    }
    else if(month < 8){
        if(month % 2){
            return 31;
        }
        else if(month == 2){
            return AkaDatetime.isBissextileYear(year) ? 29 : 28;
        }
        return 30;
    }
    else{
        if(month % 2){
            return 30;
        }
        return 31;
    }
}

/**
 * @param string $date
 * @return false|int
 */
AkaDatetime.isDate = function(date){
    return /^[0-9]{4}(-[0-9]{2}){2}$/.test(date);
}

/**
 * @param string $datetime
 * @return false|int
 */
AkaDatetime.isDateTime = function(datetime){
    return /^[0-9]{4}(-[0-9]{2}){2} [0-9]{2}(:[0-9]{2}){1,2}$/.test(datetime);
}

/**
 * @param string $time
 * @return false|int
 */
AkaDatetime.isTime = function(time){
    return /^[0-9]{2}(:[0-9]{2}){1,2}$/.test(time);
}

//@new
AkaDatetime.sum = function(date1, date2){
    var date = new AkaDatetime('00:00:00');
    return date.add(date1).add(date2);
}

//@new
AkaDatetime.diff = function(date1, date2){
    var date = new AkaDatetime('00:00:00');
    return date.add(date1).sub(date2);
}

AkaDatetime.now = function(){
    return new AkaDatetime(new Date()).getDateTime();
}

if(module !== undefined && module.exports !== undefined){
    module.exports = AkaDatetime;
}