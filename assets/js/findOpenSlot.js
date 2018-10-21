/*

    This files contains all the heavy logic to find an open slot in the User's calendar.

    The names of variables and functions try to be semantic and self explanatory

    The main method here will return an array with objects to render in the UI, once the query was sent and if it was successful:

    [
    {'dates': 
            [{'ini':'14:10','end':'15:16'},{'ini':'17:18','end':'21:50'}] //Represents the available time ranges 
        },
        {'usersAvailable':4}  // This will display how many users had appointments but still are available in a certain time range
    ]

    usersAppointments is handling the UI.


*/

let findOpenSlot = (function() {
    let userMatch = [];
    let userMatchedId = [];
    let iniRange = 0, endRange = 0;
    
    function matchAvailability(e, data) {
        let resp = JSON.parse(JSON.stringify(data));
        let event = e;
        let init = 0;
        let duration = 30;
        let matchedElements = [];
        let freeSchedule = [];
        let currentDay = 4;
                
        let usersWithAppointments = resp.data.filter(user => {
            if (user.appointments.length) {
               return getUsersMatchDay(user.appointments);
            }
        });

        let arrAvailability = usersWithAppointments.map(user => setAppointmentStartEnd(user));
        let arrAvailabilityLength = arrAvailability.length;

        let iterations = (14 * 60) - duration; 

        for (let i = 0; i < iterations; i++) {
            if (matchedElements.length === usersWithAppointments.length) {
                matchedElements = [];
            } else {
                userMatch.push(findOpenSlots(init,duration));
            }
            ++init;
            ++duration;
        }

        console.log('freeSchedule');
        console.log(freeSchedule);
       
        let cleanArrUsersAvailable = userMatch.filter( people => people.length > 0);
        console.log('xxxxxxxxxxxxx FINAL VAL xxxxxxxxxxxxxxxxxxx');
        console.log(cleanArrUsersAvailable);
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
       //alert(cleanArrUsersAvailable);

        function getUsersMatchDay(appointments) {
            let someDayMatch = false;
            appointments.forEach( days => {
                if (days.day == currentDay) {
                    someDayMatch = true;
                }
            }); 
            return someDayMatch;
        }//End matchAvailability() > getUsersMatchDay();

        function findOpenSlots(ini,duration) {             
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
                      console.log('IS A MATCH');                      
                      console.log("ini: " + ini);
                      console.log("duration: " + duration) 
                      console.log(arrAvailability[j]);   
                      matchedElements.push(arrAvailability[j]);     
                      console.log(matchedElements);           
                      console.log('****************************');    
                    }
                }
            }
            // console.log(':::::::::::::::::::::::::::');
            // console.log(matchedElements); 
            // console.log(':::::::::::::::::::::::::::');
            if (matchedElements.length === arrAvailabilityLength) {
                console.log("***********************FULL MATCH YATAHHH*****************");
                userMatchedId = [];
                freeSchedule.push({ "initial" : ini, "final": duration});
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
            function findUserIdsMatches(){
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
            }//End matchAvailability() > findOpenSlots() > findUserIdsMatches()

        }//End matchAvailability() > findOpenSlots();

        function findAvailability(person, ini, duration) {
            return person.availability.some( bookDay => { 
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

                } else if (ini > bookDayStart && duration > bookDayEnd && ini < bookDayEnd && (bookDayEnd-ini) >= (duration-ini)) {
                   userMatchedId.push(person.userId);
                   iniRange = bookDayStart;
                   endRange = bookDayEnd;
                //    console.log('ini mayor start y duration mayor end');                   
                //    console.log('person.userId: ' + person.userId);
                //    console.log('userMatchedId: ' + userMatchedId);
                //    console.log(person);  
                //    console.log('****************************'); 
                    return true;
                } else if (ini < bookDayStart && duration < bookDayEnd && duration > bookDayStart && (duration-bookDayStart) >= (duration-ini)) {
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
        }//End matchAvailability() > findAvailability();

        function setAppointmentStartEnd(user) {
            let availability = user.appointments.map( endStart => {
                return {
                    "start": minsConverter(endStart.start, 'hrs'),
                    "end": minsConverter(endStart.end, 'hrs'),
                }
            });
            return {
                "userId": user.userId,
                "availability": availability
            }
        }//End matchAvailability() > setAppointmentStartEnd()

    }//End matchAvailability()

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
            convertedMins = Math.floor( hour / 60) + ':' + mins;
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