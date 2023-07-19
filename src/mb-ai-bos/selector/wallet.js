import { createKey, getKeys } from '@near-js/biometric-ed25519';
import { createAction } from '@near-wallet-selector/wallet-utils';
import * as nearAPI from 'near-api-js';
import { uuid } from 'uuidv4';

const {
  transactions: { encodeSignedDelegate },
} = nearAPI;

import BN from 'bn.js';

import { networks } from '@/utils/config';

export class MbBosAiWallet {
  constructor({ signInContractId, networkId, relayerUrl }) {
    this.networkId = networkId;
    this.signInContractId = signInContractId;
    this.activeAccountId = window.localStorage.getItem('mb-bos-ai:activeAccountId') || '';

    this.keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    this.near = new nearAPI.Near({
      ...networks[networkId],
      deps: { keyStore: this.keyStore },
    });
    this.relayerUrl = relayerUrl;
  }

  getContractId() {
    return this.signInContractId;
  }

  getAccountId() {
    return this.activeAccountId;
  }

  async isSignedIn() {
    return !!this.activeAccountId;
  }

  async signIn() {
    // if (this.activeAccountId) return;

    const accountCreationData = JSON.parse(
      window.localStorage.getItem('mb-bos-ai:account-creation-data') || JSON.stringify({}),
    );

    try {
      if (!this.activeAccountId || !accountCreationData.devicePublicKey || !accountCreationData.isCreated) {
        const accountId = uuid() + '.' + process.env.NEXT_PUBLIC_RELAYER_ACCOUNT_ID_NEAR_TESTNET;

        const key = await createKey(accountId);

        window.localStorage.setItem(
          'mb-bos-ai:account-creation-data',
          JSON.stringify({
            ...accountCreationData,
            devicePublicKey: key.getPublicKey().toString(),
            accountId: accountId,
            isCreated: true,
          }),
        );

        await fetch(`/api/create-account/`, {
          method: 'POST',
          body: JSON.stringify({ publicKey: key.getPublicKey().toString(), accountId: accountId }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        await this.keyStore.setKey(this.networkId, accountId, key);

        const accountObj = new nearAPI.Account(this.near.connection, accountId);
        console.log(accountObj);

        this._setActiveAccountId(accountId);
        return [accountObj];
      } else {
        const keys = await getKeys(this.activeAccountId);

        let asdasd = null;

        keys.forEach((_key) => {
          if (_key.getPublicKey().toString() === key.getPublicKey().toString()) {
            asdasd = key;
          }
        });

        await this.keyStore.setKey(this.networkId, accountCreationData.accountId, asdasd);

        const accountObj = new nearAPI.Account(this.near.connection, accountCreationData.accountId);

        this._setActiveAccountId(accountCreationData.accountId);
        return [accountObj];
      }
    } catch (e) {
      console.log('>>>>>>>>>>>>>>>>>>>>>', 'signing in ERROR', e);
    }
  }

  async signOut() {
    if (this.activeAccountId === undefined || this.activeAccountId === null) {
      throw new Error('Wallet is already signed out');
    }

    this.activeAccountId = undefined;
    await this.keyStore.removeKey(this.networkId, this.activeAccountId);
    localStorage.removeItem(`mb-bos-ai:account-creation-data`);
    localStorage.removeItem('mb-bos-ai:activeAccountId');
  }

  assertValidSigner(signerId) {
    if (signerId && signerId !== this.activeAccountId) {
      throw new Error(`Cannot sign transactions for ${signerId} while signed in as ${this.activeAccountId}`);
    }
  }

  async signAndSendTransaction({ receiverId, actions, signerId }) {
    this.assertValidSigner(signerId);

    const account = (await this.getAccounts())[0];

    const signedDelegate = await account.signedDelegate({
      actions: actions.map((action) => createAction(action)),
      blockHeightTtl: 60,
      receiverId,
    });

    await fetch(this.relayerUrl, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(Array.from(encodeSignedDelegate(signedDelegate))),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  }

  async signAndSendTransactions({ transactions }) {
    for (let { signerId } of transactions) {
      this.assertValidSigner(signerId);
    }

    for (let { receiverId, signerId, actions } of transactions) {
      await this.signAndSendTransaction({ receiverId, signerId, actions });
    }
  }

  showModal = () => {
    // unused
  };

  async verifyOwner() {
    throw Error('MbBosAi:verifyOwner is unsupported!');
  }

  async getAvailableBalance() {
    return new BN(0);
  }

  async getAccounts() {
    if (this.activeAccountId !== undefined && this.activeAccountId !== null) {
      const accountObj = new nearAPI.Account(this.near.connection, this.activeAccountId);
      return [accountObj];
    }

    return [];
  }

  async switchAccount(id) {
    this._setActiveAccountId(id);
  }

  _setActiveAccountId(accountId) {
    this.activeAccountId = accountId;
    window.localStorage.setItem('mb-bos-ai:activeAccountId', accountId);
  }
}
