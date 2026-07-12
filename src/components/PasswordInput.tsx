'use client';

import { useState, InputHTMLAttributes } from 'react';
import { EyeIcon, EyeOffIcon } from './icons';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  wrapperClassName?: string;
}

export function PasswordInput({ className, wrapperClassName, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${wrapperClassName ?? ''}`}>
      <input type={visible ? 'text' : 'password'} className={`${className ?? ''} pr-9`} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-muted-on-ink hover:text-[#E8ECF4]"
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}
