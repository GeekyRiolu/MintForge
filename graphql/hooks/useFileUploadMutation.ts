import { useGraphQLSDK } from 'graphql/client/useGraphQLSDK';
import { Maybe } from 'graphql/generated/types';
import { isNullOrEmpty } from 'utils/format';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { useCallback, useState } from 'react';

export type LocalImage = {
  preview: string;
  raw: File;
};

export interface FileUploadResult {
  error: string | null;
  fileUpload: (file: LocalImage, remoteKey: string) => Promise<Maybe<string>>;
}

/**
 * Hits our gQL endpoint for temporary S3 access to upload a file.
 */
export function useFileUploadMutation(): FileUploadResult {
  const sdk = useGraphQLSDK();

  const [error, setError] = useState<Maybe<string>>(null);

  const fileUpload = useCallback(
    async (file: LocalImage, remoteKey: string) => {
      if (file == null || file.raw == null || isNullOrEmpty(file.preview)) {
        return null;
      }
      try {
        const result = await sdk.FileUpload();

        if (!result) {
          throw Error('FileUpload mutation failed.');
        }

        const s3client = new S3Client({
          region: 'us-east-1',
          credentials: {
            accessKeyId: result.uploadFileSession.accessKey,
            sessionToken: result.uploadFileSession.sessionToken,
            secretAccessKey: result.uploadFileSession.secretKey,
          },
        });
        await s3client.send(
          new PutObjectCommand({
            Key: remoteKey,
            Bucket: result.uploadFileSession.bucket,
            Body: file.raw,
          })
        );

        return 'https://' + result.uploadFileSession.bucket + '.s3.amazonaws.com/' + remoteKey;
      } catch (err) {
        setError('File Upload mutation failed. Please try again.');
        return null;
      }
    },
    [sdk]
  );

  return {
    error: error,
    fileUpload: fileUpload,
  };
}
