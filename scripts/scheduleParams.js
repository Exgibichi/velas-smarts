const constants = require('../utils/constants');
const path = require('path');
const utils = require('../posdao-contracts/scripts/utils/utils');

async function main() {
  const Web3 = require('web3');
  //const web3 = new Web3('http://localhost:8545');
  const web3 = new Web3('http://138.68.71.224:8545');

  const stakingContract = require('../utils/getContract')('StakingAuRa', web3)
  const randomContract = require('../utils/getContract')('RandomAuRa', web3)

  console.log('Epoch duration:', await stakingContract.instance.methods.stakingEpochDuration().call())
  console.log('Stake withdraw:', await stakingContract.instance.methods.stakeWithdrawDisallowPeriod().call())
  console.log('Round Length:', await randomContract.instance.methods.collectRoundLength().call())

  const resp = await stakingContract.instance.methods.scheduleParamsChange(8664, 720, 114).send({
    from: constants.OWNER,
    gas: '105000000',
    gasPrice: '0'
  })
  console.log("Response:", resp)

  console.log("Epoch #", await stakingContract.instance.methods.stakingEpoch().call())
  await require('../utils/waitForNextStakingEpoch')(web3);
  console.log("Epoch #", await stakingContract.instance.methods.stakingEpoch().call())

  console.log('Epoch duration:', await stakingContract.instance.methods.stakingEpochDuration().call())
  console.log('Stake withdraw:', await stakingContract.instance.methods.stakeWithdrawDisallowPeriod().call())
  console.log('Round Length:', await randomContract.instance.methods.collectRoundLength().call())
}


main().catch(console.log);
