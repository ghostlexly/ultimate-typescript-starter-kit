const Title = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="max-w-3xl bg-gradient-to-b from-neutral-900 to-[rgba(41,41,41,0.7)] bg-clip-text font-aeonikPro text-4xl text-transparent lg:text-7xl lg:leading-tight">
      {children}
    </h1>
  );
};

export { Title };
