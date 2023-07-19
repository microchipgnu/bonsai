import { encodeSignedDelegate } from '@near-js/transactions';
import { useState } from 'react';

import useSignDelegate from './use-sign-delegate';

const useSubmitMetaTransaction = () => {
  const [loading, setLoading] = useState(false);
  const { delegated, getDelegated, loading: loadingDelegation } = useSignDelegate();

  const submitMetaTransaction = async (obj: {
    network: string;
    signer: string;
    privateKey: string;
    transaction: {
      methodName: string;
      args: any;
      gas: string;
      deposit: string;
    };
    contractAddress: string;
  }) => {
    setLoading(true);

    const delegated = await getDelegated(obj);

    if (!delegated) {
      setLoading(false);
      return;
    }

    await fetch('/api/internal/near/submit-meta-transaction', {
      body: JSON.stringify({
        delegated: Array.from(encodeSignedDelegate(delegated)),
        network: 'testnet',
      }),
      headers: {},
      method: 'POST',
    });

    setLoading(false);
  };

  return { submitMetaTransaction, loading };
};

export default useSubmitMetaTransaction;
