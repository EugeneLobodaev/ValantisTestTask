
export const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button {...props}>
      {props.name}
    </button>
  );
};
