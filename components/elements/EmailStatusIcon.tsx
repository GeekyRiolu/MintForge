import { CheckCircleIcon, ExclamationCircleIcon, MailOpenIcon } from '@heroicons/react/solid';
import validator from 'email-validator';
import React from 'react';

export interface EmailStatusIconProps {
  email: string;
  codeSent: boolean;
  errorMessage: string | null;
  verified: boolean;
}

const EmailStatusIcon: (props: EmailStatusIconProps) => React.ReactElement = (
  props: EmailStatusIconProps
) => {
  const getLabelAndIcon = (text: string, textProps: Array<string>, icon: React.ReactElement) => {
    return (
      <div className="flex item-center">
        <div
          className={['w-full', 'text-center', 'mr-1', ...textProps].join(' ')}
          style={{ fontSize: '14px' }}
        >
          {text}
        </div>
        {icon}
      </div>
    );
  };

  if (props.codeSent) {
    if (props.errorMessage?.length > 0) {
      return getLabelAndIcon(
        props.errorMessage,
        ['text-red-500'],
        <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
      );
    } else if (props.verified) {
      return getLabelAndIcon(
        'Verified!',
        ['text-green-500'],
        <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
      );
    } else {
      return getLabelAndIcon(
        'Code Sent!',
        ['text-yellow-500'],
        <MailOpenIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />
      );
    }
  } else {
    if (props.email?.length > 0) {
      switch (validator?.validate(props.email)) {
      case true:
        if (props.errorMessage?.length > 0) {
          return getLabelAndIcon(
            props.errorMessage,
            ['text-red-500'],
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
          );
        } else {
          return getLabelAndIcon(
            'Valid!',
            ['text-green-500'],
            <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
          );
        }
      case false:
        return getLabelAndIcon(
          'Invalid',
          ['text-red-500'],
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
        );

      default:
        return null;
      }
    } else {
      return null;
    }
  }
};
export default EmailStatusIcon;
