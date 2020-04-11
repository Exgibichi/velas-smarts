const constants = require('../utils/constants')
const path = require('path')
const utils = require('../posdao-contracts/scripts/utils/utils')

async function main() {
  const Web3 = require('web3')
  const web3 = new Web3('http://localhost:8545')

  try {
    const contractName = 'BlockRewardAuRa'
    const contractToUpgrade = require('../utils/getContract')(contractName, web3)
  
    const contractsPath = path.join(__dirname, '..', 'posdao-contracts/contracts/')
    const compiled = await utils.compile(
      contractsPath,
      contractName
    )
    const bytecode = compiled.evm.bytecode.object

    // deploy contract on new address
    const contract = new web3.eth.Contract(compiled.abi)
    const deploy = await contract.deploy({data: '0x' + bytecode}).send({
      from: constants.OWNER,
      gas: '16000000',
      gasPrice: '0'
    })
    //console.log('deploy:', deploy)
    
    const newAddress = deploy.options.address
    console.log('new address:', newAddress)

    // call proxy upgrade
    const proxyContractAbi = require('../posdao-contracts/build/contracts/AdminUpgradeabilityProxy').abi
    const proxyContract = new web3.eth.Contract(proxyContractAbi, contractToUpgrade.address)

    console.log('implementation before:', await proxyContract.methods.implementation().call())
    const resp = await proxyContract.methods.upgradeTo(newAddress).send({
      from: constants.OWNER,
      gas: '16000000',
      gasPrice: '0'
    })
    //console.log('proxy response:', resp)

    console.log('implementation after', await proxyContract.methods.implementation().call())
  } catch(e) {
    console.log(e)
  }
}

main().catch(console.log)
