var CarContract = artifacts.require("./CarData.sol");

module.exports = function(_deployer) {
  // Use deployer to state migration tasks.
  //deployer.deploy(Cardata("DRC8237821","AUDI","A7",0,"metadata"));
  _deployer.deploy(CarContract,"DRC8237821","AUDI","A7",0,"metadata");
};
