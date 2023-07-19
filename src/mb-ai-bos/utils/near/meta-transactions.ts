import { Account } from '@near-js/accounts';
import { KeyPair, PublicKey } from '@near-js/crypto';
import type { KeyStore } from '@near-js/keystores';
import { InMemoryKeyStore } from '@near-js/keystores';
import { JsonRpcProvider } from '@near-js/providers';
import { InMemorySigner } from '@near-js/signers';
import type { SignedDelegate } from '@near-js/transactions';
import { actionCreators } from '@near-js/transactions';
import BN from 'bn.js';
import * as nearAPI from 'near-api-js';

const { utils } = nearAPI;

export const { signedDelegate } = actionCreators;
const keyStore = new InMemoryKeyStore();

export const instatiateAccount = async (network: string, accountName: string, pk: string) => {
  const relayerKeyStore = await authenticatedKeyStore(network, accountName, pk);

  return await connect(accountName, relayerKeyStore, network);
};

export const authenticatedKeyStore = async (network: string, account: string, pk: string): Promise<KeyStore> => {
  await keyStore.setKey(network, account, KeyPair.fromString(pk));

  return keyStore;
};

export const randomKeyStore = async (network: string, account: string): Promise<KeyStore> => {
  const kp = KeyPair.fromRandom('ed25519');
  await keyStore.setKey(network, account, kp);

  return keyStore;
};

export const connect = async (accountId: string, keyStore: KeyStore, network = 'mainnet'): Promise<Account> => {
  const provider = new JsonRpcProvider({
    url: network == 'mainnet' ? 'https://rpc.mainnet.near.org' : 'https://rpc.testnet.near.org',
  });

  const signer = new InMemorySigner(keyStore);

  return new Account(
    {
      networkId: network,
      provider,
      signer,
      jsvmAccountId: '',
    },
    accountId,
  );
};

export const createAccount = async (implicitAccount: string, publicKey: string, network: string) => {
  const isMainnet = network === 'mainnet';
  const RELAYER_ACCOUNT: string | undefined = isMainnet
    ? process.env.RELAYER_ACCOUNT_ID_NEAR_MAINNET
    : process.env.RELAYER_ACCOUNT_ID_NEAR_TESTNET;

  if (!RELAYER_ACCOUNT) {
    throw new Error('Signer details not found in firebase');
  }

  const relayerPrivateKey = isMainnet
    ? (process.env.RELAYER_PRIVATE_KEY_NEAR_MAINNET as string)
    : (process.env.RELAYER_PRIVATE_KEY_NEAR_TESTNET as string);

  const relayerAccount = await instatiateAccount(network, RELAYER_ACCOUNT, relayerPrivateKey);
  await relayerAccount.createAccount(implicitAccount, PublicKey.fromString(publicKey), new BN('0'));
};

export const submitTransaction = async ({
  network = 'testnet',
  delegate,
}: {
  network: string;
  delegate: SignedDelegate;
}) => {
  const isMainnet = network === 'mainnet';
  const RELAYER_ACCOUNT: string | undefined = isMainnet
    ? process.env.RELAYER_ACCOUNT_ID_NEAR_MAINNET
    : process.env.RELAYER_ACCOUNT_ID_NEAR_TESTNET;

  try {
    const relayerPrivateKey = isMainnet
      ? (process.env.RELAYER_PRIVATE_KEY_NEAR_MAINNET as string)
      : (process.env.RELAYER_PRIVATE_KEY_NEAR_TESTNET as string);

    if (!RELAYER_ACCOUNT || !relayerPrivateKey) {
      throw new Error('Signer details not found in firebase');
    }
    //Instatiate mintbus account that runs transactions
    const relayerAccount = await instatiateAccount(network, RELAYER_ACCOUNT, relayerPrivateKey);

    const result = await relayerAccount.signAndSendTransaction({
      actions: [signedDelegate(delegate)],
      receiverId: delegate.delegateAction.senderId,
    });

    return result;
  } catch (error) {
    throw error;
  }
};
