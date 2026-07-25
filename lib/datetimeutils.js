class DateTimeUtils {
    date = [0,0,0];
    time = [0,0,0];
    stamp = 0;
    currentYeartStamp = 0;
    weekDay = 5; //The very first day was a friday
    weekNumber = 0;
    dayAmount = 0;
    static VERY_FIRST_DAY_DISTANCE = 3; //The very first day was a friday
    static EQUALS = 1;
    static LESS_THAN = 0;
    static MORE_THAN = 2;

    constructor(dateString) {
        this._extract(this.stringify(dateString));
    }

    getWeekDay(){
        return this.weekDay;
    }

    getWeekNumber(){
        return this.weekNumber;
    }

    toDate(){
        const date = new Date();
        date.setDate(this.getDay());
        date.setMonth(this.getMonth() - 1);
        date.setFullYear(this.getFullYear());
        date.setMinutes(this.getMinute());
        date.setSeconds(this.getSecond());
        date.setHours(this.getHour());
        return date;
    }

    getStamp(){
        return this.stamp;
    }

    setStamp(newStamp) {
        this.stamp = newStamp;
        this._refresh();
        return this;
    }

    stringify(date){
        if(date == undefined){
            date = new Date();
        }
        if(date instanceof Date){
            return this._padding(date.getFullYear(),4)+"-"+this._padding(date.getMonth()+1,2)+"-"+this._padding(date.getDate(),2)+
                " "+this._padding(date.getHours(),2)+":"+this._padding(date.getMinutes(),2)+":"+this._padding(date.getSeconds(),2);
        }
        else if(date instanceof DateTimeUtils){
            return this._padding(date.getFullYear(),4)+"-"+this._padding(date.getMonth(),2)+"-"+this._padding(date.getDay(),2)+
                " "+this._padding(date.getHour(),2)+":"+this._padding(date.getMinute(),2)+":"+this._padding(date.getSecond(),2);
        }
        else if(typeof date != 'string' || (!DateTimeUtils.isDate(date) && !DateTimeUtils.isDateTime(date) && !DateTimeUtils.isTime(date)) ){
            return this.stringify(new Date());
        }
        return date;
    }

    setDateTime(date){
        this._extract(date);
        return this;
    }

    setDate = this.setDateTime;

    getDate(){
        return this._padding(this.date[0],4)+
            "-"+
            this._padding(this.date[1],2)+
            "-"+
            this._padding(this.date[2],2);
    }

    getTime(){
        return this._padding(this.time[0],2)+
            ":"+
            this._padding(this.time[1],2)+
            ":"+
            this._padding(this.time[2],2);
    }

    getDateTime(){
        return this.getDate() + " " + this.getTime();
    }

    getYear(){
        return this.date[0];
    }

    getFullYear = this.getYear;

    getMonth(){
        return this.date[1];
    }

    /**
     * @return int|mixed
     */
    getDay(){
        return this.date[2];
    }

    /**
     * @return int|mixed
     */
    getHour(){
        return this.time[0];
    }

    /**
     * @return int|mixed
     */
    getMinute(){
        return this.time[1];
    }

    /**
     * @return int|mixed
     */
    getSecond(){
        return this.time[2];
    }

    getDayAmount(){
        return this.dayAmount;
    }

    _setWeekDay(){
        let weekSum = 7 * 24 * 60 * 60,
            sum = this.stamp,
            qty = 0,
            reference = this.currentYeartStamp;
        while(sum - weekSum > 0){
            sum -= weekSum;
            if(reference >= 0) {
                qty++;
                reference -= weekSum;
            }
        }
        let date_array = DateTimeUtils.toDate(sum);
        let _weekDay = date_array[2] - DateTimeUtils.VERY_FIRST_DAY_DISTANCE;
        this.weekDay =  _weekDay < 0 ? 7 + _weekDay : _weekDay;
        this.weekNumber = qty;
    }

    _padding(val, padding, _default){
        padding = typeof padding == "undefined" ? 0 : padding;
        _default = typeof _default == "undefined" ? "0" : _default;
        for(var i = 0, j = padding - (val+"").length; i < j; i++){
            val = _default + val;
        }
        return val;
    }

    _extract(_date){
        let list = [];
        if(_date == undefined){
            _date = DateTimeUtils.now();
        }
        if(DateTimeUtils.isDate(_date)){
            list = _date.replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/, "$1 $2 $3").split(" ");
            for(let i in list){
                this.date[i] = parseInt(list[i]);
            }
        }
        else if(DateTimeUtils.isDateTime(_date)){
            list = [];
            if(/^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})?$/.test(_date)) {
                list = _date.replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})?$/, "$1 $2 $3 $4 $5 $6").split(" ");
            }
            else{
                list = _date.replace(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})\.[0-9]{1,3}Z$/, "$1 $2 $3 $4 $5 $6").split(" ");
            }
            for(let i in list){
                if(i < 3){
                    this.date[i] = parseInt(list[i]);
                }
                else{
                    this.time[i - 3] = parseInt(list[i]);
                }
            }
            if(list.length < 6){
                this.time[2] = 0;
            }
        }
        else if(DateTimeUtils.isTime(_date)){
            list = _date.replace(/^([0-9]{2}):([0-9]{2}):([0-9]{2})?$/, "$1 $2 $3").split(" ");
            for(let i in list){
                this.time[i] = parseInt(list[i]);
            }
            if(list.length < 3){
                this.time[2] = 0;
            }
        }
        this._setStamp();
    }

    _setStamp(){
        this.stamp = 0;
        this.dayAmount = 0;
        let qty;
        for(let i = this.date[0] - 1; i >= 0; i--){
            qty = DateTimeUtils.getYearDayQty(i);
            this.stamp += qty;
            this.dayAmount += qty;
        }
        for(var i = 1, j = this.date[1]; i < j; i++){
            qty = DateTimeUtils.getMonthDayQty(i, this.date[0]);
            this.currentYeartStamp += qty;
            this.dayAmount += qty;
            this.stamp += qty;
        }
        this.stamp += this.date[2];
        this.dayAmount += this.date[2];
        this.currentYeartStamp += this.date[2];
        this.stamp *= 24 * 3600;
        this.currentYeartStamp *= 24 * 3600;
        this.stamp += this.time[0] * 3600;
        this.currentYeartStamp += this.time[0] * 3600;
        this.stamp += this.time[1] * 60;
        this.currentYeartStamp += this.time[1] * 60;
        this.stamp += this.time[2];
        this.currentYeartStamp += this.time[2]
        this._refresh(true);
    }

    //@new
    _refresh(loop){
        if(!loop) {
            var date_array = DateTimeUtils.toDate(this.stamp);
            this.date = date_array.slice(0,3);
            this.time = date_array.slice(3,6);
            this._setStamp();
            this._setWeekDay();
        }
    }
    
    clearDate(){
        this.date = [0,0,0];
        this._setStamp();
        return this;
    }

    clearTime(){
        this.time = [0,0,0];
        this._setStamp();
        return this;
    }

    compareTo(date){
        if(!(date instanceof DateTimeUtils) && (DateTimeUtils.isDate(date) || DateTimeUtils.isDateTime(date) || DateTimeUtils.isTime(date))){
            date = new DateTimeUtils(date);
        }
        if(this.stamp == date.getStamp()){
            return DateTimeUtils.EQUALS;
        }
        else if(this.stamp > date.getStamp()){
            return DateTimeUtils.MORE_THAN;
        }
        else{
            return DateTimeUtils.LESS_THAN;
        }
    }

    isMoreThan(date){
        return this.compareTo(date) == DateTimeUtils.MORE_THAN;
    }

    isLessThan = function(date){
        return this.compareTo(date) == DateTimeUtils.LESS_THAN;
    }

    /**
     * @param DateTimeUtils date
     * @return bool
     */
    equals(date){
        return this.compareTo(date) == DateTimeUtils.EQUALS;
    }

    isWeekEnd(){
        return this.weekDay > 5 || this.weekDay < 1;
    }

    isBetween(min, max, strict){
        strict = strict == undefined ? false : strict;
        if(strict){
            return this.stamp > min.getStamp() && this.stamp < max.getStamp();
        }
        return this.stamp >= min.getStamp() && this.stamp <= max.getStamp();
    }

    //@new
    add(date){
        if(DateTimeUtils.isDate(date) || DateTimeUtils.isDateTime(date) || DateTimeUtils.isTime(date)){
            this.date = new DateTimeUtils(date);
        }
        this.stamp += this.date.getStamp();
        this._refresh();
        return this;
    }

    //@new
    sub(date){
        if(DateTimeUtils.isDate(date) || DateTimeUtils.isDateTime(date) || DateTimeUtils.isTime(date)){
            this.date = new DateTimeUtils(date);
        }
        this.stamp -= date.getStamp();
        if(this.stamp < 0){
            this.stamp *= -1;
        }
        this._refresh();
        return this;
    }

    static toDate(sum){
        let seconds = sum % 60,
            minutes = Math.floor(sum / 60),
            hours = Math.floor(minutes / 60);
        minutes %= 60;
        let days = Math.floor(hours / 24);
        hours %= 24;
        let year = 0, month,
            ttl = 0;

        while(true){
            ttl += DateTimeUtils.getYearDayQty(year);
            year++;
            if(days - ttl <= 365){
                if(days -  ttl < 0){
                    ttl -= DateTimeUtils.getYearDayQty(year - 1);
                    year--;
                }
                break;
            }
        }
        days -= ttl;
        ttl = 0;
        for(month = 1; month <= 12; month++){
            ttl += DateTimeUtils.getMonthDayQty(month, year);
            if(days - ttl <= 0){
                ttl -= DateTimeUtils.getMonthDayQty(month, year);
                break;
            }
        }
        days -= ttl;
        if(days == 0){
            month = month > 1 ? month - 1 : year > 0 ? 12 : 0;
            year = month == 12 ? year - 1 : year;
            days = DateTimeUtils.getMonthDayQty(month, year);
        }
        return [year, month, days, hours, minutes, seconds];
    }

    /**
     * @param int $year
     * @return int
     */
    static isBissextileYear(year){
        return year % 4 == 0;
    }

    /**
     * @param int $year
     * @return int
     */
    static getYearDayQty(year){
        return DateTimeUtils.isBissextileYear(year) ? 366 : 365;
    }

    /**
     * @param int $month
     * @param int $year
     * @return int
     */
    static getMonthDayQty(month, year){
        year = typeof year == "undefined" ? 1 : year;
        if(month < 1){
            return 0;
        }
        else if(month < 8){
            if(month % 2){
                return 31;
            }
            else if(month == 2){
                return DateTimeUtils.isBissextileYear(year) ? 29 : 28;
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
    static isDate(date){
        return /^[0-9]{4}(-[0-9]{2}){2}$/.test(date);
    }

    /**
     * @param string $datetime
     * @return false|int
     */
    static isDateTime(datetime){
        return /^[0-9]{4}(-[0-9]{2}){2}( [0-9]{2}(:[0-9]{2}){1,2}|T[0-9]{2}(:[0-9]{2}){1,2}\.[0-9]{1,3}Z)$/.test(datetime);
    }

    /**
     * @param string $time
     * @return false|int
     */
    static isTime(time){
        return /^[0-9]{2}(:[0-9]{2}){1,2}$/.test(time);
    }

    //@new
    static sum(date1, date2){
        let date = new DateTimeUtils('00:00:00');
        return date.add(date1).add(date2);
    }

    //@new
    static diff(date1, date2){
        let date = new DateTimeUtils('00:00:00');
        return date.add(date1).sub(date2);
    }

    static now(){
        return new DateTimeUtils(new Date()).getDateTime();
    }
}

if(module !== undefined && module.exports !== undefined){
    module.exports = DateTimeUtils;
}