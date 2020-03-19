const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider());
const utils = require('./utils/utils');

const VALIDATOR_SET_CONTRACT = '0x1000000000000000000000000000000000000001';
const BLOCK_REWARD_CONTRACT = '0x2000000000000000000000000000000000000001';
const RANDOM_CONTRACT = '0x3000000000000000000000000000000000000001';
const STAKING_CONTRACT = '0x1100000000000000000000000000000000000001';
const PERMISSION_CONTRACT = '0x4000000000000000000000000000000000000001';
const CERTIFIER_CONTRACT = '0x5000000000000000000000000000000000000001';

main();

async function main() {
  const networkName = process.env.NETWORK_NAME;
  const networkID = process.env.NETWORK_ID;
  const owner = process.env.OWNER.trim();
  let initialValidators = process.env.INITIAL_VALIDATORS.split(',');
  for (let i = 0; i < initialValidators.length; i++) {
    initialValidators[i] = initialValidators[i].trim();
  }
  let stakingAddresses = process.env.STAKING_ADDRESSES.split(',');
  for (let i = 0; i < stakingAddresses.length; i++) {
    stakingAddresses[i] = stakingAddresses[i].trim();
  }
  let balanceAddress = process.env.BALANCE_ADDRESS;
  const firstValidatorIsUnremovable = process.env.FIRST_VALIDATOR_IS_UNREMOVABLE === 'true';
  const stakingEpochDuration = process.env.STAKING_EPOCH_DURATION;
  const stakeWithdrawDisallowPeriod = process.env.STAKE_WITHDRAW_DISALLOW_PERIOD;
  const collectRoundLength = process.env.COLLECT_ROUND_LENGTH;
  const erc20Restricted = process.env.ERC20_RESTRICTED === 'true';

  const contracts = [
    'AdminUpgradeabilityProxy',
    'BlockRewardAuRa',
    'Certifier',
    'InitializerAuRa',
    'RandomAuRa',
    'Registry',
    'StakingAuRa',
    'TxPermission',
    'ValidatorSetAuRa',
  ];

  let spec = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'templates', 'spec.json'), 'UTF-8'));

  spec.name = networkName;
  spec.params.networkID = networkID;

  let contractsCompiled = {};
  for (let i = 0; i < contracts.length; i++) {
    const contractName = contracts[i];
    let realContractName = contractName;
    let dir = 'contracts/';

    if (contractName == 'AdminUpgradeabilityProxy') {
      dir = 'contracts/upgradeability/';
    } else if (contractName == 'StakingAuRa' && erc20Restricted) {
      realContractName = 'StakingAuRaCoins';
      dir = 'contracts/base/';
    } else if (contractName == 'BlockRewardAuRa' && erc20Restricted) {
      realContractName = 'BlockRewardAuRaCoins';
      dir = 'contracts/base/';
    }

    console.log(`Compiling ${contractName}...`);
    const compiled = await compile(
      path.join(__dirname, '..', dir),
      realContractName
    );
    contractsCompiled[contractName] = compiled;
  }

  const storageProxyCompiled = contractsCompiled['AdminUpgradeabilityProxy'];
  let contract = new web3.eth.Contract(storageProxyCompiled.abi);
  let deploy;

  // Build ValidatorSetAuRa contract
  deploy = await contract.deploy({data: '0x' + storageProxyCompiled.bytecode, arguments: [
    '0x1000000000000000000000000000000000000000', // implementation address
    owner,
    []
  ]});
  spec.engine.authorityRound.params.validators.multi = {
    "0": {
      "contract": VALIDATOR_SET_CONTRACT
    }
  };
  spec.accounts[VALIDATOR_SET_CONTRACT] = {
    balance: '0',
    constructor: await deploy.encodeABI()
  };
  spec.accounts['0x1000000000000000000000000000000000000000'] = {
    balance: '0',
    constructor: '0x' + contractsCompiled['ValidatorSetAuRa'].bytecode
  };

  // Build StakingAuRa contract
  deploy = await contract.deploy({data: '0x' + storageProxyCompiled.bytecode, arguments: [
    '0x1100000000000000000000000000000000000000', // implementation address
    owner,
    []
  ]});
  spec.accounts[STAKING_CONTRACT] = {
    balance: '0',
    constructor: await deploy.encodeABI()
  };
  spec.accounts['0x1100000000000000000000000000000000000000'] = {
    balance: '0',
    constructor: '0x' + contractsCompiled['StakingAuRa'].bytecode
  };

  // Build BlockRewardAuRa contract
  deploy = await contract.deploy({data: '0x' + storageProxyCompiled.bytecode, arguments: [
    '0x2000000000000000000000000000000000000000', // implementation address
    owner,
    []
  ]});
  spec.accounts[BLOCK_REWARD_CONTRACT] = {
    balance: '0',
    constructor: await deploy.encodeABI()
  };
  spec.engine.authorityRound.params.blockRewardContractAddress = BLOCK_REWARD_CONTRACT;
  spec.engine.authorityRound.params.blockRewardContractTransition = 0;
  spec.accounts['0x2000000000000000000000000000000000000000'] = {
    balance: '0',
    constructor: '0x' + contractsCompiled['BlockRewardAuRa'].bytecode
  };

  // Build RandomAuRa contract
  deploy = await contract.deploy({data: '0x' + storageProxyCompiled.bytecode, arguments: [
    '0x3000000000000000000000000000000000000000', // implementation address
    owner,
    []
  ]});
  spec.accounts[RANDOM_CONTRACT] = {
    balance: '0',
    constructor: await deploy.encodeABI()
  };
  spec.accounts['0x3000000000000000000000000000000000000000'] = {
    balance: '0',
    constructor: '0x' + contractsCompiled['RandomAuRa'].bytecode
  };
  spec.engine.authorityRound.params.randomnessContractAddress[0] = RANDOM_CONTRACT;

  // Build TxPermission contract
  deploy = await contract.deploy({data: '0x' + storageProxyCompiled.bytecode, arguments: [
    '0x4000000000000000000000000000000000000000', // implementation address
    owner,
    []
  ]});
  spec.accounts[PERMISSION_CONTRACT] = {
    balance: '0',
    constructor: await deploy.encodeABI()
  };
  spec.params.transactionPermissionContract = PERMISSION_CONTRACT;
  spec.accounts['0x4000000000000000000000000000000000000000'] = {
    balance: '0',
    constructor: '0x' + contractsCompiled['TxPermission'].bytecode
  };

  // Build Certifier contract
  deploy = await contract.deploy({data: '0x' + storageProxyCompiled.bytecode, arguments: [
    '0x5000000000000000000000000000000000000000', // implementation address
    owner,
    []
  ]});
  spec.accounts[CERTIFIER_CONTRACT] = {
    balance: '0',
    constructor: await deploy.encodeABI()
  };
  spec.accounts['0x5000000000000000000000000000000000000000'] = {
    balance: '0',
    constructor: '0x' + contractsCompiled['Certifier'].bytecode
  };

  // Build Registry contract
  contract = new web3.eth.Contract(contractsCompiled['Registry'].abi);
  deploy = await contract.deploy({data: '0x' + contractsCompiled['Registry'].bytecode, arguments: [
    CERTIFIER_CONTRACT,
    owner
  ]});
  spec.accounts['0x6000000000000000000000000000000000000000'] = {
    balance: '0',
    constructor: await deploy.encodeABI()
  };
  spec.params.registrar = '0x6000000000000000000000000000000000000000';

  // Build InitializerAuRa contract
  contract = new web3.eth.Contract(contractsCompiled['InitializerAuRa'].abi);
  deploy = await contract.deploy({data: '0x' + contractsCompiled['InitializerAuRa'].bytecode, arguments: [
    [ // _contracts
      VALIDATOR_SET_CONTRACT,
      BLOCK_REWARD_CONTRACT,
      RANDOM_CONTRACT,
      STAKING_CONTRACT,
      PERMISSION_CONTRACT,
      CERTIFIER_CONTRACT
    ],
    owner, // _owner
    initialValidators, // _miningAddresses
    stakingAddresses, // _stakingAddresses
    firstValidatorIsUnremovable, // _firstValidatorIsUnremovable
    web3.utils.toWei('1', 'ether'), // _delegatorMinStake
    web3.utils.toWei('1000000', 'ether'), // _candidateMinStake
    stakingEpochDuration, // _stakingEpochDuration
    0, // _stakingEpochStartBlock
    stakeWithdrawDisallowPeriod, // _stakeWithdrawDisallowPeriod
    collectRoundLength // _collectRoundLength
  ]});
  spec.accounts['0x7000000000000000000000000000000000000000'] = {
    balance: '0',
    constructor: await deploy.encodeABI()
  };

  // Premine account
  spec.accounts[balanceAddress] = {
    balance: web3.utils.toWei('2000000000', 'ether')
  }

  console.log('Saving spec.json file ...');
  fs.writeFileSync(path.join(__dirname, '..', 'spec.json'), JSON.stringify(spec, null, '  '), 'UTF-8');
  console.log('Done');
}

async function compile(dir, contractName) {
  const compiled = await utils.compile(dir, contractName);
  return {abi: compiled.abi, bytecode: compiled.evm.bytecode.object};
}
