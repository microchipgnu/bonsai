import { createKey } from '@near-js/biometric-ed25519';
import { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { uuid } from 'uuidv4';

const useCreateImplicitAccount = () => {
  const [accountDetails, setAccountDetails] = useState<any>();
  const [localstorgeAccountDetails, setLocalstorgeAccountDetails] = useLocalStorage<any>('accountDetails', undefined);
  const [loading, setLoading] = useState(false);

  const createAccount = async () => {
    setLoading(true);

    const accountId = `${uuid()}.${process.env.NEXT_PUBLIC_RELAYER_ACCOUNT_ID_NEAR_TESTNET}`;

    const key = await createKey(accountId);

    setAccountDetails({
      accountId: accountId,
      privateKey: key,
      publicKey: key.getPublicKey().toString(),
    });

    setLocalstorgeAccountDetails({
      accountId: accountId,
      privateKey: key,
      publicKey: key.getPublicKey().toString(),
    });

    setLoading(false);

    await fetch(`/api/internal/near/fund-account/${accountId}`, {
      method: 'POST',
      body: JSON.stringify({ publicKey: key.getPublicKey().toString() }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  return {
    accountDetails: localstorgeAccountDetails || accountDetails,
    createAccount,
    loading,
  };
};

export default useCreateImplicitAccount;
