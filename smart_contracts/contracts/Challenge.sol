pragma solidity ^0.6.6;

contract Challenge {
    uint256 lastChallengeId;

    mapping(uint256 => address) owner; // [challengeId] = address of owner of challenge

    mapping(uint256 => uint256) lastAchieverId; // [challengeId] = last id of achiever in current challenge
    mapping(uint256 => mapping(uint256 => address)) achievers; // [challengeId][indexOfAchiever] = address of achiever

    mapping(uint256 => uint256) lastObserverId; // [challengeId] = last id of observer in current challenge
    mapping(uint256 => mapping(uint256 => address)) observers; // [challengeId][indexOfObserver] = address of observer

    mapping(uint256 => mapping(uint256 => uint256)) guarantee; // [challengeId][indexOfAchiever] = guarantee sum of wei
    mapping(uint256 => mapping(uint256 => uint256)) fine; // [challengeId][indexOfAchiever] = sum of fine in wei

    mapping(uint256 => uint256) start; // [challengeId] = date of start of challenge
    mapping(uint256 => mapping(uint256 => uint256)) schedule; // [challengeId][indexOfItem] = duration of every schedule period in seconds
    mapping(uint256 => uint256) lastSchedulePeriodId; // [challengeId] = index of last schedule period
    mapping(uint256 => uint256) idOfCurrentPeriod; // [challengeId] = index of current schedule period (stage of doing challenge)
    mapping(uint256 => uint256) startTimeOfCurrentPeriod; // [challengeId] = date of start of current schedule period (stage of doing challenge)
    mapping(uint256 => mapping(uint256 => bool)) scheduleDone; // [challengeId][indexOfItem] = result of schedule period (done or not) (stage of doing challenge)

    mapping(uint256 => mapping(uint256 => uint256)) scheduleFineAvailable; // [challengeId][index] = index of schedule period for what fine taking is available
    mapping(uint256 => uint256) lastIdOfScheduleFineAvailable; // [challengeId] = last index of mapping scheduleFineAvailable

    function addChallenge(uint256 _start, address _observer, uint256 _guarantee, uint256 _fine) public {
        require(_guarantee >= _fine, "Sum of guarantee should be either equal or greater than sum of fine");

        lastChallengeId++;

        owner[lastChallengeId] = msg.sender;

        start[lastChallengeId] = _start;

        lastAchieverId[lastChallengeId]++;
        achievers[lastChallengeId][lastAchieverId[lastChallengeId]] = msg.sender;

        lastObserverId[lastChallengeId]++;
        observers[lastChallengeId][lastObserverId[lastChallengeId]] = _observer;

        guarantee[lastChallengeId][lastAchieverId[lastChallengeId]] = _guarantee;
        fine[lastChallengeId][lastAchieverId[lastChallengeId]] = _fine;
    }

    function addToSchedule(uint256 _challengeId, uint256[10] memory _schedulePeriods) public {
        require(msg.sender == owner[_challengeId], "Only owner of challenge can add period to schedule");
        require(idOfCurrentPeriod[_challengeId] <= lastSchedulePeriodId[_challengeId], "Challenge has already finished.");

        uint256 nextScheduleItemId = 0;
        for(uint256 i = 0; i < 10; i++) {
            nextScheduleItemId = ++lastSchedulePeriodId[_challengeId];
            schedule[_challengeId][nextScheduleItemId] = _schedulePeriods[i];
        }
    }

    function startChallenge(uint256 _challengeId) public {
        require(lastChallengeId >= _challengeId && _challengeId > 0, "Challenge ID doesn't exist");
        require(msg.sender == owner[_challengeId], "Only owner of challenge can start challenge");
        require(idOfCurrentPeriod[_challengeId] == 0, "Challenge has already started.");

        if (now > start[_challengeId]) {
            start[_challengeId] = now;
        }

        idOfCurrentPeriod[_challengeId]++;
        startTimeOfCurrentPeriod[_challengeId] = start[_challengeId];
    }

    function setDoneForPeriod(uint256 _challengeId) public {
        require(lastChallengeId >= _challengeId, "Challenge ID doesn't exist");
        require(msg.sender == achievers[_challengeId][1], "Only achiever of challenge can set done for period");
        require(idOfCurrentPeriod[_challengeId] <= lastSchedulePeriodId[_challengeId], "Challenge has already finished.");

        uint256 endTimeOfCurrentScheduleItem = startTimeOfCurrentPeriod[_challengeId] + schedule[_challengeId][idOfCurrentPeriod[_challengeId]];
        require(endTimeOfCurrentScheduleItem >= now, "Current schedule period has already completed. At first you need to use function calcCurrentScheduleItem()");

        scheduleDone[_challengeId][idOfCurrentPeriod[_challengeId]] = true;

        // Start new schedule period
        idOfCurrentPeriod[_challengeId]++;
        startTimeOfCurrentPeriod[_challengeId] = endTimeOfCurrentScheduleItem + 1;
    }

    function calcCurrentPeriod(uint256 _challengeId) public returns(bool) {
        require(startTimeOfCurrentPeriod[_challengeId] + schedule[_challengeId][idOfCurrentPeriod[_challengeId]] > now, "Current schedule period is actual.");
        require(idOfCurrentPeriod[_challengeId] <= lastSchedulePeriodId[_challengeId], "Challenge has already finished.");

        uint256 sizeOfChunk = 10; // limit amount of periods to avoid exceeding limit of gas
        bool isActual = false;
        for (uint256 i = idOfCurrentPeriod[_challengeId]; i <= idOfCurrentPeriod[_challengeId] + sizeOfChunk; i++) {
            if (startTimeOfCurrentPeriod[_challengeId] + schedule[_challengeId][i] <= now) {
                if (scheduleDone[_challengeId][i] == false) {
                    // Add element to scheduleFineAvailable. Observer can get fine for this period.
                    lastIdOfScheduleFineAvailable[_challengeId]++;
                    scheduleFineAvailable[_challengeId][lastIdOfScheduleFineAvailable[_challengeId]] = i;
                }

                // Go to the next period
                startTimeOfCurrentPeriod[_challengeId] += schedule[_challengeId][i];
                idOfCurrentPeriod[_challengeId]++;
            } else {
                // Current period is actual
                isActual = true;
                break;
            }
        }

        return isActual;
    }
}