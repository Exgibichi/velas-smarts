const constants = require('../utils/constants');
const path = require('path');
const utils = require('../posdao-contracts/scripts/utils/utils');
const SnS = require('../utils/signAndSendTx.js');

// Run compile-posdao-contracts before upgrade
//UZzAtx8FSXwyQYnY
async function upgradeContract(web3, contractName, contractAddress) {
    try {
        console.log("Upgrading", contractName)
        const contractsPath = path.join(__dirname, '..', 'posdao-contracts/contracts/')
        /*const compiled = await utils.compile(
          contractsPath,
          contractName
        )
        const bytecode = compiled.evm.bytecode.object*/
        const compiled = require(path.join('../posdao-contracts/build/contracts/', contractName + '.json'))
        console.log(compiled.contractName)
        console.log("owner: ", constants.OWNER);
        // deploy contract on new address
        const contract = new web3.eth.Contract(compiled.abi)

        const deploy = await contract.deploy({data: compiled.bytecode}).encodeABI();

        let reciept = await SnS(web3, {
            from: constants.OWNER,
            gas: '105000000',
            gasPrice: '0',
            data: deploy,
        });
        //console.log('deploy:', deploy)

        const newAddress = reciept.contractAddress
        console.log('new address:', newAddress)

        // call proxy upgrade
        const proxyContractAbi = require('../posdao-contracts/build/contracts/AdminUpgradeabilityProxy').abi
        const proxyContract = new web3.eth.Contract(proxyContractAbi, contractAddress)

        console.log('implementation before:', await proxyContract.methods.implementation().call())

        let upgradeReciept = await SnS(web3, {
            from: constants.OWNER,
            to: proxyContract.options.address,
            method: proxyContract.methods.upgradeTo(newAddress),
            gas: '105000000',
            gasPrice: '0',
        })
        //console.log('proxy response:', resp)

        console.log('implementation after', await proxyContract.methods.implementation().call())
    } catch(e) {
        console.log(e);
    }
}

async function main() {
    const Web3 = require('web3');
    const web3 = new Web3('https://rpc.gw.test.veladev.net');

    const blockRewardContract = require('../utils/getContract')('BlockRewardAuRa', web3)
    const stakingContract = require('../utils/getContract')('StakingAuRa', web3)
    const randomContract = require('../utils/getContract')('RandomAuRa', web3)

    //upgradeContract(web3, 'RandomAuRa', randomContract.address)
    upgradeContract(web3, 'StakingAuRa', stakingContract.address)
    //upgradeContract(web3, 'BlockRewardAuRa', blockRewardContract.address)
}

async function sleep(ms) {
    await new Promise(r => setTimeout(r, ms));
}

main().catch(console.log);
