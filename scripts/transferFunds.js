const fs = require('fs');
const path = require('path');

const SnS = require('../utils/signAndSendTx.js');

const keysDir = path.join(__dirname, '../accounts/');
const keysPassword = fs.readFileSync(
  path.join(__dirname, '../config/password'),
  'utf-8'
).trim();

function getPrivateKey(web3, address) {
  var fname = path.join(keysDir, './keystore/', address.substring(2).toLowerCase() + '.json');
  var keystore = require(fname);
  var privateKey = web3.eth.accounts.decrypt(keystore, keysPassword).privateKey;
  var pkBuff =  Buffer.from(privateKey.substring(2), "hex");
  return pkBuff;
}

async function main() {
  const Web3 = require('web3');
  //const web3 = new Web3('http://localhost:8545');
  const web3 = new Web3('https://rpc.gw.test.veladev.net');

  const from = '0xb66054b35a18d6687756faebae70aa5016b6284e'
  const to = '0x0859c9535043D9Ab46d436785d59461199248fC5'
  const value = web3.utils.toWei('3000', 'ether')

  try {
    let _tx = {
      from:      from,
      to:        to,
      value:     web3.utils.toHex(value),
      gas:  web3.utils.toHex('21000')
    };
    //console.log(_tx);

    const resp = await SnS(web3, _tx);
    console.log(resp);
  } catch(e) {
    console.log(e);
  }
}

async function sleep(ms) {
    await new Promise(r => setTimeout(r, ms));
}

main().catch(console.log);
