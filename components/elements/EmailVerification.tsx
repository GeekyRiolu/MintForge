import EmailStatusIcon from 'components/elements/EmailStatusIcon';
import Loader from 'components/elements/Loader/Loader';
import { ModalButton } from 'components/elements/ModalButton';
import { useConfirmEmailMutation } from 'graphql/hooks/useConfirmEmailMutation';
import { useCreateUserMutation } from 'graphql/hooks/useCreateUserMutation';
import { useMeQuery } from 'graphql/hooks/useMeQuery';
import { useResendEmailMutation } from 'graphql/hooks/useResendEmailMutation';
import { useUpdateEmailMutation } from 'graphql/hooks/useUpdateEmailMutation';
import { useUpdateMeMutation } from 'graphql/hooks/useUpdateMeMutation';
import { useBidModal } from 'hooks/state/useBidModal';
import { Doppler, getEnv } from 'utils/env';
import { isNullOrEmpty, joinClasses } from 'utils/format';

import ClientOnly from './ClientOnly';

import validator from 'email-validator';
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import qs from 'qs';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { useThemeColors } from 'styles/theme/useThemeColors';
import { useAccount, useNetwork } from 'wagmi';

export function EmailVerification(props) {
  const router = useRouter();
  const location = router.pathname;
  const parsedSearch = qs.parse(location?.search?.toString().replace('?', ''));
  const referral: string = (parsedSearch?.ref ?? '') as string;

  const { email, hideOptional } = props;
  const { address: currentAddress } = useAccount();
  const { chain } = useNetwork();
  const { primaryTextClass, primaryText, inputBackground, inputBorder } = useThemeColors();

  const [codeSent, setCodeSent] = useState(false);
  const [changeEmail, setChangeEmail] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [successVerify, setSuccessVerify] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { userEmailFound, userEmailVerified, mutate: mutateMeInfo } = useMeQuery();

  useEffect(() => {
    setCurrentEmail(email);
  }, [email]);

  /**
   * If we sent a code for this email in a previous session and are still waiting for
   * verification, show the verification step to start.
   */
  useEffect(() => {
    if (!userEmailVerified && !isNullOrEmpty(userEmailFound)) {
      setCodeSent(true);
    }
  }, [userEmailFound, userEmailVerified]);

  const { setBidModalOpen } = useBidModal();

  const {
    creating,
    createUser,
    error: signUpError,
  } = useCreateUserMutation({
    onCreateSuccess: () => {
      mutateMeInfo();
      setCodeSent(true);
    },
    onCreateFailure: () => {
      setCodeSent(false);
    },
  });

  const { confirmEmail, error: verifyError } = useConfirmEmailMutation();
  const { resendEmail, loading: loadingResend } = useResendEmailMutation();
  const { updateMe, loading: loadingUpdate } = useUpdateMeMutation();
  const { updateEmail } = useUpdateEmailMutation();

  // submits code on behalf of user
  const tryCodeVerification = async (code: any) => {
    setLoadingEmail(true);

    const verifyResult = await confirmEmail(code);

    if (verifyResult) {
      setLoadingEmail(false);
      setSuccessVerify(true);
      mutateMeInfo();
      setBidModalOpen(false);
      alert('Successfully verified!');
    } else {
      setLoadingEmail(false);
      setErrorMessage(verifyError);
    }
  };

  const optionalSkip = () => {
    return !hideOptional && !codeSent && <div className="mt-11 mb-5">
      <ClientOnly>
        <ModalButton
          text="Skip for now"
          onClick={() => {
            createUser({
              avatarURL: null,
              referredBy: referral,
              email: currentEmail !== '' ? currentEmail : null,
              username: `ethereum-${ethers.utils.getAddress(currentAddress)}`,
              wallet: {
                address: currentAddress,
                chainId: String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)),
                network: 'ethereum',
              },
            });
          }}
          loading={false}
        />
      </ClientOnly>
    </div>;
  };

  const getFooter = () => {
    if (codeSent) {
      return (
        <div className={joinClasses('flex flex-col mt-4 mb-5', primaryTextClass)}>
          {'Using Address: ' + (userEmailFound ?? currentEmail)}
          <div className="flex flex-row mt-2 justify-between w-full">
            <ModalButton
              text="Change Email"
              onClick={() => {
                setCodeSent(false);
                setChangeEmail(true);
              }}
              loading={false}
            />
            <ModalButton
              text="Resend Code"
              onClick={() => {
                resendEmail();
              }}
              loading={loadingResend}
            />
          </div>
        </div>
      );
    } else if (validator?.validate(currentEmail)) {
      return (
        <div className="flex flex-col">
          <div className="p-3 text-red-600 h-11">
            {signUpError}
          </div>
          <ClientOnly>
            <ModalButton
              text="Login"
              onClick={async () => {
                if (changeEmail || (!isNullOrEmpty(userEmailFound) && userEmailVerified)) {
                  const result = await updateMe({ email: currentEmail });
                  if (result) {
                    mutateMeInfo();
                    setCodeSent(true);
                    setChangeEmail(false);
                  }
                } else {
                  if (hideOptional && email) {
                    updateEmail({ email: currentEmail });
                    setChangeEmail(false);
                  } else {
                    createUser({
                      avatarURL: null,
                      referredBy: referral,
                      email: currentEmail !== '' ? currentEmail : null,
                      username: null, // null to force user to authenticate code, instead of allowing skip
                      wallet: {
                        address: currentAddress,
                        chainId: String(chain?.id || getEnv(Doppler.NEXT_PUBLIC_CHAIN_ID)),
                        network: 'ethereum',
                      },
                    });
                  }
                }
              }}
              loading={creating || loadingUpdate}
            />
          </ClientOnly>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div>
      <div
        className={['flex flex-col items-center justify-center mb-4', primaryTextClass].join(' ')}
        style={{ height: isMobile ? '100%' : '100%' }}
      >
        <div>
          {codeSent
            ? 'Please enter the 6 digit code from your email. It expires after 24 hours'
            : 'Please enter your email'}
        </div>
        <div>{codeSent ? '(Step 2 / 2)' : '(Step 1 / 2)'}</div>
      </div>
      <div className="w-full">
        <div className="flex justify-between items-center w-full">
          <div className="w-full relative">
            <input
              placeholder={codeSent ? 'enter 6 digit code' : 'enter email...'}
              autoFocus={true}
              value={codeSent ? currentCode : currentEmail ?? ''}
              spellCheck={false}
              onChange={async e => {
                setErrorMessage('');

                if (!codeSent) {
                  setLoadingEmail(true);
                  setCurrentEmail(e.target.value);
                  setLoadingEmail(false);
                } else {
                  setCurrentCode(e.target.value);

                  if (e.target.value.length >= 6) {
                    await tryCodeVerification(e.target.value);
                  }
                }
              }}
              className={joinClasses(
                'py-3.5 h-15 w-full font-medium text-lg flex-1 min-w-0 block',
                'text-left w-full px-3 py-2 rounded-md focus:ring-indigo-500',
                'focus:border-indigo-500 deprecated_sm:text-sm border-gray-300'
              )}
              style={{
                color: primaryText,
                backgroundColor: inputBackground,
                borderColor: inputBorder,
                borderWidth: '1px',
              }}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {loadingEmail
                ? (
                  <Loader />
                )
                : (
                  <EmailStatusIcon
                    email={currentEmail}
                    codeSent={codeSent}
                    verified={successVerify}
                    errorMessage={errorMessage}
                  />
                )}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-flow-col auto-cols-2 gap-12">
        {optionalSkip()}
        {getFooter()}
      </div>
    </div>
  );
}

EmailVerification.propTypes = {
  email: PropTypes.string,
  hideOptional: PropTypes.bool,
};
