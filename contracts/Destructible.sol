pragma solidity 0.4.21;
import "./Ownable.sol";

contract Destructible is Ownable {
  function Destructible() public { }

  function destroy() onlyOwner public {
    selfdestruct(owner);
  }
}