import { tw } from 'utils/tw';

import { Check } from 'react-feather';
import { useThemeColors } from 'styles/theme/useThemeColors';

export interface CheckBoxProps {
  checked: boolean;
  onToggle: (val: boolean) => void;
}

/**
 * Custom UI for a checkbox - parent is responsible for state management.
 */
export function CheckBox(props: CheckBoxProps) {
  const { primaryButtonBackground } = useThemeColors();
  return (
    <div
      className={tw(
        'flex items-center justify-center h-6 w-6 rounded-[8px]',
        'cursor-pointer',
        'shrink-0'
      )}
      style={{
        backgroundColor: props.checked ? primaryButtonBackground : '#F2F2F2',
      }}
      onClick={() => {
        props.onToggle(!props.checked);
      }}
    >
      {props.checked ? <Check color="black" className="h-4 w-4" /> : null}
    </div>
  );
}
