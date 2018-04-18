pragma solidity 0.4.21;

contract Ownable {
  address public owner;
  address public creator;
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  function Ownable() public {
    owner = msg.sender;
    creator = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner || msg.sender == creator);
    _;
  }

  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    require(newOwner != owner);

    owner = newOwner;
    emit OwnershipTransferred(owner, newOwner);
  }
}