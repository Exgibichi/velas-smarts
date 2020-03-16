const constants = require('../utils/constants');
const SnS = require('../utils/signAndSendTx.js');
const sendInStakingWindow = require('../utils/sendInStakingWindow');

async function main() {
  const Web3 = require('web3');
  const web3 = new Web3('http://localhost:8545');
  //const web3 = new Web3('ws://138.68.71.224:8546');

  const StakingAuRaContract = require('../utils/getContract')('StakingAuRa', web3)
  const StakingAuRaAddress = StakingAuRaContract.address
  const StakingAuRa = StakingAuRaContract.instance;
  const ValidatorSetAuRaContract = require('../utils/getContract')('ValidatorSetAuRa', web3).instance;
  const BlockRewardAuRa = require('../utils/getContract')('BlockRewardAuRa', web3).instance
  try {
    //console.log("Undistrubuted reward:", web3.utils.fromWei(await BlockRewardAuRa.methods.nativeRewardUndistributed().call()))
    //console.log("Snapshot stake:", await BlockRewardAuRa.methods.snapshotPoolTotalStakeAmount(123, '0x529C44911Bc67636c6bf4248bBe415FD76854e44').call())
    //console.log("Epoch reward:", await BlockRewardAuRa.methods.getValidatorReward(120, '0x529C44911Bc67636c6bf4248bBe415FD76854e44').call())
    //console.log("Epochs with reward:", await BlockRewardAuRa.methods.epochsPoolGotRewardFor('0x529C44911Bc67636c6bf4248bBe415FD76854e44').call())

    /*const staker = '0x4Da58B425035EDCc2c90Fd7D1C15A73dC865eAF6'
    const epochs = await BlockRewardAuRa.methods.epochsToClaimRewardFrom(staker, staker).call()
    console.log("Epoch staking rewards:", epochs)
    const rewardSum = await StakingAuRa.methods.getRewardAmount(epochs, staker, staker).call()
    console.log("Reward sum", web3.utils.fromWei(rewardSum))
    
    console.log("Claim:", await SnS(web3, {
      from: staker,
      to: StakingAuRaAddress,
      method: StakingAuRa.methods.claimReward(epochs, staker),
      gasLimit: web3.utils.toHex(1000000),
      gasPrice: web3.utils.toHex(1000000)
    }))*/

    console.log("Epoch #", await StakingAuRa.methods.stakingEpoch().call())
    console.log("Epoch end block:", await StakingAuRa.methods.stakingEpochEndBlock().call())
    console.log("Pools:", await StakingAuRa.methods.getPools().call())
    console.log("Inactive pools:", await StakingAuRa.methods.getPoolsInactive().call())
    console.log("Pools to remove:", await StakingAuRa.methods.getPoolsToBeRemoved().call())
    console.log("Validators:", await ValidatorSetAuRaContract.methods.getValidators().call())
    console.log("Pending:", await ValidatorSetAuRaContract.methods.getPendingValidators().call())
    console.log("Emit callable:", await ValidatorSetAuRaContract.methods.emitInitiateChangeCallable().call())
    
    console.log("Banned:", await ValidatorSetAuRaContract.methods.banCounter('0x1ed811Bcfc6982c54411Fd3e114d5313dC09F262').call())
    console.log("Banned until:", await ValidatorSetAuRaContract.methods.bannedUntil('0x1ed811Bcfc6982c54411Fd3e114d5313dC09F262').call())
    console.log("Banned reason:", web3.utils.hexToAscii(await ValidatorSetAuRaContract.methods.banReason('0x1ed811Bcfc6982c54411Fd3e114d5313dC09F262').call()))
    
    const minCandidateStake = await StakingAuRa.methods.candidateMinStake().call();
    console.log('min stake =', web3.utils.fromWei(minCandidateStake));
    const stakeAllowed = await StakingAuRa.methods.areStakeAndWithdrawAllowed().call();
    console.log('stake allowed:', stakeAllowed);

    const candidate = {staking: '0xb1fb346d2e417b04e5526012f8bdddb9087af87c', mining: '0xcb2d07651993c6946cfc53a85610168670375ae7'}
    //const candidate = constants.CANDIDATES[2]
    console.log(candidate)
    
    console.log("Stake:", await StakingAuRa.methods.stakeAmount(candidate.staking, candidate.staking).call());
    console.log("Withdrawable:", await StakingAuRa.methods.maxWithdrawAllowed(candidate.staking, candidate.staking).call());
    console.log("Order withdrawable:", await StakingAuRa.methods.maxWithdrawOrderAllowed(candidate.staking, candidate.staking).call());

    /*let tx = await sendInStakingWindow(web3, async () => {
      return SnS(web3, {
          from: candidate.staking,
          to: StakingAuRaAddress,
          value: minCandidateStake,
          method: StakingAuRa.methods.addPool(minCandidateStake, candidate.mining),
          //method: StakingAuRa.methods.stake(candidate.staking, minCandidateStake),
          //method: StakingAuRa.methods.withdraw(candidate.staking, minCandidateStake),
          gasLimit: web3.utils.toHex(1000000),
          gasPrice: web3.utils.toHex(1000000)
      });
    });
    console.log(tx);*/

    /*let tx = await sendInStakingWindow(web3, async () => {
      return SnS(web3, {
          from: candidate.staking,
          to: StakingAuRaAddress,
          //value: 0,
          //method: StakingAuRa.methods.withdraw(candidate.staking, minCandidateStake),
          method: StakingAuRa.methods.claimOrderedWithdraw(candidate.staking),
          //method: StakingAuRa.methods.orderWithdraw(candidate.staking, minCandidateStake),
          gasLimit: web3.utils.toHex(1000000),
          gasPrice: web3.utils.toHex(1000000)
      });
    });
    console.log(tx);*/
  } catch(e) {
    console.log(e);
  }
}

async function sleep(ms) {
    await new Promise(r => setTimeout(r, ms));
}

main().catch(console.log);
