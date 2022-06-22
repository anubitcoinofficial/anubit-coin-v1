
const DevToken = artifacts.require("AnubitToken");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

// Start a test series named DevToken, it will use 10 test accounts 
contract("DevToken", async accounts => {
    // each it is a new test, and we name our first test initial supply
    it("initial supply", async () => {
        // wait until devtoken is deplyoed, store the results inside devToken
        // the result is a client to the Smart contract api
        devToken = await DevToken.deployed();
        // call our totalSUpply function
        let supply = await devToken.totalSupply()

        // Assert that the supply matches what we set in migration
        assert.equal(supply.toNumber(), 100000000, "Initial supply was not the same as in migration")


    });


    it("transfering tokens", async() => {
        devToken = await DevToken.deployed();

        // Grab initial balance
        let initial_balance = await devToken.balanceOf(accounts[1]);

        // transfer tokens from account 0 to 1 
        await devToken.transfer(accounts[1], 100);
        
        let after_balance = await devToken.balanceOf(accounts[1]);

        assert.equal(after_balance.toNumber(), initial_balance.toNumber()+100, "Balance should have increased on reciever")
    
        // We can change the msg.sender using the FROM value in function calls.
        let account2_initial_balance = await devToken.balanceOf(accounts[2]);

        await devToken.transfer(accounts[2], 20, { from: accounts[1]});
        // Make sure balances are switched on both accounts
        let account2_after_balance = await devToken.balanceOf(accounts[2]);
        let account1_after_balance = await devToken.balanceOf(accounts[1]);

        assert.equal(account1_after_balance.toNumber(), after_balance.toNumber()-20, "Should have reduced account 1 balance by 20");
        assert.equal(account2_after_balance.toNumber(), account2_initial_balance.toNumber()+20, "Should have givne accounts 2 20 tokens");
    

        // Try transfering too much
        try {
            await devToken.transfer(accounts[2], 2000000000000, { from:accounts[1]});
        }catch(error){
            assert.equal(error.reason, "DevToken: cant transfer more than your account holds");
        }
    })

    it ("allow account some allowance", async() => {
        devToken = await DevToken.deployed();

        
        try{
            // Give account(0) access too 100 tokens on creator
            await devToken.approve('0x0000000000000000000000000000000000000000', 100);    
        }catch(error){
            assert.equal(error.reason, 'DevToken: approve cannot be to zero address', "Should be able to approve zero address");
        }

        try{
            // Give account 1 access too 100 tokens on zero account
            await devToken.approve(accounts[1], 100);    
        }catch(error){
            assert.fail(error); // shold not fail
        }

        // Verify by checking allowance
        let allowance = await devToken.allowance(accounts[0], accounts[1]);

        assert.equal(allowance.toNumber(), 100, "Allowance was not correctly inserted");
    })

    it("transfering with allowance", async() => {
        devToken = await DevToken.deployed();

        try{
            // Account 1 should have 100 tokens by now to use on account 0 
            // lets try using more 
            await devToken.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1] } );
        }catch(error){

            assert.equal(error.reason, "DevToken: You cannot spend that much on this account", "Failed to detect overspending")
        }
        let init_allowance = await devToken.allowance(accounts[0], accounts[1]);
        console.log("init balalnce: ", init_allowance.toNumber())
        try{
            // Account 1 should have 100 tokens by now to use on account 0 
            // lets try using more 
            let worked = await devToken.transferFrom(accounts[0], accounts[2], 50, {from:accounts[1]});
        }catch(error){
            assert.fail(error);
        }

        // Make sure allowance was changed
        let allowance = await devToken.allowance(accounts[0], accounts[1]);
        assert.equal(allowance.toNumber(), 50, "The allowance should have been decreased by 50")

        
    })



});
