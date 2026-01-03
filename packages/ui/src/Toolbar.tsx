import React from 'react';
import { clsx } from 'clsx';

export interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        'flex items-center gap-1 p-2 border-b bg-background text-foreground border-border',
        className
      )}
      role="toolbar"
      aria-label="Editor toolbar"
    >
      {children}
    </div>
  );
};

export interface ToolbarGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ToolbarGroup: React.FC<ToolbarGroupProps> = ({ children, className }) => {
  return (
    <div
      className={clsx('flex items-center gap-1 px-1 border-r border-border last:border-r-0', className)}
      role="group"
    >
      {children}
    </div>
  );
};
