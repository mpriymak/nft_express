// import pkg from '/node_modules/algosdk/dist/types/index.d.ts';
// import pkg from 'algosdk';
// import algosdk from './node_modules/algosdk/dist/types/index.d.ts'



// import MyAlgo from '@randlabs/myalgo-connect';
// import MyAlgo from '../../node_modules/@randlabs/myalgo-connect/index.js'
// const myAlgoWallet = new MyAlgo();

// /*Warning: Browser will block pop-up if user doesn't trigger myAlgoWallet.connect() with a button interation */
// const connectToMyAlgo = async() => {
//     try {
//       const accounts = await myAlgoWallet.connect();
  
//       const addresses = accounts.map(account => account.address);
      
//     } catch (err) {
//       console.error(err);
//     }
// }


// module.exports = connectToMyAlgo();


// import * as algosdk from '../../node_modules/algosdk/dist/browser/algosdk.min.js.map'
// import * as algosdk from 'algosdk';

// const { Algodv2, mnemonicToSecretKey, makeAssetCreateTxnWithSuggestedParams, 
//     makeAssetConfigTxnWithSuggestedParams, makeAssetTransferTxnWithSuggestedParams, makeAssetDestroyTxnWithSuggestedParams } = pkg;

// const apiServer = 'https://testnet-algorand.api.purestake.io/ps2';
// const port = '';

// const token = {
//    'X-API-Key': 'PkIkrh43cz7AzG1cwNh4Z18AYkTZI9p5aiCn20SI'
// }

// // Instantiate the algod wrapper
// const algodClient = new Algodv2(token, apiServer, port);

// let account1Mnemonic = "faith amateur account twist melody erode extra test project quit dress figure swim express random glare jealous screen achieve pave same asset produce about web";
// let account2Mnemonic = "impose report into guitar cabbage rather seminar shoot sibling mean satoshi hollow torch critic drip rebel crumble cancel term jungle kiss couple abuse abstract course";
// let account3Mnemonic = "umbrella moral marriage milk warm still surge member basic assist defense bracket multiply author despair insect clown cave aware scrap noble vacant blossom about party";

// let account1 = mnemonicToSecretKey(account1Mnemonic);
// let account2 = mnemonicToSecretKey(account2Mnemonic);
// let account3 = mnemonicToSecretKey(account3Mnemonic);

// console.log("Account 1 address = " + account1.addr);
// console.log("Account 2 address = " + account2.addr);
// console.log("Account 3 address = " + account3.addr + '\n');
