import { Spec as ContractSpec, Option, i128, u32, u64 } from '@stellar/stellar-sdk/contract';
import { BondingVotesContract } from "../external/votes.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";

export async function getTotalSupply(
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting total supply ...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    const totalSupply = await invokeSorobanOperation(
      bondingVotesContract.totalSupply(),
      BondingVotesContract.votes_parsers.totalSupply,
      txParams
    );
    console.log(`Successfully got total supply: ${totalSupply}\n`)
    if (totalSupply === undefined) {
      throw new Error('Failed to get total supply: total supply is undefined.')
    }
    return totalSupply
  } catch (e) {
    console.log('Failed to get total supply', e)
    throw e
  }
}

export async function setVoteSequence(
  sequence: u32,
  contract: string,
  txParams: TxParams
) {
  console.log(`Setting vote sequence...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    await invokeSorobanOperation(
      bondingVotesContract.setVoteSequence({ sequence }),
      BondingVotesContract.votes_parsers.setVoteSequence,
      txParams
    )
    console.log(`Vote sequence set successfully.`)
  } catch (e) {
    console.log('Failed to set vote sequence', e)
    throw e
  }
}

export async function getPastTotalSupply(
  sequence: u32,
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting past total supply ...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    const pastTotalSupply = await invokeSorobanOperation(
      bondingVotesContract.getPastTotalSupply({sequence}),

      BondingVotesContract.votes_parsers.getPastTotalSupply,
      txParams
    )
    console.log(`Successfully got past total supply: ${pastTotalSupply}\n`)
    if(pastTotalSupply === undefined) {
      throw new Error('Failed to get past total supply: past total supply is undefined')
    }
    return pastTotalSupply
  } catch(e) {
    console.log('Failed to get past total supply', e)
    throw e
  }
}

export async function getVotes(
  account: string,
  contract: string,
  txParams: TxParams
) { 
  console.log(`Getting votes...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    const votes = await invokeSorobanOperation(
      bondingVotesContract.getVotes({account}),
      BondingVotesContract.votes_parsers.getVotes,
      txParams
    )
    console.log(`Successfully got votes: ${votes}\n`)
    if(votes === undefined) {
      throw new Error('Failed to get votes: votes is undefined')
    }
    return votes
  } catch(e) {
    console.log('Failed to get votes', e)
    throw e
  }
}

export async function getPastVotes(
  user: string, 
  sequence: u32,
  contract: string,
  txParams: TxParams
) { 
  console.log(`Getting past votes...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    const pastVotes = await invokeSorobanOperation(
      bondingVotesContract.getPastVotes({user, sequence}),
      BondingVotesContract.votes_parsers.getPastVotes,
      txParams
    )
    console.log(`Successfully got past votes: ${pastVotes}\n`)
    if(pastVotes === undefined) {
      throw new Error('Failed to get past votes: past votes is undefined')
    }
    return pastVotes
  } catch(e) {
    console.log('Failed to get past votes', e)
    throw e
  }
}

export async function getDelegate(
  account: string,
  contract: string,
  txParams: TxParams
) { 
  console.log(`Getting delegate...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    const delegate = await invokeSorobanOperation(
      bondingVotesContract.getDelegate({account}),
      BondingVotesContract.votes_parsers.getDelegate,
      txParams
    )
    console.log(`Successfully got delegate: ${delegate}\n`)
    if(delegate === undefined) {
      throw new Error('Failed to get delegate: delegate is undefined')
    }
    return delegate
  } catch(e) {
    console.log('Failed to get delegate', e)
    throw e
  }
}

export async function delegate(
  account: string,
  delegatee: string,
  contract: string,
  txParams: TxParams
) { 
  console.log(`Delegating vote...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    await invokeSorobanOperation(
      bondingVotesContract.delegate({account, delegatee}),
      BondingVotesContract.votes_parsers.delegate,
      txParams
    )
    console.log('Successfully delegated.')
  } catch(e) {
    console.log('Failed to delegate vote', e)
    throw e
  }
}

export async function initialize(
  token: string,
  governor: string,
  name: string,
  symbol: string,
  contract: string,
  txParams: TxParams
) { 
  console.log(`Initializing vote...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    await invokeSorobanOperation(
      bondingVotesContract.initialize({token, governor, name, symbol}),
      BondingVotesContract.parsers.initialize,
      txParams
    )
    console.log('Vote initialized successfully.')
  } catch(e) {
    console.log('Failed to initialize vote', e)
    throw e
  }
}

