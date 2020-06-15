pragma solidity ^0.6.6;
import './Challenge.sol';

contract Wallet {
    address public owner;

    mapping(address => uint256) balance; // [user] = sum of wei on the balance of current user
    mapping(address => uint256) public reservedSumFromUser; // [user] = sum of wei of current user that is reserved
    mapping(uint256 => mapping(address => uint256)) public reservedSumFromUserForChallenge; // [challenge][user] = sum of wei of current user for challenge

    address public challengeAddress;
    Challenge challengeContract;
    bool public isSetChallenge;

    constructor() public {
        owner = msg.sender;
    }

    function setContractChallenge(address _challengeAddress) public {
        require(owner == msg.sender, "Only owner can set contract Challenge");
        require(!isSetChallenge, "Contract Challenge has already set");

        challengeAddress = _challengeAddress;
        challengeContract = Challenge(challengeAddress);
        isSetChallenge = true;
    }

    function becomeAchiever(uint256 _challengeId) payable public {
        require(isSetChallenge, "Contract Challenge has to be set.");
        require(_challengeId > 0, "Challenge ID doesn't exist.");

        uint256 sumOfGuarantee = challengeContract.becomeAchiever(_challengeId, msg.value);

        reservedSumFromUserForChallenge[_challengeId][msg.sender] = sumOfGuarantee;
        reservedSumFromUser[msg.sender] += sumOfGuarantee;
        balance[msg.sender] += msg.value;
    }

    function takeFineForChallenge(uint256 _challengeId, uint256 _fineId, address _observer) public {
        require(isSetChallenge, "Contract Challenge has to be set.");

        (address achiever, uint256 sumOfFine) = challengeContract.takeFineForChallenge(_challengeId, _fineId, _observer);

        reservedSumFromUserForChallenge[_challengeId][achiever] -= sumOfFine;
        reservedSumFromUser[achiever] -= sumOfFine;
        balance[achiever] -= sumOfFine;
        balance[_observer] += sumOfFine;
    }
}