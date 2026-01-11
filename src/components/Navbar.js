import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    // Tag semântica <header> para indicar o topo do site
    <header className="fixed top-0 w-full z-50 bg-[#000717]/80 backdrop-blur-md border-b border-white/10">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo - Usando o logo que você já tem */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo-semfundo.png" 
            alt="Technosup Logo" 
            width={180}    // Largura máxima que você quer que ela apareça (em pixels)
            height={60}    // Altura máxima proporcional
            priority       // Isso avisa ao Next.js que o logo é importante e deve carregar primeiro
            className="object-contain" 
        />
        </Link>

        {/* Menu de Navegação - Semântica de lista <ul> e <li> */}
        <ul className="hidden md:flex space-x-8 text-sm font-medium">
          <li>
            <Link href="#inicio" className="hover:text-blue-500 transition-colors">Início</Link>
          </li>
          <li>
            <Link href="#servicos" className="hover:text-blue-500 transition-colors">Serviços</Link>
          </li>
          <li>
            <Link href="#produtos" className="hover:text-blue-500 transition-colors">Produtos</Link>
          </li>
          <li>
            <Link href="#feedbacks" className="hover:text-blue-500 transition-colors">Feedbacks</Link>
          </li>
        </ul>

        {/* Botão de Destaque (CTA) */}
        <Link 
          href="https://wa.me/5512996065673" 
          target="_blank"
          className="text-white no-underline mt-12 bg-blue-500 hover:scale-105 transition-all duration-300 px-10 py-8 rounded-full font-bold text-xl shadow-[0_0_20px_rgba(14,179,255,0.4)]"
        >
          ORÇAMENTO GRÁTIS
        </Link>

      </nav>
    </header>
  );
}