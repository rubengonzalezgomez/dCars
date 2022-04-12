var CarOwnership = artifacts.require("./CarOwnership.sol");

module.exports = function(_deployer) {
  // Use deployer to state migration tasks.
  _deployer.deploy(CarOwnership);
};
