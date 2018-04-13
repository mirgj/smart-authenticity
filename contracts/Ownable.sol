pragma solidity 0.4.21;

contract Ownable {
  address public owner;
  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  function Ownable() public {
    owner = tx.origin;
  }

  modifier onlyOwner() {
    require(tx.origin == owner);
    _;
  }

  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    require(newOwner != owner);

    owner = newOwner;
    emit OwnershipTransferred(owner, newOwner);
  }
}