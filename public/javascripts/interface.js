let createButton = document.getElementById("createButton");
let transferButton = document.getElementById("transferButton");

createButton.onclick = function () {
    console.log("createButton pressed");
};

transferButton.onclick = function () {
    console.log("transferButton pressed");

    // window.alert("TEST");

    connectToMyAlgo();


    // const myAlgoWallet = new MyAlgo();

    // const myAlgoWallet = new MyAlgo();

    // const { MyAlgoWallet } = require('@randlabs/myalgo-connect');

    // const myAlgoWallet = new MyAlgo();

    // myAlgoWallet.connect()
    // .then((accounts) => {
    //     // Accounts is an array that has all public addresses shared by the user
    // })
    // .catch((err) => {
    //     // Error
    // });
};
