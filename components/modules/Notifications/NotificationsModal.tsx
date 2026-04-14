import { Button, ButtonSize, ButtonType } from 'components/elements/Button';
import { Modal } from 'components/elements/Modal';
import { NotificationContext } from 'components/modules/Notifications/NotificationContext';
import { Notifications } from 'components/modules/Notifications/Notifications';

import { X } from 'phosphor-react';
import { useContext } from 'react';

type NotificationsModalProps = {
  visible: boolean;
  setVisible: (input:boolean) => void;
};

export default function NotificationsModal({ visible, setVisible }: NotificationsModalProps) {
  const {
    count,
  } = useContext(NotificationContext);

  return (
    <Modal
      visible={visible}
      loading={false}
      title={''}
      onClose={() => {
        setVisible(false);
      }}
      bgColor='white'
      hideX
      fullModal
      pure
    >
      <div className='max-w-full minlg:max-w-[458px] h-screen minlg:h-max maxlg:h-max bg-white text-left px-4 rounded-none minlg:rounded-[10px] minlg:mt-24 minlg:m-auto max-h-screen overflow-auto'>
        <div className='py-5 font-noi-grotesk lg:max-w-md max-w-lg m-auto minlg:relative px-3'>
          <X onClick={() => setVisible(false)} className='absolute top-5 right-3 minlg:right-0 hover:cursor-pointer' size={32} color="black" weight="fill" />
          <Notifications setVisible={setVisible} />
          {/* only show when notifications exist for better UI */}
          {count ?
            <div className='mt-4'>
              <Button
                size={ButtonSize.LARGE}
                type={ButtonType.PRIMARY}
                stretch
                label='Close'
                onClick={() => setVisible(false)} />
            </div>
            :
            null
          }
        </div>
      </div>
    </Modal>
  );
}
    