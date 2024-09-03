import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Minecraft Portfolio',
  description: 'A portfolio inspired by Minecraft',
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
      <html lang="en">
      <body>{children}</body>
      </html>
  );
};

export default RootLayout;