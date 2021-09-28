
// Function used to wait for a tx confirmation
const waitForConfirmation = async function (algodClient, txID) {
    let response = await algodClient.status().do();
    let lastRound = response["last-round"];
    while (true) {
        const pendingInfo = await algodClient.pendingTransactionInformation(txID).do();
        if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
            //Got the completed Transaction
            console.log("Transaction " + txID + " confirmed in round " + pendingInfo["confirmed-round"] + '\n');
            break;
        }
        lastRound++;
        await algodClient.statusAfterBlock(lastRound).do();
    }
};



// Function used to print created asset for account and assetid
const printCreatedAsset = async function (algodClient, account, assetID) {
    let accountInfo = await algodClient.accountInformation(account).do();
    for (let idx = 0; idx < accountInfo['created-assets'].length; idx++) {
        let scrutinizedAsset = accountInfo['created-assets'][idx];
        if (scrutinizedAsset['index'] == assetID) {
            console.log("AssetID in printCreatedAsset() = " + scrutinizedAsset['index'] + '\n');
            let myParams = JSON.stringify(scrutinizedAsset['params'], undefined, 2);
            console.log("Asset Params = " + myParams + '\n');
            break;
        }
    }
};



// Function used to print asset holding for account and assetid
const printAssetHolding = async function (algodClient, account, assetID) {
    let accountInfo = await algodClient.accountInformation(account).do();
    for (let idx = 0; idx < accountInfo['assets'].length; idx++) {
        let scrutinizedAsset = accountInfo['assets'][idx];
        if (scrutinizedAsset['asset-id'] == assetID) {
            let assetHolding = JSON.stringify(scrutinizedAsset, undefined, 2);
            console.log("AssetHoldingInfo = " + assetHolding + '\n');
            break;
        }
    }
};



const createASA = async function ({algodClient, creatorAccount, managerAccount}) {
    // Asset Creation:
    // The first transaction is to create a new asset
    // Get last round and suggested tx fee
    // We use these to get the latest round and tx fees
    // These parameters will be required before every 
    // Transaction
    // We will account for changing transaction parameters
    // before every transaction in this example
    let params = await algodClient.getTransactionParams().do();
    
    //comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;
    console.log("Transaction Params in createASA() = " + JSON.stringify(params, undefined, 2) + '\n');

    // arbitrary data to be stored in the transaction; here, none is stored
    let note = undefined; 

    // Asset-creation-specific parameters.
    let creatorAddress = creatorAccount.addr;
    // Whether user accounts will need to be unfrozen before transacting    
    let defaultFrozen = false;
    // integer number of decimals for asset unit calculation
    let decimals = 0;
    // total number of this asset available for circulation   
    let totalIssuance = 1;
    // Used to display asset units to user    
    let unitName = "AAO_NFT";
    // Friendly name of the asset    
    let assetName = "aaoToken";
    // Optional string pointing to a URL relating to the asset
    let assetURL = "http://testurl";
    // Optional hash commitment of some sort relating to the asset. 32 character length.
    let assetMetadataHash = "16efaa3924a6fd9d3a4824799a4ac65d";
    // The following parameters are the only ones that can be changed, and they have to be changed by the current manager.
    // Specified address can change reserve, freeze, clawback, and manager
    let manager = managerAccount.addr;
    // Specified address is considered the asset reserve (it has no special privileges, this is only informational)
    let reserve = managerAccount.addr;
    // Specified address can freeze or unfreeze user asset holdings 
    let freeze = managerAccount.addr;
    // Specified address can revoke user asset holdings and send them to other addresses    
    let clawback = managerAccount.addr;

    // signing and sending "txn" allows "addr" to create an asset
    let txn = makeAssetCreateTxnWithSuggestedParams(creatorAddress, note, totalIssuance, decimals, defaultFrozen, manager, 
        reserve, freeze, clawback, unitName, assetName, assetURL, assetMetadataHash, params);

    let rawSignedTxn = txn.signTxn(creatorAccount.sk)
    let tx = (await algodClient.sendRawTransaction(rawSignedTxn).do());
    console.log("Transaction in createASA() : " + tx.txId + '\n');
    let assetID = null;
    // wait for transaction to be confirmed
    await waitForConfirmation(algodClient, tx.txId);
    // Get the new asset's information from the creator account
    let ptx = await algodClient.pendingTransactionInformation(tx.txId).do();
    assetID = ptx["asset-index"];
    console.log("AssetID in createASA() = " + assetID + '\n');

    await printCreatedAsset(algodClient, creatorAddress, assetID);
    await printAssetHolding(algodClient, creatorAddress, assetID);

    return assetID;
};



