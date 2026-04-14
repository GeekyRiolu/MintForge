
import { useEffect, useState } from 'react';

export interface CountdownProps {
  eventTime: number;
}

function Countdown({ eventTime }: CountdownProps) {
  const countDownDate = new Date(eventTime*1000).getTime();
  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);
  
  return (
    <div>
      <p className='mb-1 text-[#B2B2B2]'>Ends in</p>
      <p className='font-noi-grotesk sm:text-xl text-2xl font-medium leading-6'>
        {days}<span className='text-[15px] text-[#6A6A6A] mr-[10px]'>d</span>
        {hours}<span className='text-[15px] text-[#6A6A6A] mr-[10px]'>h</span>
        {minutes}<span className='text-[15px] text-[#6A6A6A] mr-[10px]'>m</span>
        {seconds}<span className='text-[15px] text-[#6A6A6A]'>s</span>
      </p>
    </div>
  );
}
  
export default Countdown;