export async function deposit(
  from: string,
  amount: i128,
  contract: string,
  txParams: TxParams
) { 
  console.log(`Deposit...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    await invokeSorobanOperation(
      bondingVotesContract.deposit({from, amount}),
      BondingVotesContract.parsers.deposit,
      txParams
    )
    console.log('Deposited successfully.')
  } catch(e) {
    console.log('Failed to deposite', e)
    throw e
  }
}

export async function withdraw(
  from: string,
  amount: i128,
  contract: string,
  txParams: TxParams
) { 
  console.log(`Withdraw...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    await invokeSorobanOperation(
      bondingVotesContract.withdraw({from, amount}),
      BondingVotesContract.parsers.withdraw,
      txParams
    )
    console.log('Withdrew successfully.')
  } catch(e) {
    console.log('Failed to withdraw', e)
    throw e
  }
}

export async function claim(
  address: string,
  contract: string,
  txParams: TxParams
) { 
  console.log(`Claiming...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    const claim = await invokeSorobanOperation(
      bondingVotesContract.claim({address}),
      BondingVotesContract.parsers.claim,
      txParams
    )
    console.log(`Claimed successfully: ${claim}\n`)
    if(claim === undefined) {
      throw new Error('Failed to claim: claim is undefined.')
    }
    return claim
  } catch(e) {
    console.log('Failed to claim', e)
    throw e
  }
}

export async function setEmis(
  tokens: i128,
  expiration: u64,
  contract: string,
  txParams: TxParams
) { 
  console.log('Setting emis...')
  const bondingVotesContract = new BondingVotesContract(contract)
  try{
    await invokeSorobanOperation(
      bondingVotesContract.setEmis({tokens, expiration}),
      BondingVotesContract.parsers.setEmis,
      txParams
    )
    console.log('Successfully set emis.')
  } catch(e) {
    console.log('Failed to set Emis')
  }
}

export async function balance(
  id: string,
  contract: string,
  txParams: TxParams
) { 
  console.log(`Getting balance...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    const balance = await invokeSorobanOperation(
      bondingVotesContract.balance({id}),
      BondingVotesContract.parsers.balance,
      txParams
    )
    console.log(`Successfully got balance: ${balance}\n`)
    if(balance === undefined) {
      throw new Error('Failed to get balance: balance is undefined')
    }
    return balance
  } catch(e) {
    console.log('Failed to get balance', e)
    throw e
  }
}

export async function decimals(
  contract: string,
  txParams: TxParams
) { 
  console.log(`Getting decimals...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    const decimals = await invokeSorobanOperation(
      bondingVotesContract.decimals(),
      BondingVotesContract.parsers.decimals,
      txParams
    )
    console.log(`Successfully got decimals: ${decimals}\n`)
    if(decimals === undefined) {
      throw new Error('Failed to get decimals: decimals is undefined.')
    }
    return decimals
  } catch(e) {
    console.log('Failed to get decimals', e)
    throw e
  }
}

export async function name(
  contract: string,
  txParams: TxParams
) { 
  console.log(`Getting name...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    const name = await invokeSorobanOperation(
      bondingVotesContract.name(),
      BondingVotesContract.parsers.name,
      txParams
    )
    console.log(`Successfully got name: ${name}\n`)
    if(name === undefined) {
      throw new Error('Failed to get name: name is undefined.')
    }
    return name
  } catch(e) {
    console.log('Failed to get name', e)
    throw e
  }
}

export async function symbol(
  contract: string,
  txParams: TxParams
) { 
  console.log(`Getting symbol...`)
  const bondingVotesContract = new BondingVotesContract(contract)
  try {
    const symbol = await invokeSorobanOperation(
      bondingVotesContract.symbol(),
      BondingVotesContract.parsers.symbol,
      txParams
    )
    console.log(`Successfully got symbol: ${symbol}\n`)
    if(symbol === undefined) {
      throw new Error('Failed to get symbol: symbol is undefined.')
    }
    return symbol
  } catch(e) {
    console.log('Failed to get symbol', e)
    throw e
  }
}