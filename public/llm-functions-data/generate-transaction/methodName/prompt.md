
# Minting Tokens

- ALWAYS when minting tokens use `nft_batch_mint` method name with a similar structure to

```ts

```

# Granting Minters

- ALWAYS when adding or granting a minter to a contract use `grant_minter` method name with a similar structure to

```ts
{
    contractName: contractName,
    args: {
        account_id: minterId,
    },
    methodName: "grant_minter",
    gas: GAS,
    deposit: ONE_YOCTO,
}

```

# Transfer Tokens

- ALWAYS when adding or granting a minter to a contract use `nft_batch_transfer` method name with a similar structure to

```ts

const ids = transfers.map((transferElm) => {
    return [transferElm.tokenId, transferElm.receiverId];
});

{
    contractName: contractName,
    methodName: "nft_batch_transfer",
    args: {
        token_ids: ids,
    },  
    deposit: DEPOSIT_FOR_TRANSFER,
    gas: GAS_FOR_TRANSFER,
}

```

# Deploying Contract

Deploy store or contract

``````
{
      method_name: "create_store",
  args: {
        metadata: {
          spec: "nft-1.0.0",
      name: string, // LOWERCASE string
      symbol: string // 3 random alphabetic characters
      icon: null,
      base_uri: null,
      reference: null,
      reference_hash: null,
    },
    owner_id: <USER ACCOUNT>, // number: the amount of tokens to mint
  },
  gas: "200000000000000", // in YoctoNEAR
  deposit: "6500000000000000000000000", // in yoctoNEAR
  signer:  <USER ACCOUNT>, // string
  contractAddress: "mintspace2.testnet" OR "mintbase1.near"

}
``````