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
  const web3 = new Web3('http://138.68.71.224:8545');
  
  const from = '0x073Cb268FE82E794C5898A04c7111F4420933D06'
  const to = '0x80cfE3BBBBEe7fC53dEC7557a6d0225A42D227d3'
  const value = web3.utils.toWei('0.3', 'ether')

  try {
    let _tx = {
      from:      from,
      to:        to,
      value:     web3.utils.toHex(value),
      gasLimit:  web3.utils.toHex('21000')
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
