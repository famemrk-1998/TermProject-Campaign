const assert = require("assert");
const ganache = require("ganache-cli");
const fs = require("fs");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const bytecode = fs.readFileSync('./build/__contract_campaign_sol_Campaign.bin');
const abi = JSON.parse(fs.readFileSync('./build/__contract_campaign_sol_Campaign.abi'));
var accounts;
var campaign;

beforeEach(async () => { 
    accounts = await web3.eth.getAccounts()
    campaign = await 
    new web3.eth.Contract(abi)
        .deploy({
            data: '0x'+bytecode,
            arguments: [200,accounts[0]] 
        }).send({
            from: accounts[0], 
            gas:'1000000'
    });

});
describe('Campaign',() => {
    it('Deploys a campaign contract', () => { 
        assert.ok(campaign.options.address); 
    });
    it('Create request',async ()=> {
        var request = "yes"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});        
        } catch (err) {
            console.log(err)
            request = "no";
        }
        assert.strictEqual("yes", request);
    });
    it('Another create request',async ()=> {
        var request = "yes"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[2],gas: 1000000});        
        } catch (err) {
            request = "no";
        }
        assert.strictEqual("no", request);
    });
    it('Approved request',async ()=> {
        var request = "pass"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("300", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});        
        } catch (err) {
            console.log(err);
            request = "not pass";
        }
        assert.strictEqual("pass", request);
    }); 
    it('Require minimum wei to contribute',async ()=> {
        var status = "pass"
        try {
            await campaign.methods.contribute().send({from: accounts[3],value: web3.utils.toWei("199", "wei")});        
        } catch (err) {
            status = "not pass";
        }
        assert.strictEqual("not pass", status);
    }); 
    it('Only contributer can approve request',async ()=> {
        var aprv = "aprroved"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("300", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[3]});        
        } catch (err) {
            aprv = "not approved";
        }
        assert.strictEqual("not approved", aprv);
    });
    it('Approver approved request twice',async ()=> {
        var aprv = "approved"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("300", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});      
        } catch (err) {
            aprv = "reject";
        }
        assert.strictEqual("reject", aprv);
    });
    it('Finalize request',async ()=> {
        var pass = "final"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("300", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});        
            await campaign.methods.finalizeRequest(0).send({from: accounts[0]});        
        } catch (err) {
            console.log(err);
            pass = "reject";
        }
        assert.strictEqual("final", pass);
    });
    it('Approved > 50% of all approver to finalize',async ()=> {
        var status = "pass"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("300", "wei")});
            await campaign.methods.contribute().send({from: accounts[3],value: web3.utils.toWei("300", "wei")});
            await campaign.methods.contribute().send({from: accounts[4],value: web3.utils.toWei("300", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});            
            await campaign.methods.finalizeRequest(0).send({from: accounts[0]});        
        } catch (err) {
            status = "not pass";
        }
        assert.strictEqual("not pass", status);
    });
    it('Complete request',async ()=> {
        var status = "finalize"
        try {
            await campaign.methods.createRequest('testdesc',100,accounts[1]).send({from: accounts[0],gas: 1000000});       
            await campaign.methods.contribute().send({from: accounts[2],value: web3.utils.toWei("300", "wei")});
            await campaign.methods.approveRequest(0).send({from: accounts[2]});        
            await campaign.methods.finalizeRequest(0).send({from: accounts[0]});        
            await campaign.methods.finalizeRequest(0).send({from: accounts[0]});        
        } catch (err) {
            status = "error";
        }
        assert.strictEqual("error", status);
    });  
});