pragma solidity ^0.6.6;

contract Challenge {
    address owner; // address of owner of contract

    uint256 lastChallengeId;
    mapping(uint256 => address) ownerOfChallenge; // [challengeId] = address of owner of challenge

    mapping(uint256 => uint256) lastAchieverId; // [challengeId] = last id of achiever in current challenge
    mapping(uint256 => mapping(uint256 => address)) achievers; // [challengeId][indexOfAchiever] = address of achiever
    mapping(uint256 => mapping(address => bool)) isAchiever; // [challengeId][addressOfAchiever] = is user an achiever in current challenge?

    mapping(uint256 => uint256) lastObserverId; // [challengeId] = last id of observer in current challenge
    mapping(uint256 => mapping(uint256 => address)) observers; // [challengeId][indexOfObserver] = address of observer
    mapping(uint256 => mapping(address => bool)) isObserver; // [challengeId][addressOfObserver] = is user an observer in current challenge?

    mapping(uint256 => uint256) guarantee; // [challengeId] = guarantee sum of wei
    mapping(uint256 => uint256) fine; // [challengeId] = sum of fine in wei

    mapping(uint256 => uint256) start; // [challengeId] = date of start of challenge
    mapping(uint256 => mapping(uint256 => uint256)) schedule; // [challengeId][indexOfItem] = duration of every schedule period in seconds
    mapping(uint256 => uint256) lastSchedulePeriodId; // [challengeId] = index of last schedule period
    mapping(uint256 => uint256) idOfCurrentPeriod; // [challengeId] = index of current schedule period (stage of doing challenge)
    mapping(uint256 => uint256) startTimeOfCurrentPeriod; // [challengeId] = date of start of current schedule period (stage of doing challenge)
    mapping(uint256 => mapping(uint256 => bool)) scheduleDone; // [challengeId][indexOfItem] = result of schedule period (done or not) (stage of doing challenge)

    mapping(uint256 => mapping(uint256 => uint256)) scheduleFineAvailable; // [challengeId][index] = index of schedule period for what fine taking is available
    mapping(uint256 => uint256) lastIdOfScheduleFineAvailable; // [challengeId] = last index of mapping scheduleFineAvailable

    constructor() public {
        owner = msg.sender;
    }

    function addChallenge(uint256 _start, uint256 _guarantee, uint256 _fine) public {
        require(_guarantee >= _fine, "Sum of guarantee should be either equal or greater than sum of fine");

        lastChallengeId++;

        ownerOfChallenge[lastChallengeId] = msg.sender;

        start[lastChallengeId] = _start;

        guarantee[lastChallengeId] = _guarantee;
        fine[lastChallengeId] = _fine;
    }

    function addAchiever(uint256 _challengeId, uint256 _sumOfWei) public returns (uint256) {
        require(lastChallengeId >= _challengeId && _challengeId > 0, "Challenge ID doesn't exist");
        require(_sumOfWei >= guarantee[_challengeId], "Sum of wei is less than required guarantee sum.");
        require(!isAchiever[_challengeId][msg.sender], "This achiever is already exist");
        require(idOfCurrentPeriod[_challengeId] == 0, "Challenge has already started.");
        require(idOfCurrentPeriod[_challengeId] <= lastSchedulePeriodId[_challengeId], "Challenge has already finished.");

        lastAchieverId[_challengeId]++;
        achievers[_challengeId][lastAchieverId[_challengeId]] = msg.sender;
        isAchiever[_challengeId][msg.sender] = true;

        return guarantee[_challengeId];
    }

    function addToSchedule(uint256 _challengeId, uint256[10] memory _schedulePeriods) public {
        require(msg.sender == ownerOfChallenge[_challengeId], "Only owner of challenge can add period to schedule");
        require(idOfCurrentPeriod[_challengeId] <= lastSchedulePeriodId[_challengeId], "Challenge has already finished.");

        uint256 nextSchedulePeriodId = 0;
        for(uint256 i = 0; i < 10; i++) {
            nextSchedulePeriodId = ++lastSchedulePeriodId[_challengeId];
            schedule[_challengeId][nextSchedulePeriodId] = _schedulePeriods[i];
        }
    }

    function startChallenge(uint256 _challengeId) public {
        require(lastChallengeId >= _challengeId && _challengeId > 0, "Challenge ID doesn't exist");
        require(msg.sender == ownerOfChallenge[_challengeId], "Only owner of challenge can start challenge");
        require(idOfCurrentPeriod[_challengeId] == 0, "Challenge has already started.");
        require(lastAchieverId[_challengeId] > 0, "There are no achievers");
        require(lastObserverId[_challengeId] > 0, "There are no observers");

        if (now > start[_challengeId]) {
            start[_challengeId] = now;
        }

        idOfCurrentPeriod[_challengeId]++;
        startTimeOfCurrentPeriod[_challengeId] = start[_challengeId];
    }

    function setDoneForPeriod(uint256 _challengeId) public {
        require(lastChallengeId >= _challengeId, "Challenge ID doesn't exist");
        require(isAchiever[_challengeId][msg.sender], "Only achiever of challenge can set done for period");
        require(idOfCurrentPeriod[_challengeId] <= lastSchedulePeriodId[_challengeId], "Challenge has already finished.");

        uint256 endTimeOfCurrentScheduleItem = startTimeOfCurrentPeriod[_challengeId] + schedule[_challengeId][idOfCurrentPeriod[_challengeId]];
        require(endTimeOfCurrentScheduleItem >= now, "Current schedule period has already completed. At first you need to use function calcCurrentScheduleItem()");

        scheduleDone[_challengeId][idOfCurrentPeriod[_challengeId]] = true;

        // Start new schedule period
        idOfCurrentPeriod[_challengeId]++;
        startTimeOfCurrentPeriod[_challengeId] = endTimeOfCurrentScheduleItem;
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