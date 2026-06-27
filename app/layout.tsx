import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'iPlace Global — Post a Job',
  description: 'Post your job on iPlace Global',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
