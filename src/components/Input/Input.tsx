import { getTypeParameterOwner } from "typescript";
import { Button } from "../Button";

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
      <input {...props} />
  );
};
