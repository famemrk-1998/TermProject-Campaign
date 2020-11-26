const fs = require("fs");
const Web3 = require("web3");
const mnemonic = "xxxxxxx"
const truffleURL = "xxxxxxx"
const HDWalletProvider = require("truffle-hdwallet-provider");
const provider = new HDWalletProvider(mnemonic, truffleURL)
const web3 = new Web3(provider);
const bytecode = fs.readFileSync('./build/__contract_campaign_sol_CampaignFactory.bin');
const abi = JSON.parse(fs.readFileSync('./build/__contract_campaign_sol_CampaignFactory.abi'));
const deploy = async() => {
    accounts = await web3.eth.getAccounts()
    console.log("Trying to deploy from accounts ", accounts[0]);
    campaign = await 
    new web3.eth.Contract(abi)
        .deploy({ 
            data: '0x'+bytecode, 
            arguments: [200,accounts[0]] 
        }).send({
            from: accounts[0], 
            gas:'1000000'
    });
    console.log('contract deployed to',campaign.options.address);
    process.exit();             
};
deploy();