pragma solidity 0.4.21;
import "./Ownable.sol";
import "./Company.sol";

contract Authenticity is Ownable {
  mapping(string => address) companies;

  modifier notEmpty(string value) {
    assert(bytes(value).length > 0);
    _;
  }
  modifier companyExists(string identifier) {
    assert(companies[identifier] != address(0x0));
    _;
  }
  modifier productExists(string identifier, string productSerial) {
    assert(Company(companies[identifier]).haveProduct(productSerial));
    _;
  }


  function Authenticity() public { }

  function createCompany(string identifier, string fullName, string location) 
    notEmpty(identifier)
    notEmpty(fullName)
    notEmpty(location)
    public 
    returns(address) 
  {
    Company c = new Company(identifier, fullName, location);
    companies[identifier] = address(c);

    return address(c);
  }

  function removeCompany(string identifier) onlyOwner companyExists(identifier) public {
    delete companies[identifier];
  }

  function isAuthentic(string companyIdentifier, string productSerial) 
    notEmpty(companyIdentifier)
    notEmpty(productSerial)
    companyExists(companyIdentifier)
    productExists(companyIdentifier, productSerial)
    public 
    view
    returns(bool) 
  {
    return Company(companies[companyIdentifier]).isProductAuthentic(productSerial);
  }

}

