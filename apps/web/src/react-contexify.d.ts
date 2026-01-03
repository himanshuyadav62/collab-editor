declare module 'react-contexify' {
  import { ReactNode, MouseEvent } from 'react';

  export interface MenuProps {
    id: string;
    className?: string;
    children?: ReactNode;
  }

  export interface ItemProps<T = any> {
    onClick?: (params: ItemParams<T>) => void;
    children?: ReactNode;
    disabled?: boolean;
  }

  export interface ItemParams<T = any> {
    event: MouseEvent;
    props?: T;
    triggerEvent: MouseEvent;
  }

  export interface UseContextMenuParams<T = any> {
    id: string;
  }

  export interface ShowContextMenuParams<T = any> {
    event: MouseEvent;
    props?: T;
  }

  export function Menu(props: MenuProps): JSX.Element;
  export function Item<T = any>(props: ItemProps<T>): JSX.Element;
  export function useContextMenu<T = any>(params: UseContextMenuParams<T>): {
    show: (params: ShowContextMenuParams<T>) => void;
  };
}
