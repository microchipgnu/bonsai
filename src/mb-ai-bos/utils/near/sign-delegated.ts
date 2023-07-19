import { getKeys } from '@near-js/biometric-ed25519';
import { InMemoryKeyStore } from '@near-js/keystores';
import { actionCreators } from '@near-js/transactions';
import BN from 'bn.js';

import { connect } from './meta-transactions';

export const signDelegatedTransaction = async ({
  network,
  signer,
  privateKey,
  transaction,
  contractAddress,
}: {
  network: string;
  signer: string;
  privateKey: string;
  transaction: {
    methodName: string;
    args: any;
    gas: string | number;
    deposit: string | number;
  };
  contractAddress: string;
}) => {
  // const signerAccount = await instatiateAccount(network, signer, privateKey);
  const keyStore = new InMemoryKeyStore();
  const keys = await getKeys(signer);

  const localPublicKey = JSON.parse(localStorage.getItem('accountDetails') as string).publicKey;

  let asdasd = null;

  keys.forEach((key) => {
    if (key.getPublicKey().toString() === localPublicKey) {
      asdasd = key;
    }
  });

  if (!asdasd) return;

  await keyStore.setKey(network, signer, asdasd);
  const signerAccount = await connect(signer, keyStore, network);

  const action = actionCreators.functionCall(
    transaction.methodName,
    JSON.parse(transaction.args),
    new BN(transaction.gas),
    new BN(transaction.deposit),
  );

  const delegate = await signerAccount.signedDelegate({
    actions: [action],
    blockHeightTtl: 600,
    receiverId: contractAddress,
  });

  return delegate;
};