const configureASA = async function ({algodClient, assetID, oldManager, newManager}) {
    // Change Asset Configuration:
    // Change the manager using an asset configuration transaction
    // First update changing transaction parameters
    // We will account for changing transaction parameters
    // before every transaction in this example

    let params = await algodClient.getTransactionParams().do();
    
    //comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;

    console.log("Transaction Params in configureASA() = " + JSON.stringify(params, undefined, 2) + '\n');

    // Asset configuration specific parameters. all other values are the same so we leave them set.
    // Specified address can change reserve, freeze, clawback, and manager
    let oldManagerAddress = oldManager.addr;
    let newManagerAddress = newManager.addr;
    
    // arbitrary data to be stored in the transaction; here, none is stored
    let note = undefined; 
    // Specified address is considered the asset reserve (it has no special privileges, this is only informational)
    let reserve = newManager.addr;
    // Specified address can freeze or unfreeze user asset holdings 
    let freeze = newManager.addr;
    // Specified address can revoke user asset holdings and send them to other addresses    
    let clawback = newManager.addr;

    // Note that the change has to come from the existing manager
    let ctxn = makeAssetConfigTxnWithSuggestedParams(oldManagerAddress, note, assetID, newManagerAddress, reserve, freeze, clawback, params);

    // This transaction must be signed by the current manager
    let rawSignedTxn = ctxn.signTxn(oldManager.sk)
    let ctx = (await algodClient.sendRawTransaction(rawSignedTxn).do());
    console.log("Transaction in configureASA(): " + ctx.txId + '\n');
    // wait for transaction to be confirmed
    await waitForConfirmation(algodClient, ctx.txId);

    // The manager should now be changed
    await printCreatedAsset(algodClient, newManager.addr, assetID);
};



const optInTransaction = async function ({algodClient, assetID, receivingAccount}) {
    // Opting in to an Asset:
    // Allow accounts that want to recieve the new asset to opt in.
    // To do this they send an asset transfer of the new asset to themseleves 
    
    // Account for changing transaction parameters before every transaction.
    let params = await algodClient.getTransactionParams().do();

    // Comment out the next two lines to use suggested fee.
    params.fee = 1000;
    params.flatFee = true;

    let sendingAddress = receivingAccount.addr;
    let receivingAddress = sendingAddress;

    // arbitrary data to be stored in the transaction; here, none is stored
    let note = undefined; 
    // We set revocationTarget to undefined as this is not a clawback operation.
    let revocationTarget = undefined;
    // CloseReaminerTo is set to undefined as we are not closing out an asset.
    let closeRemainderTo = undefined;
    // We are sending 0 assets
    let amount = 0;

    // signing and sending "txn" allows sender to begin accepting asset specified by creator and index
    let opttxn = makeAssetTransferTxnWithSuggestedParams(sendingAddress, receivingAddress, closeRemainderTo, revocationTarget,
        amount, note, assetID, params);

    
 
    const myAlgoConnect = new MyAlgoConnect();
        
    const accountsSharedByUser = await myAlgoConnect.connect()
    
    const signedTxn = await myAlgoConnect.signTransaction(opttxn.toByte());
    
    const response = await algodClient.sendRawTransaction(signedTxn.blob).do();




    // // Must be signed by the account wishing to opt in to the asset    
    // let rawSignedTxn = opttxn.signTxn(receivingAccount.sk);

    // let opttx = (await algodClient.sendRawTransaction(rawSignedTxn).do());
    
    // console.log("Transaction in optInTransaction(): " + opttx.txId + '\n');
    
    // // wait for transaction to be confirmed
    // await waitForConfirmation(algodClient, opttx.txId);

    // //You should now see the new asset listed in the account information
    // console.log("Receiving Account Address = " + receivingAccount.addr + '\n');

    // await printAssetHolding(algodClient, receivingAccount.addr, assetID);
};


