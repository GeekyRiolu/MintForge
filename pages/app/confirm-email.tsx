import DefaultLayout from 'components/layouts/DefaultLayout';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty } from 'utils/format';

import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWRImmutable from 'swr/immutable';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const { email, token } = router.query;
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const { data } = useSWRImmutable(`${email}_${token}`, async () => {
    if (isNullOrEmpty(email) || isNullOrEmpty(token)) {
      return false;
    }

    try {
      const result = await fetch(`${getEnv(Doppler.NEXT_PUBLIC_GRAPHQL_URL).replace('/graphql', '')}/verify/${email}/${token}`);
      if (Number(result.status) == 200) {
        toast.success('Success! Your email is successfully verified!');

        setTimeout(function() {
          // 2 second delay
          router.push('/app/discover');
        }, 2000);
        return true;
      }

      setMessage((await result.json()).message);
      setLoading(false);
      return false;
    } catch (err) {
      setLoading(false);
      return false;
    }
  });

  const success = data;

  return <div className="flex flex-col h-full w-full items-center md:justify-start justify-center">
    {success ?
      <div>Success! Your email is successfully verified! Redirecting to NFT.com...</div> :
      loading ?
        <div>Loading...</div> :
        <div>Error: {message}</div>
    }
  </div>;
}

ConfirmEmailPage.getLayout = function getLayout(page) {
  return (
    <DefaultLayout>
      { page }
    </DefaultLayout>
  );
};
