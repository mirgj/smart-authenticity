pragma solidity 0.4.21;
import "./Destructible.sol";
import "./Product.sol";

contract Company is Destructible {
  string public identifier;
  string public fullName;
  string public location;
  mapping(string => Product) products;

  event ProductAdded(address companyAddress, address productAddress, string serialNumber, string name);
  event ProductRemoved(string serialNumber);


  function Company(string _identifier, string _fullName, string _location) public {
    identifier = _identifier;
    fullName = _fullName;
    location = _location;
  }

  function addProduct(string serialNumber, string name) onlyOwner public returns(address) {
    Product p = new Product(serialNumber, name);
    products[serialNumber] = p;

    emit ProductAdded(address(this), address(p), serialNumber, name);

    return address(p);
  }

  function removeProduct(string serialNumber) onlyOwner public {
    delete products[serialNumber];

    emit ProductRemoved(serialNumber);
  }

  function haveProduct(string serialNumber) public view returns(bool) {
    return products[serialNumber] != address(0x0);
  }

  function isProductAuthentic(string serialNumber) public view returns(bool) {
    return products[serialNumber].isValid();
  }

}
