pragma solidity ^0.6.0;

contract Wallet {
    mapping(address => uint256) balance; // [user] = sum of wei on the balance of current user
    mapping(address => uint256) reservedSumFromUser; // [user] = sum of wei of current user that is reserved
    mapping(uint256 => mapping(address => uint256)) reservedSumFromUserForChallenge; // [challenge][user] = sum of wei of current user for challenge
}