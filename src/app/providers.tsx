import { StrictMode } from 'react';
import type { PropsWithChildren } from 'react';

export function AppProviders({ children }: PropsWithChildren) {
  return <StrictMode>{children}</StrictMode>;
}