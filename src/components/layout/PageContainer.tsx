import type { PropsWithChildren } from 'react';

export function PageContainer({ children }: PropsWithChildren) {
  return (
    <main className="page-container" id="main-content">
      {children}
    </main>
  );
}