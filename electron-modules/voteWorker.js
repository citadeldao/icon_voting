const IconService = require('icon-sdk-js');
const { IconWallet, IconBuilder, HttpProvider, SignedTransaction } = IconService;

const UPDATE_INTERVAL = 300000;
const API_URL = 'https://ctz.solidwallet.io/api/v3';
//3 ICX
const ICX_PRESERVE = 0;// 0x29A2241AF62C0000;

const { ValidationError, TransactionError } = require('./utils/errors');

const STATE_NEW = 0;
const STATE_IN_PROGRESS = 0;
const STATE_OK = 0;
const STATE_FAILED = 0;

//{model: 'UpdateLog', date, state, result}
//{model: 'Config', myAddress}
const db = require('./db');

async function start(myAddress, privateKey) {
    const httpProvider = new HttpProvider(API_URL);
    const iconService = new IconService(httpProvider);
    const iconWallet = IconWallet.loadPrivateKey(privateKey);
    if (iconWallet.getAddress() !== myAddress) {
        throw new ValidationError('ICX address mismatch!');
    }

    while (true) {
        //STEP 1: SHOULD BE LARGER THAN 1
        let claimableICX = await iconService.call(new IconBuilder.CallBuilder()
            .to('cx0000000000000000000000000000000000000000')
            .method('queryIScore')
            .params({ address: myAddress })
            .build()
        ).execute();

        console.log('claimableICX', parseInt(claimableICX.estimatedICX));

        //STEP 2: CLAIM AVAILABLE ISCORE
        let claimIScoreResult = await iconService.sendTransaction(
            new SignedTransaction(new IconBuilder.CallTransactionBuilder()
                .from(myAddress)
                .to('cx0000000000000000000000000000000000000000')
                .version('0x3')
                .nid('0x1')
                .nonce('0x0')
                .value('0x0')
                //TODO: Review
                .stepLimit(IconService.IconConverter.toBigNumber(108000))
                .timestamp(Date.now() * 1000)
                .method('claimIScore')
                .build(), iconWallet)
        ).execute();

        console.log('claimIScoreResult', claimIScoreResult);

        //STEP 3: GET AVAILABLE BALANCE FOR STAKING(from iostabc)
        let balance = await iconService.getBalance(myAddress).execute();
        console.log('balance', balance.toNumber(), balance.toNumber() - ICX_PRESERVE);

        //STEP 4: GET ALREADY STAKED BALANCE
        let stakedBalance = await iconService.call(new IconBuilder.CallBuilder()
            .to('cx0000000000000000000000000000000000000000')
            .method('getStake')
            .params({ address: myAddress })
            .build()
        ).execute();
        console.log('stakedBalance', parseInt(stakedBalance.stake));

        let valueToStake = balance.toNumber() - ICX_PRESERVE + stakedBalance.stake;
        console.log('valueToStake', valueToStake);

        //STEP 5: STAKE ALL AVAILABLE BALANCE
        let setStakeResult = await iconService.sendTransaction(
            new SignedTransaction(new IconBuilder.CallTransactionBuilder()
                .from(myAddress)
                .to('cx0000000000000000000000000000000000000000')
                .version('0x3')
                .nid('0x1')
                .nonce('0x0')
                .value('0x0')
                .method('setStake')
                //TODO: Review
                .stepLimit(IconService.IconConverter.toBigNumber(125000))
                .timestamp(Date.now() * 1000)
                .params({ value: valueToStake })
                .build(), iconWallet)
        ).execute();
        console.log('setStakeResult', setStakeResult);

        //STEP 6: CHECK VOTING POWER(from iostabc)
        let votingPowerTotal = await iconService.call(new IconBuilder.CallBuilder()
            .to('cx0000000000000000000000000000000000000000')
            .method('getStake')
            .params({ address: myAddress })
            .build()
        ).execute();
        console.log('votingPower', parseInt(votingPowerTotal.stake));


        let stakes = await db.findAsync({ model: 'Stake' });
        let stakesValueSum = stakes.reduce((prev, next) => prev + next.value, 0);
        console.log('db.stakesValueSum', stakesValueSum);
        if (stakesValueSum > 100) {
            throw new ValidationError(`Stakes value sum too large(${stakesValueSum} > 100)`);
        }

        //STEP 7: VOTE FOR ADDRESS
        let setDelegationResult = await iconService.sendTransaction(
            new SignedTransaction(new IconBuilder.CallTransactionBuilder()
                .from(myAddress)
                .to('cx0000000000000000000000000000000000000000')
                .version('0x3')
                .nid('0x1')
                .nonce('0x0')
                .value('0x0')
                //TODO: Review
                .stepLimit(IconService.IconConverter.toBigNumber(125000 + 25000 * stakes.length))
                .timestamp(Date.now() * 1000)
                .method('setDelegation')
                .params({
                    delegations: stakes.map(stake => ({
                        address: stake.address,
                    }))
                })
                .build(), iconWallet)
        ).execute();
        console.log(`setDelegation result`, setDelegationResult);

        await new Promise(resolve => setTimeout(resolve, UPDATE_INTERVAL));
    }
}

module.exports = start;