/*
    This files contains the logic to find an open slot in the User's calendar.

    The names of variables and functions try to be semantic and self explanatory

    The matchAvailability method here will return an array with objects to render in the UI through usersAppointment, 
    once the query was sent and if it was successful. This is the object format that will be returned:

    [
        {'dates': 
            [{'ini':'14:10','end':'15:16'},{'ini':'17:18','end':'21:50'}] //Represents the available time ranges 
        },
        {'usersAvailable':4}  // This will display how many users had appointments but still are available in a certain time range
    ]

    The application considers a 24 hrs window of open possibilities.

    The application will receive an object with all the info needed:
    
            objConfig = {
                "currentDay": currentDay,
                "event": event,
                "localData": localData,
                "durationTime": durationTime,
                "minsHours": minsHours
            }
*/

let findOpenSlot = (function() {
    let userMatch = [];
    let userMatchedId = [];
    /* iniRange and  endRange will be set once the first match occurred, so the iteration for this object will be avoided 
       untill ini and duration are out of range, meaning that there are no intersections 
    */
    let iniRange = 0,
        endRange = 0;

    function matchAvailability(objConfig) {
        let resp = JSON.parse(JSON.stringify(objConfig.localData));
        let currentDay = objConfig.currentDay;
        let event = objConfig.event;
        let duration = objConfig.durationTime; // init and duration is the range used to find intersections
        let init = 0;
        // checkin and checkout represents the working time
        let checkIn = minsConverter(8, 'hrs'); // conversts hh:mm format time to mins, 24 hoursbase
        let checkOut = minsConverter(18, 'hrs'); // conversts hh:mm format time to mins, 24 hoursbase
        let matchedElements = [];
        let freeSchedule = [];

        let usersWithAppointments = resp.filter(user => {
            /* This gets all the users that has an booked appointment,
               from here the script will try to find available time according to the duration set and the chosen day
            */ 
            if (user.appointments.length) {
                return getUsersMatchDay(user.appointments);
            }
        });

        // Creates a formated object neede for future work from the users with booked appointments        
        let arrAvailability = usersWithAppointments.map(user => appointmentStartEnd(user));
        let arrAvailabilityLength = arrAvailability.length; // This catch the length, because the value is used more than once and this helps performance

        for (let i = checkIn; i < checkOut; i++) { 
            if (matchedElements.length === usersWithAppointments.length) { 
                // If all the users are available, matchedElements is reset to allow to find more matches with the same query
                matchedElements = [];
            } else {
                userMatch.push(findOpenSlots(init, duration));
            }
            ++init;
            ++duration;
        }

        let cleanArrUsersAvailable = userMatch.filter(people => people.length > 0);
        //     console.log('xxxxxxxxxxxxx FINAL VAL xxxxxxxxxxxxxxxxxxx');
        //    // console.log(cleanArrUsersAvailable);
        //     console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
        //alert(cleanArrUsersAvailable);

        function getUsersMatchDay(appointments) {
            let someDayMatch = false;
            appointments.forEach(days => { //cambiar a for y decir por que....more extensive than a forEach but performs quickier
                if (days.day == currentDay) {
                    someDayMatch = true;
                }
            });
            return someDayMatch;
        } //End matchAvailability() > getUsersMatchDay();

        function findOpenSlots(ini, duration) {
            for (let j = 0; j < arrAvailabilityLength; j++) {
                // console.log(arrAvailability[j].userId); //aa <= ini && bb <= duration &&
                //    console.log("INI: " +  ini);
                //    console.log("INIRANGE: " + iniRange);
                //    console.log("DURATION: " + duration);
                //    console.log("ENDRANGE: " + endRange);
                if (userMatchedId.indexOf(arrAvailability[j].userId) >= 0 && endRange > ini) {
                    /* This is to avoid doing unnecessary iterations as long 
                      as the ini and duration values are in the range of the respective person matched */
                    //   console.log('*************************se debe brincar el objeto en cuestion************');
                } else {
                    if (matchedElements.indexOf(arrAvailability[j]) === -1 && findAvailability(arrAvailability[j], ini, duration)) {
                        //   console.log('IS A MATCH');                      
                        //   console.log("ini: " + ini);
                        //   console.log("duration: " + duration) 
                        //   console.log(arrAvailability[j]);   
                        matchedElements.push(arrAvailability[j]);
                        //   console.log(matchedElements);           
                        //   console.log('****************************');    
                    }
                }
            }
            // console.log(':::::::::::::::::::::::::::');
            // console.log(matchedElements); 
            // console.log(':::::::::::::::::::::::::::');
            if (matchedElements.length === arrAvailabilityLength) {
                console.log("***********************FULL MATCH YATAHHH*****************");
                userMatchedId = [];
                freeSchedule.push({
                    "ini": minsConverter(ini, 'turn'),
                    "end": minsConverter(duration, 'turn')
                });
                return matchedElements;
            } else {
                // console.log('-----still no full matches--------');
                if (userMatchedId.length) { // Review if it has been matches before perform unnecessary operations
                    // console.log('--no full matches but some matches---');
                    // console.log("ini: " +  ini);
                    // console.log("iniRange: " + iniRange);
                    // console.log("duration: " + duration);
                    // console.log("endRange: " + endRange);
                    // console.log(userMatchedId);
                    // console.log(findUserIdsMatches());
                    // console.log('****************************************');
                    if (iniRange < ini && endRange < duration && findUserIdsMatches()) {
                        // console.log('Reset until the range is fulfilled');
                        // console.log(userMatchedId);
                        userMatchedId = [];
                        // console.log('****************************************');
                    }
                }
                return [];
            }

            //Help function
            function findUserIdsMatches() {
                let proveVal;
                // console.log('::::::::::::::::::::::::');
                for (let i = 0; i < arrAvailabilityLength; i++) {
                    // console.log(userMatchedId);
                    // console.log(arrAvailability[i].userId);
                    if (userMatchedId.indexOf(arrAvailability[i].userId) >= 0) {
                        proveVal = true;
                        break;
                    } else {
                        proveVal = false;
                    }
                }
                return proveVal;
            } //End matchAvailability() > findOpenSlots() > findUserIdsMatches()

        } //End matchAvailability() > findOpenSlots();

        function findAvailability(person, ini, duration) {
            return person.availability.some(bookDay => {
                let bookDayStart = bookDay.start;
                let bookDayEnd = bookDay.end;
                //  console.log(person);
                //  console.log(bookDay);
                //  console.log("ini: " + ini);
                //  console.log("duration: " + duration)
                //  console.log("start: " + bookDayStart);                 
                //  console.log("end: " + bookDayEnd);

                if (ini >= bookDayStart && duration <= bookDayEnd) {
                    userMatchedId.push(person.userId);
                    iniRange = bookDayStart;
                    endRange = bookDayEnd;
                    // console.log('ini mayor o igual start y duration menor o igual end');                    
                    // console.log('person.userId: ' + person.userId);
                    // console.log('userMatchedId: ' + userMatchedId);
                    // console.log(person);  
                    // console.log('****************************'); 
                    return true;

                } else if (ini > bookDayStart && duration > bookDayEnd && ini < bookDayEnd && (bookDayEnd - ini) >= (duration - ini)) {
                    userMatchedId.push(person.userId);
                    iniRange = bookDayStart;
                    endRange = bookDayEnd;
                    //    console.log('ini mayor start y duration mayor end');                   
                    //    console.log('person.userId: ' + person.userId);
                    //    console.log('userMatchedId: ' + userMatchedId);
                    //    console.log(person);  
                    //    console.log('****************************'); 
                    return true;
                } else if (ini < bookDayStart && duration < bookDayEnd && duration > bookDayStart && (duration - bookDayStart) >= (duration - ini)) {
                    userMatchedId.push(person.userId);
                    iniRange = bookDayStart;
                    endRange = bookDayEnd;
                    // console.log('ini menor start y duration mayor start');                    
                    // console.log('person.userId: ' + person.userId);
                    // console.log('userMatchedId: ' + userMatchedId);
                    // console.log(person);  
                    // console.log('****************************'); 
                    return true;
                } else {
                    // console.log('nothing');
                    // console.log('****************************');
                    return false;
                }
            });
        } //End matchAvailability() > findAvailability();

        function appointmentStartEnd(user) {
            let availability = user.appointments.map(endStart => {
                return {
                    "start": minsConverter(endStart.start, 'hrs'),
                    "end": minsConverter(endStart.end, 'hrs'),
                }
            });
            return {
                "userId": user.userId,
                "availability": availability
            }
        } //End matchAvailability() > appointmentStartEnd()

        return [{
                'dates': freeSchedule
            },
            {
                'usersAvailable': cleanArrUsersAvailable.length
            }
        ];

    } //End matchAvailability()

    //FUNCTIONS HELPERS
    // convert typed duration to mins, if necessary
    function minsConverter(hour, hourType) {
        if (!isNaN(hour)) {
            hour = hour.toString();
        }
        let convertedMins = 0;
        if (hourType === 'mins') {
            convertedMins = hour;
        } else if (hourType === 'hrs') {
            if (hour.includes(':')) {
                let mins = hour.split(':');
                if (mins[0] === '24') {
                    mins[0] = '0';
                }
                convertedMins = (parseInt(mins[0]) * 60) + parseInt(mins[1]);
            } else {
                if (hour === '24') {
                    hour = '0';
                }
                convertedMins = parseInt(hour) * 60;
            }
        } else if (hourType === 'turn') {
            let mins = hour % 60;
            if (mins < 10) {
                mins = '0' + mins;
            }
            convertedMins = Math.floor(hour / 60) + ':' + mins;
        } else {
            messages.displayMessage(false, "Something is wrong please contact the Administrator");
            // some bad value was sent
        }
        return convertedMins;
    } // End minsConverter()

    return {
        matchAvailability: matchAvailability
    }

})();