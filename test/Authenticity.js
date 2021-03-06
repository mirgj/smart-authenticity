const Authenticity = artifacts.require('./Authenticity.sol');
const Company = artifacts.require('./Company.sol');
const Product = artifacts.require('./Product.sol');

contract('Authenticity', function (accounts) {
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

  it('should fail to get the authenticity for a non existing company', async () => {
    let isErr = false;

    try {
      await authenticityContract.isAuthentic(cpId, prId, {from: requester});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('the company should be unregistered', async () => {
    const result = await authenticityContract.isCompanyRegistered(cpId);

    assert.isFalse(result, 'It should be unregistered');
  });

  it('should fail to create a company with empty identifier', async () => {
    let isErr = false;

    try {
      await authenticityContract.createCompany('', 'My company', 'My location', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should fail to create a company with empty fullname', async () => {
    let isErr = false;

    try {
      await authenticityContract.createCompany(cpId, '', 'My location', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should fail to create a company with empty location', async () => {
    let isErr = false;

    try {
      await authenticityContract.createCompany(cpId, 'My company', '', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should create a new company', async () => {
    const tx = await authenticityContract.createCompany(cpId, 'My company', 'My location', {from: company1});

    assert.equal(tx.receipt.status, 1, 'Wrong status');
    assert.equal(tx.logs.length, 2, 'One event expected');
    assert.equal(tx.logs[0].event, 'OwnershipTransferred', 'OwnershipTransferred event should be fired');
    assert.equal(tx.logs[0].args.newOwner, company1, 'Wrong old owner');
    assert.equal(tx.logs[1].event, 'CompanyCreated', 'CompanyCreated event should be fired');
    assert.equal(tx.logs[1].args.identifier, cpId, 'Wrong identifier');
    assert.equal(tx.logs[1].args.fullName, 'My company', 'Wrong fullName');
    assert.equal(tx.logs[1].args.location, 'My location', 'Wrong location');
    assert.isTrue(web3.isAddress(tx.logs[1].args.addr), 'Should be an address');

    company1Address = tx.logs[1].args.addr;
  });

  it('should fail to create again the same company', async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.createCompany(cpId, 'My company', 'My location', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('the company should be registered', async () => {
    const result = await authenticityContract.isCompanyRegistered(cpId);

    assert.isTrue(result, 'It should be registered correctly');
  });

  it('the company should have the right owner', async () => {
    const company1Instance = await Company.at(company1Address);
    const owner = await company1Instance.owner();

    assert.equal(owner, company1, 'It should have the right owner');
  });

  it('should fail to add a product for a company that doesn\'t exist', async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.addProduct('', prId, 'my_product_name', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should fail to add a product with an empty serial number', async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.addProduct(cpId, '', 'my_product_name', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should fail to add a product with an empty product name', async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.addProduct(cpId, prId, '', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should fail to add the product if the call is not performed by the company owner', async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.addProduct(cpId, prId, 'my_product_name', {from: company2});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should add the product correctly', async () => {
    const company1Instance = await Company.at(company1Address);
    let hasFired = false;

    const events = company1Instance.allEvents();
    events.watch((err, res) => {
      if (err) throw err;

      hasFired = true;
      assert.equal(res.event, 'ProductAdded', 'ProductAdded event should be fired');
      assert.equal(res.args.companyAddress, company1Address, 'Wrong identifier');
      assert.equal(res.args.serialNumber, prId, 'Wrong serial hash');
      assert.equal(res.args.name, 'my_product_name', 'Wrong product name');
      assert.isTrue(web3.isAddress(res.args.productAddress), 'Should be an address');

      product1Address = res.args.productAddress;
    });

  	const tx = await authenticityContract.addProduct(cpId, prId, 'my_product_name', {from: company1});
    
    assert.equal(tx.receipt.status, 1, 'Wrong status');
    assert.equal(tx.logs.length, 1, 'One event expected');
    assert.equal(tx.logs[0].event, 'OwnershipTransferred', 'OwnershipTransferred event should be fired');
    assert.equal(tx.logs[0].args.newOwner, company1, 'Wrong old owner');
    assert.equal(tx.receipt.status, 1, 'Wrong status');
    assert.isTrue(hasFired, 'expected event');
    events.stopWatching();
  });

  it('the product should have the right owner', async () => {
    const product1Instance = await Product.at(product1Address);
    const owner = await product1Instance.owner();

    assert.equal(owner, company1, 'It should have the right owner');
  });

  it('should fail to add the same product again', async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.addProduct(cpId, prId, 'my_product_name', {from: company1});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should get the authenticity for the product', async () => {
    const result = await authenticityContract.isAuthentic(cpId, prId, {from: requester});
    
    assert.isTrue(result, 'the product should be authentic');
  });

  it('should fail invalidate the product from another account', async () => {
    let isErr = false;

    try {
      const product1Instance = await Product.at(product1Address);
      const tx = await product1Instance.invalidate({from: company2});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should invalidate the product', async () => {
    const product1Instance = await Product.at(product1Address);
    const tx = await product1Instance.invalidate({from: company1});
    const isValid = await product1Instance.isValid();

    assert.equal(tx.receipt.status, 1, 'Wrong status');
    assert.isFalse(isValid, 'the product should not be valid anymore');
  });

  it('should fail validate the product from another account', async () => {
    let isErr = false;

    try {
      const product1Instance = await Product.at(product1Address);
      const tx = await product1Instance.validate({from: company2});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should validate the product', async () => {
    const product1Instance = await Product.at(product1Address);
    const tx = await product1Instance.validate({from: company1});
    const isValid = await product1Instance.isValid();

    assert.equal(tx.receipt.status, 1, 'Wrong status');
    assert.isTrue(isValid, 'the product should be valid again');
  });

  it('should fail to remove the product from another account', async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.removeProduct(cpId, prId, {from: company2})
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should remove the product correctly', async () => {
    const company1Instance = await Company.at(company1Address);
    let hasFired = false;

    const events = company1Instance.allEvents();
    events.watch((err, res) => {
      if (err) throw err;

      hasFired = true;
      assert.equal(res.event, 'ProductRemoved', 'ProductRemoved event should be fired');
      assert.equal(res.args.serialNumber, prId, 'Wrong serial hash');
    });
    const tx = await authenticityContract.removeProduct(cpId, prId, {from: company1})

    assert.equal(tx.receipt.status, 1, 'Wrong status');
    assert.isTrue(hasFired, 'expected event');
    events.stopWatching();
  });

  it('should fail to get the authenticity for a non existing product', async () => {let isErr = false;
    try {
      const result = await authenticityContract.isAuthentic(cpId, prId, {from: requester});
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should fail to remove the company from another account', async () => {
    let isErr = false;

    try {
      const tx = await authenticityContract.removeCompany(cpId, {from: company2})
    } catch(err) {
      isErr = true;
    } finally {
      assert.isTrue(isErr, 'It should throw an error');
    }
  });

  it('should remove the company', async () => {
    const tx = await authenticityContract.removeCompany(cpId, {from: company1});

    assert.equal(tx.receipt.status, 1, 'Wrong status');
    assert.equal(tx.logs.length, 1, 'One event expected');
    assert.equal(tx.logs[0].event, 'CompanyDeleted', 'CompanyDeleted event should be fired');
    assert.equal(tx.logs[0].args.identifier, cpId, 'Wrong identifier');
  });

});