import { isNullOrEmpty } from 'utils/format';
import { tw } from 'utils/tw';

import { useThemeColors } from 'styles/theme/useThemeColors';

export interface AddressInputProps {
  value: string;
  onChange: (val: string) => void;
  error: boolean;
}

export function AddressInput(props: AddressInputProps) {
  const { alwaysBlack } = useThemeColors();

  return (
    <div className="flex flex-row p-6 rounded-xl bg-white dark:bg-primary-txt">
      <div className='flex basis-3/5 grow'>
        <input
          type="text"
          className={tw(
            'text-lg min-w-0 border',
            'text-left px-3 py-3 rounded-xl font-medium',
            'w-full',
            props.error ? 'border-red-500 border-2' : ''
          )}
          placeholder="0x0000...1234"
          autoFocus={true}
          value={props.value ?? ''}
          onChange={e => {
            const validReg = /^[0-9a-zA-Z]*$/;
            if (isNullOrEmpty(e.target.value)) {
              props.onChange(null);
            } else if (
              validReg.test(e.target.value)
            ) {
              props.onChange(e.target.value);
            } else {
              e.preventDefault();
            }
          }}
          style={{
            color: alwaysBlack,
          }}
        />
      </div>
    </div>
  );
}
