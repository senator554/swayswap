import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';

import { FUEL_FAUCET_URL } from '~/config';
import { useWallet } from '~/context/AppContext';
import { sleep } from '~/lib/utils';

type UseFaucetOpts = {
  onSuccess?: () => void;
};

export function useFaucet(opts: UseFaucetOpts = {}) {
  const wallet = useWallet();
  const client = useQueryClient();

  const mutation = useMutation(
    async ({ captcha }: { captcha?: string | null } = {}) => {
      const response = await fetch(FUEL_FAUCET_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: wallet?.address,
          captcha: captcha || '',
        }),
      }).then((r) => r.json());

      if (response.status !== 'Success') {
        throw new Error(`Invalid faucet response: ${JSON.stringify(response)}`);
      }

      await sleep(1000);
    },
    {
      onSuccess: () => {
        // Navigate to assets page to show new cons
        // https://github.com/FuelLabs/swayswap-demo/issues/40
        toast.success('Faucet added successfully!');
        client.refetchQueries(['AssetsPage-balances']);
        opts.onSuccess?.();
      },
    }
  );

  function handleFaucet(captcha: string | null) {
    mutation.mutate({ captcha });
  }

  return {
    ...mutation,
    handleFaucet,
  };
}
