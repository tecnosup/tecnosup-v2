import Navbar from '@/components/Navbar';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <Navbar /> {/* Ela fica aqui para aparecer em cima de tudo */}
        {children}
      </body>
    </html>
  );
}