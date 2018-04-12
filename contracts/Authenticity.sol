pragma solidity 0.4.21;
import "./Ownable.sol";
import "./Company.sol";

contract Authenticity is Ownable {
  mapping(string => Company) companies;

  modifier notEmpty(string value) {
    assert(bytes(value).length > 0);
    _;
  }
  modifier companyExists(string identifier) {
    assert(companies[identifier] != address(0x0));
    _;
  }
  modifier companyNotExists(string identifier) {
    assert(companies[identifier] == address(0x0));
    _;
  }
  modifier productExists(string identifier, string productSerial) {
    assert(companies[identifier].haveProduct(productSerial));
    _;
  }
  modifier productNotExists(string identifier, string productSerial) {
    assert(!companies[identifier].haveProduct(productSerial));
    _;
  }
  event CompanyCreated(address addr, string identifier, string fullName, string location);
  event CompanyDeleted(string identifier);

  function Authenticity() public { }

  function createCompany(string identifier, string fullName, string location) 
    notEmpty(identifier)
    notEmpty(fullName)
    notEmpty(location)
    companyNotExists(identifier)
    external 
    returns(address) 
  {
    Company c = new Company(identifier, fullName, location);
    companies[identifier] = c;
    
    emit CompanyCreated(address(c), identifier, fullName, location);

    return address(c);
  }

  function removeCompany(string identifier) onlyOwner companyExists(identifier) external {
    delete companies[identifier];

    emit CompanyDeleted(identifier);
  }

  function isCompanyRegistered(string identifier) external view returns(bool) {
    return companies[identifier] != address(0x0);
  }

  function isAuthentic(string companyIdentifier, string productSerial) 
    notEmpty(companyIdentifier)
    notEmpty(productSerial)
    companyExists(companyIdentifier)
    productExists(companyIdentifier, productSerial)
    external 
    view
    returns(bool) 
  {
    return companies[companyIdentifier].isProductAuthentic(productSerial);
  }

  function addProduct(string companyIdentifier, string productSerial, string productName) 
    notEmpty(companyIdentifier)
    notEmpty(productSerial)
    notEmpty(productName)
    companyExists(companyIdentifier)
    productNotExists(companyIdentifier, productSerial)
    external
    returns(address) 
  {
    return companies[companyIdentifier].addProduct(productSerial, productName);
  }


  function removeProduct(string companyIdentifier, string productSerial) 
    notEmpty(companyIdentifier)
    notEmpty(productSerial)
    companyExists(companyIdentifier)
    productExists(companyIdentifier, productSerial)
    external
  {
    companies[companyIdentifier].removeProduct(productSerial);
  }

}

