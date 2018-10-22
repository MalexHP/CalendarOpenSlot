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
                // Otherwise continue looking for matches
                findOpenSlots(init, duration)
            }
            ++init;
            ++duration;
        }

        // if (matchedElements.length) {
        //     matchedElements = userMatch.filter(people => people.length > 0);
        // }

        //HELP FUNCTIONS
        function getUsersMatchDay(appointments) { // Gets the users that has an appointment in the selected day
            let someDayMatch = false;
            for (let i=0; i < appointments.length; i++) {
                if (appointments[i].day == currentDay) {
                    someDayMatch = true;
                }
            }
            return someDayMatch;
        } //End matchAvailability() > getUsersMatchDay();

        function findOpenSlots(ini, duration) {
            for (let j = 0; j < arrAvailabilityLength; j++) {
                if (userMatchedId.indexOf(arrAvailability[j].userId) <= 0 && endRange < ini) {
                    /* This If conditional is to avoid doing unnecessary iterations as long as the
                       ini and duration values are in the range of the respective person matched 
                    */
                    if (matchedElements.indexOf(arrAvailability[j]) === -1 && findAvailability(arrAvailability[j], ini, duration)) {
                        matchedElements.push(arrAvailability[j]);
                    }
                }
            }
            if (matchedElements.length === arrAvailabilityLength) {
                userMatchedId = [];
                freeSchedule.push({
                    "ini": minsConverter(ini, 'turn'),
                    "end": minsConverter(duration, 'turn')
                });
                return matchedElements;
            } else {
                if (userMatchedId.length) { // Review if it has been matches before perform unnecessary operations
                    if (iniRange < ini && endRange < duration && findUserIdsMatches()) {
                        userMatchedId = [];
                    }
                }
                return [];
            }

            // HELP FUNCTIONS
            function findUserIdsMatches() {
                let proveVal;
                for (let i = 0; i < arrAvailabilityLength; i++) {
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

                if (ini >= bookDayStart && duration <= bookDayEnd) {
                    userMatchedId.push(person.userId);
                    iniRange = bookDayStart;
                    endRange = bookDayEnd;
                    return true;

                } else if (ini > bookDayStart && duration > bookDayEnd && ini < bookDayEnd && (bookDayEnd - ini) >= (duration - ini)) {
                    userMatchedId.push(person.userId);
                    iniRange = bookDayStart;
                    endRange = bookDayEnd;
                    return true;
                } else if (ini < bookDayStart && duration < bookDayEnd && duration > bookDayStart && (duration - bookDayStart) >= (duration - ini)) {
                    userMatchedId.push(person.userId);
                    iniRange = bookDayStart;
                    endRange = bookDayEnd;
                    return true;
                } else {
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

    // HELP FUNCTIONS   
    function minsConverter(hour, hourType) {
        // This will transform hours (hh:mm) into minutes and the other way around
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
        }
        return convertedMins;
    } // End minsConverter()

})();