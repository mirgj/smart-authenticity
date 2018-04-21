pragma solidity 0.4.21;
import "./Destructible.sol";

contract Product is Destructible {
  string public serial;
  string public name;
  bool public valid;

  function Product(string _serial, string _name) public {
  	serial = _serial;
  	name = _name;
  	valid = true;
  }

  function invalidate() onlyOwner public {
  	valid = false;
  }

  function validate() onlyOwner public {
  	valid = true;
  }

  function isValid() public view returns(bool) {
    return valid;
  }

}
