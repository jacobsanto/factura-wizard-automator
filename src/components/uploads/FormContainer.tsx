
import React, { FormEvent, ReactNode } from "react";

interface FormContainerProps {
  children: ReactNode;
  onSubmit: (e: FormEvent) => Promise<void> | void;
  className?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({ 
  children, 
  onSubmit, 
  className = "space-y-4" 
}) => {
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
};

export default FormContainer;
