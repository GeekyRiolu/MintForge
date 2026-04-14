import { Doppler, getEnv } from 'utils/env';

import { captureException, flush } from '@sentry/nextjs';
import { NextPageContext } from 'next';
import NextErrorComponent, { ErrorProps as NextErrorProps } from 'next/error';
import { ReactElement } from 'react';

type ErrorPageProps = {
  err: Error;
  statusCode: number;
  hasGetInitialPropsRun: boolean;
  children?: ReactElement;
}

type ErrorProps = {
  hasGetInitialPropsRun: boolean;
} & NextErrorProps;

function ErrorPage({ statusCode, hasGetInitialPropsRun, err }: ErrorPageProps) {
  if (!hasGetInitialPropsRun && err && getEnv(Doppler.NEXT_PUBLIC_ENV) !== 'DEBUG') {
    captureException(err);
  }
  return <NextErrorComponent statusCode={statusCode} />;
}

ErrorPage.getInitialProps = async ({ res, err, asPath }: NextPageContext) => {
  const errorInitialProps = (await NextErrorComponent.getInitialProps({
    res,
    err,
  } as NextPageContext)) as ErrorProps;

  errorInitialProps.hasGetInitialPropsRun = true;

  if (res?.statusCode === 404) {
    return errorInitialProps;
  }
  
  if (err && getEnv(Doppler.NEXT_PUBLIC_ENV) !== 'DEBUG') {
    captureException(err);
    await flush(2000);
    return errorInitialProps;
  }

  captureException(new Error(`_error.tsx getInitialProps missing data at path: ${asPath}`));
  await flush(2000);

  return errorInitialProps;
};

export default ErrorPage;
