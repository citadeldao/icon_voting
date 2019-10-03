const electron = require('electron');
const IconService = require('icon-sdk-js');
const { IconWallet, IconBuilder, HttpProvider, SignedTransaction } = IconService;

//Day interval
const UPDATE_INTERVAL = 86400000;
//5 seconds
const TX_DELAY = 5000;
const API_URL = 'https://ctz.solidwallet.io/api/v3';
//0.3 ICX
const ICX_PRESERVE = 0x29A2241AF62C0000 / 10;

const { ValidationError, TransactionError } = require('./utils/errors');

//{model: 'UpdateLog', date, state, result, address, preps}
const db = require('./db');

async function start(myAddress, privateKey, eventSender) {
    const httpProvider = new HttpProvider(API_URL);
    const iconService = new IconService(httpProvider);
    const iconWallet = IconWallet.loadPrivateKey(privateKey);
    if (iconWallet.getAddress() !== myAddress) {
        throw new ValidationError('ICX address mismatch!');
    }

    while (true) {
        let stakes = await db.findAsync({ model: 'Stake' });

        if (stakes.length) {
            try {
                //STEP 1: SHOULD BE LARGER THAN 1
                let claimableICX = await iconService.call(new IconBuilder.CallBuilder()
                    .to('cx0000000000000000000000000000000000000000')
                    .method('queryIScore')
                    .params({ address: myAddress })
                    .build()
                ).execute();
                eventSender.send('/logs', `claimableICX: ${parseInt(claimableICX.estimatedICX)}`);

                if (parseInt(claimableICX.estimatedICX) >= 1) {
                    //STEP 2: CLAIM AVAILABLE ISCORE
                    let claimIScoreResult = await iconService.sendTransaction(
                        new SignedTransaction(new IconBuilder.CallTransactionBuilder()
                            .from(myAddress)
                            .to('cx0000000000000000000000000000000000000000')
                            .version('0x3')
                            .nid('0x1')
                            .nonce('0x0')
                            .value('0x0')
                            .stepLimit(IconService.IconConverter.toBigNumber(108000))
                            .timestamp(Date.now() * 1000)
                            .method('claimIScore')
                            .build(), iconWallet)
                    ).execute();
                    eventSender.send('/logs', `claimIScoreResult: ${claimIScoreResult}`);
                    await new Promise(resolve => setTimeout(resolve, TX_DELAY));
                }

                //STEP 3: GET AVAILABLE BALANCE FOR STAKING(from iostabc)
                let balance = await iconService.getBalance(myAddress).execute();
                eventSender.send('/logs', `balance: ${balance.toNumber()}`);

                //STEP 4: GET ALREADY STAKED BALANCE
                let stakedBalance = await iconService.call(new IconBuilder.CallBuilder()
                    .to('cx0000000000000000000000000000000000000000')
                    .method('getStake')
                    .params({ address: myAddress })
                    .build()
                ).execute();
                eventSender.send('/logs', `stakedBalance: ${parseInt(stakedBalance.stake)}`);

                let valueToStake = balance.toNumber() - ICX_PRESERVE + parseInt(stakedBalance.stake);
                eventSender.send('/logs', `valueToStake: ${valueToStake}`);

                if (valueToStake > ICX_PRESERVE) {
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
                            .params({ value: `0x${valueToStake.toString(16)}` })
                            .build(), iconWallet)
                    ).execute();
                    eventSender.send('/logs', `setStakeResult: ${setStakeResult}`);

                    await new Promise(resolve => setTimeout(resolve, TX_DELAY));
                }

                //STEP 6: CHECK VOTING POWER(from iostabc)
                let votingPowerTotal = await iconService.call(new IconBuilder.CallBuilder()
                    .to('cx0000000000000000000000000000000000000000')
                    .method('getStake')
                    .params({ address: myAddress })
                    .build()
                ).execute();
                eventSender.send('/logs', `votingPower: ${parseInt(votingPowerTotal.stake)}`);

                let stakesValueSum = stakes.reduce((prev, next) => prev + next.value, 0);
                eventSender.send('/logs', `stakesValueSum: ${stakesValueSum}`);

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
                        .stepLimit(IconService.IconConverter.toBigNumber(125000 + 25000 * stakes.length))
                        .timestamp(Date.now() * 1000)
                        .method('setDelegation')
                        .params({
                            delegations: stakes.map(stake => ({
                                address: stake.address,
                                value: `0x${((stake.value / 100) * votingPowerTotal.stake).toString(16)}`
                            }))
                        })
                        .build(), iconWallet)
                ).execute();
                eventSender.send('/logs', `setDelegation result: ${setDelegationResult}`);
            }
            catch (err) {
                console.error(err);
                eventSender.send('/error', err);
            }
        }
        else {
            eventSender.send('/logs', 'Skipped, invalid amount of votes');
        }

        await new Promise(resolve => setTimeout(resolve, UPDATE_INTERVAL));
    }
}

module.exports = start;