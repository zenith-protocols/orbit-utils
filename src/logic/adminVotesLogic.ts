import { Spec as ContractSpec, Option, i128, u32, u64 } from '@stellar/stellar-sdk/contract';
import { AdminVotesContract } from "../external/votes.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";

export async function getTotalSupply(
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting total supply ...`)
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    const totalSupply = await invokeSorobanOperation(
      adminVotesContract.totalSupply(),
      AdminVotesContract.votes_parsers.totalSupply,
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
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    await invokeSorobanOperation(
      adminVotesContract.setVoteSequence({ sequence }),
      AdminVotesContract.votes_parsers.setVoteSequence,
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
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    const pastTotalSupply = await invokeSorobanOperation(
      adminVotesContract.getPastTotalSupply({ sequence }),

      AdminVotesContract.votes_parsers.getPastTotalSupply,
      txParams
    )
    console.log(`Successfully got past total supply: ${pastTotalSupply}\n`)
    if (pastTotalSupply === undefined) {
      throw new Error('Failed to get past total supply: past total supply is undefined')
    }
    return pastTotalSupply
  } catch (e) {
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
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    const votes = await invokeSorobanOperation(
      adminVotesContract.getVotes({ account }),
      AdminVotesContract.votes_parsers.getVotes,
      txParams
    )
    console.log(`Successfully got votes: ${votes}\n`)
    if (votes === undefined) {
      throw new Error('Failed to get votes: votes is undefined')
    }
    return votes
  } catch (e) {
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
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    const pastVotes = await invokeSorobanOperation(
      adminVotesContract.getPastVotes({ user, sequence }),
      AdminVotesContract.votes_parsers.getPastVotes,
      txParams
    )
    console.log(`Successfully got past votes: ${pastVotes}\n`)
    if (pastVotes === undefined) {
      throw new Error('Failed to get past votes: past votes is undefined')
    }
    return pastVotes
  } catch (e) {
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
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    const delegate = await invokeSorobanOperation(
      adminVotesContract.getDelegate({ account }),
      AdminVotesContract.votes_parsers.getDelegate,
      txParams
    )
    console.log(`Successfully got delegate: ${delegate}\n`)
    if (delegate === undefined) {
      throw new Error('Failed to get delegate: delegate is undefined')
    }
    return delegate
  } catch (e) {
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
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    await invokeSorobanOperation(
      adminVotesContract.delegate({ account, delegatee }),
      AdminVotesContract.votes_parsers.delegate,
      txParams
    )
    console.log('Successfully delegated.')
  } catch (e) {
    console.log('Failed to delegate vote', e)
    throw e
  }
}

export async function initialize(
  admin: string,
  governor: string,
  decimal: u32,
  name: string,
  symbol: string,
  contract: string,
  txParams: TxParams
) {
  console.log(`Initializing vote...`)
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    await invokeSorobanOperation(
      adminVotesContract.initialize({ admin, governor, decimal, name, symbol }),
      AdminVotesContract.parsers.initialize,
      txParams
    )
    console.log('Admin Vote initialized successfully.')
  } catch (e) {
    console.log('Failed to initialize vote', e)
    throw e
  }
}

export async function mint(
  to: string,
  amount: i128,
  contract: string,
  txParams: TxParams
) {
  console.log(`Minting...`)
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    await invokeSorobanOperation(
      adminVotesContract.mint({ to, amount }),
      AdminVotesContract.parsers.mint,
      txParams
    )
    console.log(`Successfully minted.`)
  } catch (e) {
    console.log('Failed to mint', e)
    throw e
  }
}

export async function clawback(
  from: string,
  amount: i128,
  contract: string,
  txParams: TxParams
) {
  console.log(`Starting clawback...`)
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    await invokeSorobanOperation(
      adminVotesContract.clawback({ from, amount }),
      AdminVotesContract.parsers.clawback,
      txParams
    )
    console.log(`Successfully clawed back.`)
  } catch (e) {
    console.log('Failed to clawback', e)
    throw e
  }
}

export async function setAdmin(
  new_admin: string,
  contract: string,
  txParams: TxParams
) {
  console.log(`Setting Admin...`)
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    await invokeSorobanOperation(
      adminVotesContract.setAdmin({ new_admin }),
      AdminVotesContract.parsers.setAdmin,
      txParams
    )
    console.log(`Successfully set admin.`)
  } catch (e) {
    console.log('Failed to set admin', e)
    throw e
  }
}

export async function getAdmin(
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting admin ...`)
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    const admin = await invokeSorobanOperation(
      adminVotesContract.admin(),
      AdminVotesContract.parsers.admin,
      txParams
    );
    console.log(`Successfully got admin: ${admin}\n`)
    if (admin === undefined) {
      throw new Error('Failed to get admin: admin is undefined.')
    }
    return admin
  } catch (e) {
    console.log('Failed to get admin', e)
    throw e
  }
}

export async function balance(
  id: string,
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting balance...`)
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    const balance = await invokeSorobanOperation(
      adminVotesContract.balance({ id }),
      AdminVotesContract.parsers.balance,
      txParams
    )
    console.log(`Successfully got balance: ${balance}\n`)
    if (balance === undefined) {
      throw new Error('Failed to get balance: balance is undefined')
    }
    return balance
  } catch (e) {
    console.log('Failed to get balance', e)
    throw e
  }
}

export async function decimals(
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting decimals...`)
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    const decimals = await invokeSorobanOperation(
      adminVotesContract.decimals(),
      AdminVotesContract.parsers.decimals,
      txParams
    )
    console.log(`Successfully got decimals: ${decimals}\n`)
    if (decimals === undefined) {
      throw new Error('Failed to get decimals: decimals is undefined.')
    }
    return decimals
  } catch (e) {
    console.log('Failed to get decimals', e)
    throw e
  }
}

export async function name(
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting name...`)
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    const name = await invokeSorobanOperation(
      adminVotesContract.name(),
      AdminVotesContract.parsers.name,
      txParams
    )
    console.log(`Successfully got name: ${name}\n`)
    if (name === undefined) {
      throw new Error('Failed to get name: name is undefined.')
    }
    return name
  } catch (e) {
    console.log('Failed to get name', e)
    throw e
  }
}

export async function symbol(
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting symbol...`)
  const adminVotesContract = new AdminVotesContract(contract)
  try {
    const symbol = await invokeSorobanOperation(
      adminVotesContract.symbol(),
      AdminVotesContract.parsers.symbol,
      txParams
    )
    console.log(`Successfully got symbol: ${symbol}\n`)
    if (symbol === undefined) {
      throw new Error('Failed to get symbol: symbol is undefined.')
    }
    return symbol
  } catch (e) {
    console.log('Failed to get symbol', e)
    throw e
  }
}