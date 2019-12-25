pragma solidity ^0.6.0;

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
    mapping(uint256 => mapping(uint256 => uint256)) schedule; // [challengeId][indexOfItem] = duration of every item of schedule
    mapping(uint256 => uint256) lastScheduleItemId; // [challengeId] = index of last schedule item
    mapping(uint256 => uint256) idOfCurrentScheduleItem; // [challengeId] = index of current schedule item
    mapping(uint256 => uint256) startTimeOfCurrentScheduleItem; // [challengeId] = date of start of current item of schedule
    mapping(uint256 => mapping(uint256 => bool)) scheduleDone; // [challengeId][indexOfItem] = result of item of schedule (done or not)
    mapping(uint256 => mapping(uint256 => bool)) scheduleFineTaken; // [challengeId][indexOfItem] = Is fine of item of schedule taken or not?
}