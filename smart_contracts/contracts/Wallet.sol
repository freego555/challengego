pragma solidity ^0.6.6;
import './Challenge.sol';

contract Wallet {
    address owner;

    mapping(address => uint256) balance; // [user] = sum of wei on the balance of current user
    mapping(address => uint256) reservedSumFromUser; // [user] = sum of wei of current user that is reserved
    mapping(uint256 => mapping(address => uint256)) reservedSumFromUserForChallenge; // [challenge][user] = sum of wei of current user for challenge

    address challengeAddress;
    Challenge challengeContract;
    bool isSetChallenge;

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

    function startChallenge(uint256 _challengeId) payable public {
        require(isSetChallenge, "Contract Challenge has to be set.");
        require(_challengeId > 0, "Challenge ID doesn't exist.");
    }
}