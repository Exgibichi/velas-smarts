'use strict';
const specParams = require("../posdao-contracts/spec").engine.authorityRound.params;
const BLOCK_REWARD_ADDRESS = specParams.blockRewardContractAddress;
const VALIDATOR_SET_ADDRESS = specParams.validators.multi[0].contract;
const RANDOM_AURA_ADDRESS = specParams.randomnessContractAddress[0];
const STAKING_CONTRACT_ADDRESS = "0x1100000000000000000000000000000000000001";

module.exports = {
  OWNER: "0x0859c9535043d9ab46d436785d59461199248fc5",
  CANDIDATES: [
    { mining: "0x82e26fa89f2461932ab09a0ec6625e06f02d5a96", staking: "0x267ec0079043b43930a1d671fb98fd19fdcaf449" },
    { mining: "0x68df9e77791d66968c000d31f221a93387ad123d", staking: "0xbcf140cc8fc689e6759fab4ccc6110d3d929cbb1" },
    { mining: "0x529c44911bc67636c6bf4248bbe415fd76854e44", staking: "0x4da58b425035edcc2c90fd7d1c15a73dc865eaf6" }
  ],
  BLOCK_REWARD_ADDRESS,
  VALIDATOR_SET_ADDRESS,
  STAKING_CONTRACT_ADDRESS,
  RANDOM_AURA_ADDRESS,
  CANDIDATE_INITIAL_BALANCE: '0',
};
