import './globals.css';
import Sidebar from '@/components/saiidbar/Sidebar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar />
        <main className="flex-1 p-6 bg-white">{children}</main>
      </body>
    </html>
  );
}
