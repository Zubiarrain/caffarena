
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const NavBar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
              <Image 
              src="/logo.png" 
              alt="Caffarena Pizza Logo" 
              className="h-12 w-14" 
              width={80}
              height={80}
              />
            <h1 className="text-2xl font-bold">Caffarena Pizza</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/menu" className="hover:text-yellow-500 transition-colors">Menú</Link>
            <Link href="#about" className="hover:text-yellow-500 transition-colors">Nosotros</Link>
            <Link href="#contact" className="hover:text-yellow-500 transition-colors">Contacto</Link>
          </nav>
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <ChevronDown className={`transform transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {isMenuOpen && (
          <motion.nav 
            className="md:hidden bg-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Link href="/menu" className="block px-4 py-2 hover:bg-gray-100">Menú</Link>
            <Link href="#about" className="block px-4 py-2 hover:bg-gray-100">Nosotros</Link>
            <Link href="#contact" className="block px-4 py-2 hover:bg-gray-100">Contacto</Link>
          </motion.nav>
        )}
      </header>
    )
}