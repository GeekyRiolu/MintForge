interface OptionGridProps {
  children: JSX.Element | JSX.Element[] | string;
}

export const OptionGrid = ({ children }: OptionGridProps) => {
  return (
    <div
      className="grid gap-2.5 deprecated_md:grid-cols-1 deprecated_md:gap-2.5">
      {children}
    </div>
  );
};