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
                "localData": localData,
                "durationTime": durationTime,
                "minsHours": minsHours
            }
*/

let findOpenSlot = (function() {
    /* iniRange and  endRange will be set once the first match occurred, so the iteration for this object will be avoided 
       untill ini and duration are out of range, meaning that there are no intersections 
    */
    let matchedElementsCounter;
    let iniRange = 0,
        endRange = 0;

    function matchAvailability(objConfig) { console.log(objConfig);
        let resp = JSON.parse(JSON.stringify(objConfig.localData));
        let currentDay = objConfig.currentDay;
        // checkin and checkout represents the working time
        let checkIn = minsConverter(8, 'hrs'); // conversts hh:mm format time to mins, 24 hoursbase
        let checkOut = minsConverter(18, 'hrs'); // conversts hh:mm format time to mins, 24 hoursbase
        let init = checkIn; // init is used as the starting point to find an intersection in the time range of the user's availability
        let duration = checkIn + minsConverter(parseInt(objConfig.durationTime), objConfig.minsHours); // duration is the end point of the intersection, taking care of the duration range set in the query        
        let matchedElements = []; // This array will hold all the open slots        
        let openSlots = [];
        let usersAvailable;
        let usersWithAppointments = resp.filter(user => {
            /* This gets all the users that has an booked appointment,
               from here the script will try to find available time according to the duration set and the chosen day.
               Caveat: Will return the user with at least one matched day, but appointments has also other days.
               This can be fixed redefining the dummy-data json.
               This is fixed provisionally in getUsersMatchDay()
            */ 
            if (user.appointments.length) { // The {} could be omitted, but I think is a good practice to use them to define the block   
                return getUsersMatchDay(user.appointments);
            }
        });
        console.log(usersWithAppointments);
        // Creates a formated object, from the users with booked appointments, needed for future work      
        let arrAvailability = usersWithAppointments.map(user => appointmentStartEnd(user));
 
        let arrAvailabilityLength = arrAvailability.length; // This catch the length, because the value is used more than once and this helps performance
        
        for (let i = checkIn; i <= checkOut; i++) { 
            /*
              This loop will iterate all the working day range, to find all possible intersections according to duration.
              One person could have more than one open slot, that is why the loop does not break.
            */
            findOpenSlots(init, duration)
            ++init;
            ++duration;
        }

        // if (matchedElements.length) {
        //     matchedElements = userMatch.filter(people => people.length > 0);
        // }

        openSlots.length ? usersAvailable = arrAvailabilityLength : usersAvailable = 0;

        //HELP FUNCTIONS
        function getUsersMatchDay(appointments) { // Gets the users that has an appointment in the selected day
            let someDayMatch = false;            
            for (let i=0; i < appointments.length; i++) {
                if (appointments[i].day == currentDay) {
                    someDayMatch = true;
                } else { 
                    /* This is a cheap way to fix the issue with the structure of the data received, this approach could be better
                       {
                           "day": X,
                           "dayDetails" : [] // Array of all the details of the appointments of the day X (subject, start, end)
                       }
                    */
                    appointments[i].start = 0;
                    appointments[i].end = 0;
                }
            }
            return someDayMatch;
        } //End matchAvailability() > getUsersMatchDay();

        function findOpenSlots(ini, duration) {
            for (let j = 0; j < arrAvailabilityLength; j++) {
                if (matchedElements.indexOf(arrAvailability[j]) === -1 && findAvailability(arrAvailability[j], ini, duration)) {
                    // console.log('IS A MATCH');
                    // console.log(arrAvailability[j]);
                    // console.log(ini);
                    // console.log(duration);
                    matchedElements.push(arrAvailability[j]);
                }
            }
            if (matchedElements.length === arrAvailabilityLength) {
                // All users have to be available according to the requirement
                console.log('************ YATHAAA ************')
                openSlots.push({ //Saves the open slot where all the users with appointments are available for the "duration" time
                    "ini": minsConverter(ini, 'turn'),
                    "end": minsConverter(duration, 'turn')
                });
                matchedElements = [];                
            } else {
                console.log('************ ABORT NO FULL ************')
                matchedElements = []; // Resets any saved match
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

            return matchedElements;

        } //End matchAvailability() > findOpenSlots();

        function findAvailability(person, ini, duration) {
            return person.availability.some(bookDay => {
                /*
                    Each user can have more than one appointment in a day,
                    it is not possible to have two appointments in a day at the same hours,
                    that is why only it is needed a result (some)
                */
                let bookDayStart = bookDay.start; // The bookDay.start and bookDay.end values are catched
                let bookDayEnd = bookDay.end;

                if (ini >= bookDayStart && duration <= bookDayEnd) {
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

        console.log("openSlots");
        console.log(openSlots);
        console.log('arrAvailability');
        console.log(arrAvailability);
        console.log("matchedElements");
        console.log(arrAvailabilityLength);

        return [{
                'dates': openSlots
            },
            {
                'usersAvailable': usersAvailable
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
            convertedMins = parseInt(hour);
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

    return {
        matchAvailability: matchAvailability
    }

})();