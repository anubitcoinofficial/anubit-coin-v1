

const Anubit = artifacts.require("Anubit");


module.exports = async function (deployer, network, accounts) {
  // await deploy 
  await deployer.deploy(Anubit);
  const anubitCoin = await Anubit.deployed()

};