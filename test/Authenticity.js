const Authenticity = artifacts.require('./Authenticity.sol');

contract("Authenticity", function (accounts) {
  const cpId = 'MSF';
  const prId = web3.sha3('ABC-123');
  const requester = accounts[0];
  const company1 = accounts[1];
  const company2 = accounts[2];

  let authenticityContract = null;
  let contractAddress = null;
  let company1Address = null;
  let product1Address = null;

  beforeEach('Create the contract instance', async () => {
    if(authenticityContract == null) {     
      authenticityContract = await Authenticity.deployed();
      contractAddress = authenticityContract.address; 
    }
  });

  it("should fail to get the authenticity for a non existing company", async () => {
    let isErr = false;

    try {
      await authenticityContract.isAuthentic(cpId, prId, {from: requester});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, "It should throw an error");
    }
  });

  it("the company should be unregistered", async () => {
    const result = await authenticityContract.isCompanyRegistered(cpId);

    assert.isFalse(result, "It should be unregistered");
  });

  it("should fail to create a company with empty identifier", async () => {
    let isErr = false;

    try {
      await authenticityContract.createCompany('', 'My company', 'My location', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, "It should throw an error");
    }
  });

  it("should fail to create a company with empty fullname", async () => {
    let isErr = false;

    try {
      await authenticityContract.createCompany(cpId, '', 'My location', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, "It should throw an error");
    }
  });

  it("should fail to create a company with empty location", async () => {
    let isErr = false;

    try {
      await authenticityContract.createCompany(cpId, 'My company', '', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, "It should throw an error");
    }
  });

  it("should create a new company", async () => {
    const tx = await authenticityContract.createCompany(cpId, 'My company', 'My location', {from: company1});
  
    assert.equal(tx.receipt.status, 1, 'Wrong status');
    assert.equal(tx.logs.length, 1, "One event expected");
    assert.equal(tx.logs[0].event, "CompanyCreated", "CompanyCreated event should be fired");
    assert.equal(tx.logs[0].args.identifier, cpId, "Wrong identifier");
    assert.equal(tx.logs[0].args.fullName, 'My company', "Wrong fullName");
    assert.equal(tx.logs[0].args.location, 'My location', "Wrong location");
    assert.isTrue(web3.isAddress(tx.logs[0].args.addr), "Should be an address");

    company1Address = tx.logs[0].args.addr;
  });

  it("should fail to create again the same company", async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.createCompany(cpId, 'My company', 'My location', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, "It should throw an error");
    }
  });

  it("the company should be registered", async () => {
    const result = await authenticityContract.isCompanyRegistered(cpId);

    assert.isTrue(result, "It should be registered correctly");
  });

  it("should fail to add a product for a company that doesn't exist", async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.addProduct('', 'my_serial_hash', 'my_product_name', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, "It should throw an error");
    }
  });

  it("should fail to add a product with an empty serial number", async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.addProduct(cpId, '', 'my_product_name', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, "It should throw an error");
    }
  });

  it("should fail to add a product with an empty product name", async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.addProduct(cpId, 'my_serial_hash', '', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, "It should throw an error");
    }
  });

  it("should fail to add the product if the call is not performed by the company owner", async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.addProduct(cpId, 'my_serial_hash', 'my_product_name', {from: company2});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, "It should throw an error");
    }
  });

  it("should add the product correctly", async () => {
  	const tx = await authenticityContract.addProduct(cpId, 'my_serial_hash', 'my_product_name', {from: company1});
  	console.log(tx.receipt.logs);
    assert.equal(tx.receipt.status, 1, 'Wrong status');
    assert.equal(tx.logs.length, 1, "One event expected");
    assert.equal(tx.logs[0].event, "ProductAdded", "ProductAdded event should be fired");
    assert.equal(tx.logs[0].args.companyAddress, company1Address, "Wrong identifier");
    assert.equal(tx.logs[0].args.serialNumber, 'my_serial_hash', "Wrong serial hash");
    assert.equal(tx.logs[0].args.name, 'my_product_name', "Wrong product name");
    assert.isTrue(web3.isAddress(tx.logs[0].args.productAddress), "Should be an address");

    product1Address = tx.logs[0].args.addr;
  });

});