const transferASA = async function ({algodClient, assetID, sendingAccount, receivingAccount}) {
    // Transfer New Asset:
    // If receivingAccount has opted in to receive the new tokens, the tokens can be transferred from sender to receiver.
    
    // Account for changing transaction parameters before every transaction.
    let params = await algodClient.getTransactionParams().do();
    
    // Comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;

    let sender = sendingAccount.addr;
    let recipient = receivingAccount.addr;
    // revocationTarget is undefined as this is not a revocation operation. 
    let revocationTarget = undefined;
    // closeReaminderTo is set to undefined as we are not closing out an asset.
    let closeRemainderTo = undefined;
    
    // arbitrary data to be stored in the transaction; here, none is stored
    let note = undefined; 

    // Amount of the asset to transfer
    let amount = 1;

    // Signing and sending "txn" will send "amount" assets from "sender" to "recipient"
    let txn = makeAssetTransferTxnWithSuggestedParams(sender, recipient, closeRemainderTo, revocationTarget, amount, note, assetID, params);
    
    // Must be signed by the account sending the asset  
    let signedTxn = txn.signTxn(sendingAccount.sk)

    let submittedTxn = (await algodClient.sendRawTransaction(signedTxn).do());
    
    console.log("Submitted txn in transferASA(): " + submittedTxn.txId);
    
    // wait for transaction to be confirmed
    await waitForConfirmation(algodClient, submittedTxn.txId);

    // You should now see the assets listed in the account information
    console.log("Receiving account = " + receivingAccount.addr);

    await printAssetHolding(algodClient, receivingAccount.addr, assetID);
};



const destroyASA = async function ({algodClient, assetID, managerAccount}) {
    // Destroy an Asset:
    // All of the created assets should be back in the creators Account so we can delete the asset.
    // If this is not the case the asset deletion will fai.

    // Account for changing transaction parameters before every transaction.
    let params = await algodClient.getTransactionParams().do();
    
    // Comment out the next two lines to use suggested fee
    params.fee = 1000;
    params.flatFee = true;

    // The address for the from field must be the manager account.
    let managerAddress = managerAccount.addr;
    let note = undefined;

    // if all assets are held by the asset creator, the asset creator can sign and issue "txn" to remove the asset from the ledger. 
    let txn = makeAssetDestroyTxnWithSuggestedParams(managerAddress, note, assetID, params);
    
    // The transaction must be signed by the manager
    let signedTxn = txn.signTxn(managerAccount.sk)

    let submittedTxn = (await algodClient.sendRawTransaction(signedTxn).do());
    
    console.log("Submitted txn in destroyASA(): " + submittedTxn.txId);
    
    // wait for transaction to be confirmed
    await waitForConfirmation(algodClient, submittedTxn.txId);

    // No accounts should contain the destroyed assets
    console.log("AssetID in destroyASA(): " + assetID);
    await printCreatedAsset(algodClient, managerAccount.addr, assetID);
    await printAssetHolding(algodClient, managerAccount.addr, assetID);
};





// import pkg from '../node_modules/algosdk/dist/types/index.d.ts';
// import MyAlgoConnect from './node_modules/@randlabs/myalgo-connect/index';

import pkg from 'algosdk';
import MyAlgoConnect from '@randlabs/myalgo-connect'

const { Algodv2, mnemonicToSecretKey, makeAssetCreateTxnWithSuggestedParams, 
    makeAssetConfigTxnWithSuggestedParams, makeAssetTransferTxnWithSuggestedParams, makeAssetDestroyTxnWithSuggestedParams } = pkg;

const apiServer = 'https://testnet-algorand.api.purestake.io/ps2';
const port = '';

const token = {
   'X-API-Key': 'PkIkrh43cz7AzG1cwNh4Z18AYkTZI9p5aiCn20SI'
}

// Instantiate the algod wrapper
const algodClient = new Algodv2(token, apiServer, port);

let account1Mnemonic = "faith amateur account twist melody erode extra test project quit dress figure swim express random glare jealous screen achieve pave same asset produce about web";
let account2Mnemonic = "impose report into guitar cabbage rather seminar shoot sibling mean satoshi hollow torch critic drip rebel crumble cancel term jungle kiss couple abuse abstract course";
let account3Mnemonic = "umbrella moral marriage milk warm still surge member basic assist defense bracket multiply author despair insect clown cave aware scrap noble vacant blossom about party";

let account1 = mnemonicToSecretKey(account1Mnemonic);
let account2 = mnemonicToSecretKey(account2Mnemonic);
let account3 = mnemonicToSecretKey(account3Mnemonic);

console.log("Account 1 address = " + account1.addr);
console.log("Account 2 address = " + account2.addr);
console.log("Account 3 address = " + account3.addr + '\n');


// let assetID = await createASA({
//     algodClient: algodClient, 
//     creatorAccount: account1, 
//     managerAccount: account1
// });

// configureASA({
//     algodClient: algodClient, 
//     assetID: assetID,
//     oldManager: account1, 
//     newManager: account2
// }); 

// optInTransaction({
//     algodClient: algodClient, 
//     assetID: assetID,
//     receivingAccount: account3
// }); 

// transferASA({
//     algodClient: algodClient, 
//     assetID: assetID,
//     sendingAccount: account1,
//     receivingAccount: account3
// }); 

// destroyASA({
//     algodClient: algodClient, 
//     assetID: 26297063,
//     managerAccount: account2
// }); 








