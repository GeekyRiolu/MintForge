interface InfoCardProps {
  title: string;
  value: string;
  unit?: string
}

export const InfoCard = ({ title, value, unit }: InfoCardProps) => {
  return (
    <div className="bg-white dark:bg-primary-txt rounded-xl pl-5 pt-5 pb-5">
      <div className="text-base font-bold text-gray-500 tracking-normal">{title}</div>
      <div className="font-medium dark:text-white text-3xl mt-1">
        <b>{value} </b>
        <span className="text-lg font-normal">{unit}</span>
      </div>
    </div>
  );
};