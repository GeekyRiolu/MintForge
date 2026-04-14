import { useSupportedNetwork } from 'hooks/useSupportedNetwork';
import { tw } from 'utils/tw';

import { isMobile } from 'react-device-detect';
import { useThemeColors } from 'styles/theme/useThemeColors';

export function NetworkErrorTile() {
  const { alwaysWhite } = useThemeColors();
  const { supportedNetworks } = useSupportedNetwork();
  return (
    <div
      className={tw(
        'rounded-xl p-5 flex flex-col items-center',
        'py-12 border border-red-1 bg-black drop-shadow-lg'
      )}
      style={{ width: isMobile ? '90%' : '40rem' }}
    >
      <div className="text-2xl mb-5" style={{ color: alwaysWhite }}>
        Unsupported Network
      </div>
      <div className='text-lg' style={{ color: alwaysWhite }}>
        Please switch your wallet to one of the following networks:{' '}
        {supportedNetworks.map((item) => item.split(':')[2]).join(', ')}
      </div>
    </div>
  );
}