import { Spec as ContractSpec, Option, i128, u32, u64 } from '@stellar/stellar-sdk/contract';
import { TokenVotesContract } from "../external/votes.js";
import { invokeSorobanOperation, TxParams } from "../utils/tx.js";

export async function allowance(
  from: string,
  spender: string,
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting allowance...`);
  const tokenVotesContract = new TokenVotesContract(contract);
  try {
    const allowance = await invokeSorobanOperation(
      tokenVotesContract.allowance({ from, spender }),
      TokenVotesContract.parsers.allowance,
      txParams
    );
    console.log(`Successfully got allowance: ${allowance}\n`);
    return allowance;
  } catch (e) {
    console.log('Failed to get allowance', e);
    throw e;
  }
}

export async function approve(
  from: string,
  spender: string,
  amount: i128,
  expiration_ledger: u32,
  contract: string,
  txParams: TxParams
) {
  console.log(`Approving spender...`);
  const tokenVotesContract = new TokenVotesContract(contract);
  try {
    await invokeSorobanOperation(
      tokenVotesContract.approve({ from, spender, amount, expiration_ledger }),
      TokenVotesContract.parsers.approve,
      txParams
    );
    console.log(`Successfully approved spender.`);
  } catch (e) {
    console.log('Failed to approve', e);
    throw e;
  }
}

export async function balance(
  id: string,
  contract: string,
  txParams: TxParams
) { 
  console.log(`Getting balance...`)
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    const balance = await invokeSorobanOperation(
      tokenVotesContract.balance({id}),
      TokenVotesContract.parsers.balance,
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

export async function transfer(
  from: string,
  to: string,
  amount: i128,
  contract: string,
  txParams: TxParams
) {
  console.log(`Transfering tokens...`);
  const tokenVotesContract = new TokenVotesContract(contract);
  try {
    await invokeSorobanOperation(
      tokenVotesContract.transfer({ from, to, amount }),
      TokenVotesContract.parsers.transfer,
      txParams
    );
    console.log(`Successfully transfered tokens.`);
  } catch (e) {
    console.log('Failed to transfer tokens', e);
    throw e;
  }
}

export async function transferFrom(
  spender: string,
  from: string,
  to: string,
  amount: i128,
  contract: string,
  txParams: TxParams
) {
  console.log(`Transfering tokens from spender...`);
  const tokenVotesContract = new TokenVotesContract(contract);
  try {
    await invokeSorobanOperation(
      tokenVotesContract.transferFrom({spender, from, to, amount }),
      TokenVotesContract.parsers.transferFrom,
      txParams
    );
    console.log(`Successfully transfered tokens from spender.`);
  } catch (e) {
    console.log('Failed to transfer tokens from spender', e);
    throw e;
  }
}

export async function burn(
  from: string,
  amount: i128,
  contract: string,
  txParams: TxParams
) {
  console.log(`Burning tokens...`);
  const tokenVotesContract = new TokenVotesContract(contract);
  try {
    await invokeSorobanOperation(
      tokenVotesContract.burn({ from, amount }),
      TokenVotesContract.parsers.burn,
      txParams
    );
    console.log(`Successfully burned tokens.`);
  } catch (e) {
    console.log('Failed to burn tokens', e);
    throw e;
  }
}

export async function burnFrom(
  spender: string,
  from: string,
  amount: i128,
  contract: string,
  txParams: TxParams
) {
  console.log(`Burning tokens from spender...`);
  const tokenVotesContract = new TokenVotesContract(contract);
  try {
    await invokeSorobanOperation(
      tokenVotesContract.burnFrom({ spender, from, amount }),
      TokenVotesContract.parsers.burnFrom,
      txParams
    );
    console.log(`Successfully burned tokens from spender.`);
  } catch (e) {
    console.log('Failed to burn tokens from spender', e);
    throw e;
  }
}

export async function decimals(
  contract: string,
  txParams: TxParams
) { 
  console.log(`Getting decimals...`)
  const bondingVotesContract = new TokenVotesContract(contract)
  try {
    const decimals = await invokeSorobanOperation(
      bondingVotesContract.decimals(),
      TokenVotesContract.parsers.decimals,
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
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    const name = await invokeSorobanOperation(
      tokenVotesContract.name(),
      TokenVotesContract.parsers.name,
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
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    const symbol = await invokeSorobanOperation(
      tokenVotesContract.symbol(),
      TokenVotesContract.parsers.symbol,
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

export async function getTotalSupply(
  contract: string,
  txParams: TxParams
) {
  console.log(`Getting total supply ...`)
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    const totalSupply = await invokeSorobanOperation(
      tokenVotesContract.totalSupply(),
      TokenVotesContract.votes_parsers.totalSupply,
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
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    await invokeSorobanOperation(
      tokenVotesContract.setVoteSequence({ sequence }),
      TokenVotesContract.votes_parsers.setVoteSequence,
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
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    const pastTotalSupply = await invokeSorobanOperation(
      tokenVotesContract.getPastTotalSupply({ sequence }),

      TokenVotesContract.votes_parsers.getPastTotalSupply,
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
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    const votes = await invokeSorobanOperation(
      tokenVotesContract.getVotes({ account }),
      TokenVotesContract.votes_parsers.getVotes,
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
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    const pastVotes = await invokeSorobanOperation(
      tokenVotesContract.getPastVotes({ user, sequence }),
      TokenVotesContract.votes_parsers.getPastVotes,
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
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    const delegate = await invokeSorobanOperation(
      tokenVotesContract.getDelegate({ account }),
      TokenVotesContract.votes_parsers.getDelegate,
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
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    await invokeSorobanOperation(
      tokenVotesContract.delegate({ account, delegatee }),
      TokenVotesContract.votes_parsers.delegate,
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
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    await invokeSorobanOperation(
      tokenVotesContract.initialize({ admin, governor, decimal, name, symbol }),
      TokenVotesContract.parsers.initialize,
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
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    await invokeSorobanOperation(
      tokenVotesContract.mint({ to, amount }),
      TokenVotesContract.parsers.mint,
      txParams
    )
    console.log(`Successfully minted.`)
  } catch (e) {
    console.log('Failed to mint', e)
    throw e
  }
}

export async function setAdmin(
  new_admin: string,
  contract: string,
  txParams: TxParams
) {
  console.log(`Setting Admin...`)
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    await invokeSorobanOperation(
      tokenVotesContract.setAdmin({ new_admin }),
      TokenVotesContract.parsers.setAdmin,
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
  const tokenVotesContract = new TokenVotesContract(contract)
  try {
    const admin = await invokeSorobanOperation(
      tokenVotesContract.admin(),
      TokenVotesContract.parsers.admin,
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