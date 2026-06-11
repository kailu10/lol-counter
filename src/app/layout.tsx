import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LoL カウンターピック',
  description: 'League of Legends チャンピオンごとのカウンターピックを確認できるツール（エメラルド以下対応）',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
