pragma solidity ^0.6.6;
import './Wallet.sol';

contract Challenge {
    address public owner; // address of owner of contract

    address payable public walletAddress;
    Wallet walletContract;
    bool public isSetWallet;

    uint256 public lastChallengeId;
    mapping(uint256 => address) public ownerOfChallenge; // [challengeId] = address of owner of challenge

    mapping(uint256 => uint256) public lastAchieverId; // [challengeId] = last id of achiever in current challenge
    mapping(uint256 => mapping(uint256 => address)) public achievers; // [challengeId][indexOfAchiever] = address of achiever
    mapping(uint256 => mapping(address => bool)) public isAchiever; // [challengeId][addressOfAchiever] = is user an achiever in current challenge?
    mapping(uint256 => uint256) public amountOfFinishedAchievers; // [challengeId] = amount of finished achievers

    mapping(uint256 => uint256) public lastObserverId; // [challengeId] = last id of observer in current challenge
    mapping(uint256 => mapping(uint256 => address)) public observers; // [challengeId][indexOfObserver] = address of observer
    mapping(uint256 => mapping(address => bool)) public isObserver; // [challengeId][addressOfObserver] = is user an observer in current challenge?

    mapping(uint256 => uint256) public guarantee; // [challengeId] = guarantee sum of wei
    mapping(uint256 => uint256) public fine; // [challengeId] = sum of fine in wei

    mapping(uint256 => bool) public isStarted; // [challengeId] = is challenge started?
    mapping(uint256 => mapping(address => bool)) public isFinishedForAchiever; // [challengeId][addressOfAchiever = is challenge fihished for the achiever?
    mapping(uint256 => uint256) public start; // [challengeId] = date of start of challenge
    mapping(uint256 => mapping(uint256 => uint256)) public schedule; // [challengeId][indexOfItem] = duration of every schedule period in seconds
    mapping(uint256 => uint256) public lastSchedulePeriodId; // [challengeId] = index of last schedule period
    mapping(uint256 => mapping(address => uint256)) public idOfCurrentPeriod; // [challengeId][addressOfAchiever] = index of current schedule period for achiever (stage of doing challenge)
    mapping(uint256 => mapping(address => uint256)) public startTimeOfCurrentPeriod; // [challengeId][addressOfAchiever] = date of start of current schedule period for achiever (stage of doing challenge)
    mapping(uint256 => mapping(address => mapping(uint256 => bool))) public scheduleDone; // [challengeId][addressOfAchiever][indexOfItem] = result of schedule period (done or not) for achiever (stage of doing challenge)

    mapping(uint256 => mapping(uint256 => uint256)) public fineAvailableForPeriod; // [challengeId][fineId] = index of schedule period for what fine taking is available
    mapping(uint256 => mapping(uint256 => address)) public fineAvailableForAchiever; // [challengeId][fineId] = address of achiever for whom fine taking is available
    mapping(uint256 => mapping(address => uint256)) public amountOfFinesAvailableForAchiever; // [challengeId][addressOfAchiever] = amount of fines available for achiever
    mapping(uint256 => mapping(uint256 => bool)) public fineTaken; // [challengeId][fineId] = Is fine taken or not?
    mapping(uint256 => uint256) public lastFineId; // [challengeId] = last fine id in challenge

    constructor() public {
        owner = msg.sender;
    }

    receive() external payable {
        require(false, "Contract Challenge doesn't accept payments.");
    }

    function setContractWallet(address payable _walletAddress) public {
        require(owner == msg.sender, "Only owner can set contract Wallet");
        require(!isSetWallet, "Contract Wallet has already set");

        walletAddress = _walletAddress;
        walletContract = Wallet(_walletAddress);
        isSetWallet = true;
    }

    function addChallenge(uint256 _start, uint256 _guarantee, uint256 _fine) public {
        require(isSetWallet, "Contract Wallet has to be set.");
        require(_guarantee >= _fine, "Sum of guarantee should be either equal or greater than sum of fine");

        lastChallengeId++;

        ownerOfChallenge[lastChallengeId] = msg.sender;

        start[lastChallengeId] = _start;

        guarantee[lastChallengeId] = _guarantee;
        fine[lastChallengeId] = _fine;
    }

    function becomeAchiever(uint256 _challengeId, address _achiever, uint256 _sumOfWei) external returns (uint256) {
        require(lastChallengeId >= _challengeId && _challengeId > 0, "Challenge ID doesn't exist");
        require(msg.sender == walletAddress, "Sender isn't contract Wallet.");
        require(_sumOfWei >= guarantee[_challengeId], "Sum of wei is less than required guarantee sum.");
        require(!isAchiever[_challengeId][_achiever], "This achiever is already exist");
        require(!isObserver[_challengeId][_achiever], "This user has already become achiever");
        require(!isStarted[_challengeId], "Challenge has already started.");

        uint256 nextAchieverId = ++lastAchieverId[_challengeId];
        achievers[_challengeId][nextAchieverId] = _achiever;
        isAchiever[_challengeId][_achiever] = true;

        return guarantee[_challengeId];
    }

    function addObservers(uint256 _challengeId, address[10] memory _observers) public {
        require(msg.sender == ownerOfChallenge[_challengeId], "Only owner of challenge can add observer to schedule");
        require(lastChallengeId >= _challengeId && _challengeId > 0, "Challenge ID doesn't exist");
        require(!isStarted[_challengeId], "Challenge has already started.");

        uint256 nextObserverId = 0;
        for(uint256 i = 0; i < 10; i++) {
            if (_observers[i] == address(0)) {break;} // if it is empty element, finish adding observers

            require(!isObserver[_challengeId][_observers[i]], "This observer is already exist");
            require(!isAchiever[_challengeId][_observers[i]], "This user has already become achiever");
            nextObserverId = ++lastObserverId[_challengeId];
            observers[_challengeId][nextObserverId] = _observers[i];
            isObserver[_challengeId][_observers[i]] = true;
        }
    }

    function becomeObserver(uint256 _challengeId) public {
        require(lastChallengeId >= _challengeId && _challengeId > 0, "Challenge ID doesn't exist");
        require(!isObserver[_challengeId][msg.sender], "This observer is already exist");
        require(!isAchiever[_challengeId][msg.sender], "This user has already become achiever");
        require(!isStarted[_challengeId], "Challenge has already started.");

        uint256 nextObserverId = ++lastObserverId[_challengeId];
        observers[_challengeId][nextObserverId] = msg.sender;
        isObserver[_challengeId][msg.sender] = true;
    }

    function addToSchedule(uint256 _challengeId, uint256[10] memory _schedulePeriods) public {
        require(msg.sender == ownerOfChallenge[_challengeId], "Only owner of challenge can add period to schedule");
        require(!isStarted[_challengeId], "Challenge has already started.");

        uint256 nextSchedulePeriodId = 0;
        for(uint256 i = 0; i < 10; i++) {
            if (_schedulePeriods[i] == 0) {break;} // if it is empty element, finish adding schedule periods

            nextSchedulePeriodId = ++lastSchedulePeriodId[_challengeId];
            schedule[_challengeId][nextSchedulePeriodId] = _schedulePeriods[i];
        }
    }

    function startChallenge(uint256 _challengeId) public {
        require(lastChallengeId >= _challengeId && _challengeId > 0, "Challenge ID doesn't exist");
        require(msg.sender == ownerOfChallenge[_challengeId], "Only owner of challenge can start challenge");
        require(!isStarted[_challengeId], "Challenge has already started.");
        require(lastSchedulePeriodId[_challengeId] > 0, "There are no periods in schedule");
        require(lastAchieverId[_challengeId] > 0, "There are no achievers");
        require(lastObserverId[_challengeId] > 0, "There are no observers");

        if (now > start[_challengeId]) {
            start[_challengeId] = now;
        }

        isStarted[_challengeId] = true;
    }

    function setDoneForPeriod(uint256 _challengeId) public {
        require(lastChallengeId >= _challengeId, "Challenge ID doesn't exist");
        require(isStarted[_challengeId], "Challenge isn't started.");

        address achiever = msg.sender;
        require(isAchiever[_challengeId][achiever], "Only achiever of challenge can set done for period");

        uint256 _idOfCurrentPeriod = idOfCurrentPeriod[_challengeId][achiever];
        uint256 _lastSchedulePeriodId = lastSchedulePeriodId[_challengeId];
        if (_idOfCurrentPeriod == 0) {
            // Assign started values for the first period
            startTimeOfCurrentPeriod[_challengeId][achiever] = start[_challengeId];
            idOfCurrentPeriod[_challengeId][achiever]++;
            _idOfCurrentPeriod++;
        }
        require(_idOfCurrentPeriod <= _lastSchedulePeriodId, "Challenge for this achiever has already finished.");

        uint256 endTimeOfCurrentPeriod = startTimeOfCurrentPeriod[_challengeId][achiever] + schedule[_challengeId][_idOfCurrentPeriod];
        require(endTimeOfCurrentPeriod >= now, "Current schedule period has already completed. At first you need to use function calcCurrentScheduleItem()");

        scheduleDone[_challengeId][achiever][_idOfCurrentPeriod] = true;

        // Start new schedule period
        _idOfCurrentPeriod = ++idOfCurrentPeriod[_challengeId][achiever];
        startTimeOfCurrentPeriod[_challengeId][achiever] = endTimeOfCurrentPeriod;

        // Check if achiever has finished the challenge
        if (_idOfCurrentPeriod > _lastSchedulePeriodId) {
            amountOfFinishedAchievers[_challengeId]++;
        }
    }

    function calcCurrentPeriod(uint256 _challengeId, address _achiever) public returns(bool) {
        require(lastChallengeId >= _challengeId, "Challenge ID doesn't exist");
        require(isStarted[_challengeId], "Challenge isn't started.");
        require(isAchiever[_challengeId][_achiever], "This achiever doesn't exist");

        uint256 _idOfCurrentPeriod = idOfCurrentPeriod[_challengeId][_achiever];
        uint256 _lastSchedulePeriodId = lastSchedulePeriodId[_challengeId];
        if (_idOfCurrentPeriod == 0) {
            // Assign started values for the first period
            startTimeOfCurrentPeriod[_challengeId][_achiever] = start[_challengeId];
            idOfCurrentPeriod[_challengeId][_achiever]++;
            _idOfCurrentPeriod++;
        }
        require(_idOfCurrentPeriod <= _lastSchedulePeriodId, "Challenge for this achiever has already finished.");

        uint256 _startTimeOfCurrentPeriod = startTimeOfCurrentPeriod[_challengeId][_achiever];
        require(_startTimeOfCurrentPeriod + schedule[_challengeId][_idOfCurrentPeriod] <= now, "Current schedule period is actual.");

        uint256 maxIdOfPeriodForCurrentChunk = _idOfCurrentPeriod + 10; // limit amount of periods to avoid exceeding limit of gas
        bool isActual = false;
        uint256 _lastFineId = 0;
        uint256 endTimeOfCurrentPeriod = 0;
        for (uint256 i = _idOfCurrentPeriod; i <= maxIdOfPeriodForCurrentChunk; i++) {
            endTimeOfCurrentPeriod = _startTimeOfCurrentPeriod + schedule[_challengeId][i];
            if (endTimeOfCurrentPeriod <= now) {
                // Add element into mappings fineAvailableForPeriod and fineAvailableForAchiever. Observer can get fine for this period and achiever.
                _lastFineId = ++lastFineId[_challengeId];
                fineAvailableForPeriod[_challengeId][_lastFineId] = i;
                fineAvailableForAchiever[_challengeId][_lastFineId] = _achiever;
                amountOfFinesAvailableForAchiever[_challengeId][_achiever]++;

                // Go to the next period
                _startTimeOfCurrentPeriod = endTimeOfCurrentPeriod;
                _idOfCurrentPeriod++;
            } else {
                // Current period is actual
                isActual = true;
                break;
            }
        }

        startTimeOfCurrentPeriod[_challengeId][_achiever] = _startTimeOfCurrentPeriod;
        idOfCurrentPeriod[_challengeId][_achiever] = _idOfCurrentPeriod;

        // Check if achiever has finished the challenge
        if (_idOfCurrentPeriod > _lastSchedulePeriodId) {
            amountOfFinishedAchievers[_challengeId]++;
        }

        return isActual;
    }

    function takeFineForChallenge(uint256 _challengeId, uint256 _fineId, address _observer) external returns(address, uint256) {
        require(lastChallengeId >= _challengeId, "Challenge ID doesn't exist");
        require(msg.sender == walletAddress, "Sender isn't contract Wallet.");
        require(lastFineId[_challengeId] >= _fineId, "Fine ID doesn't exist");
        require(isObserver[_challengeId][_observer], "User isn't observer.");
        require(!fineTaken[_challengeId][_fineId], "Fine is already taken.");

        address achiever = fineAvailableForAchiever[_challengeId][_fineId];

        fineTaken[_challengeId][_fineId] = true;
        amountOfFinesAvailableForAchiever[_challengeId][achiever]--;

        return (achiever, fine[_challengeId]);
    }

    function finishChallenge(uint256 _challengeId, address _achiever) public {
        require(lastChallengeId >= _challengeId, "Challenge ID doesn't exist");
        require(isAchiever[_challengeId][_achiever], "User from parameter '_achiever' has to be an achiever.");
        require(idOfCurrentPeriod[_challengeId][_achiever] > lastSchedulePeriodId[_challengeId], "Challenge for this achiever is continued.");
        require(amountOfFinesAvailableForAchiever[_challengeId][_achiever] == 0, "All of the fines has to be taken from achiever.");
        require(!isFinishedForAchiever[_challengeId][_achiever], "Challenge is already finished for the achiever.");

        isFinishedForAchiever[_challengeId][_achiever] = true;
        walletContract.finishChallenge(_challengeId, _achiever);
    }
}