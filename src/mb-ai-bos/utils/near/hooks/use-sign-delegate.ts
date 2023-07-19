import { useState } from 'react';

import { signDelegatedTransaction } from '../sign-delegated';

const useSignDelegate = () => {
  const [delegated, setDelegated] = useState<any>();
  const [loading, setLoading] = useState(false);

  const getDelegated = async ({
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
    setLoading(true);

    const delegated = await signDelegatedTransaction({
      network,
      signer,
      privateKey,
      transaction,
      contractAddress,
    });

    setDelegated(delegated);
    setLoading(false);

    return delegated;
  };

  return {
    delegated,
    getDelegated,
    loading,
  };
};

export default useSignDelegate;
