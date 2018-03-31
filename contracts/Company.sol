pragma solidity 0.4.21;
import "./Destructible.sol";
import "./Product.sol";

contract Company is Destructible {
  string public identifier;
  string public fullName;
  string public location;
  mapping(string => address) products;

  function Company(string _identifier, string _fullName, string _location) public {
    identifier = _identifier;
    fullName = _fullName;
    location = _location;
  }

  function addProduct(string serialNumber, string name) onlyOwner public returns(address) {
    Product p = new Product(serialNumber, name);
    products[serialNumber] = address(p);

    return address(p);
  }

  function haveProduct(string serialNumber) public view returns(bool) {
    return products[serialNumber] != address(0x0);
  }

  function isProductAuthentic(string serialNumber) public view returns(bool) {
    return Product(products[serialNumber]).isValid();
  }

}
