import { Instagram, Mail, Twitter, Youtube } from "lucide-react"; 
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative mt-16 border-t border-gray-800/50 py-8 px-6 max-w-7xl mx-auto flex items-center justify-between gap-6 overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000 pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow delay-2000 pointer-events-none" />

      {/* Links on the left */}
      <motion.div
        className="flex gap-6 text-gray-400 text-sm font-light"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <Link to="/" className="hover:text-purple-400 transition-colors duration-300">
          Home
        </Link>
        <Link to="/explore" className="hover:text-purple-400 transition-colors duration-300">
          Explore
        </Link>
        <Link to="/about" className="hover:text-purple-400 transition-colors duration-300">
          About
        </Link>
      </motion.div>

      {/* Center: Made by Aivent */}
      <motion.span
        className="text-gray-400 text-sm font-light flex items-center gap-1"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        Made with <span className="text-red-500 animate-pulse">❤️</span> by Aivent
      </motion.span>

      {/* Social icons on the right */}
      <motion.div
        className="flex items-center gap-6"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.a
          href="https://www.youtube.com/roadsidecoder"
          target="_blank"
          className="text-gray-400 hover:text-red-500 transition-colors duration-300"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Youtube className="w-5 h-5" />
        </motion.a>

        <motion.a
          href="https://www.instagram.com/roadsidecoder"
          target="_blank"
          className="text-gray-400 hover:text-pink-500 transition-colors duration-300"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Instagram className="w-5 h-5" />
        </motion.a>

        <motion.a
          href="https://x.com/Piyush_eon"
          target="_blank"
          className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Twitter className="w-5 h-5" />
        </motion.a>

        <motion.a
          href="mailto:support@aivent.com"
          className="text-gray-400 hover:text-green-400 transition-colors duration-300"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Mail className="w-5 h-5" />
        </motion.a>
      </motion.div>

      {/* Footer bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-40 animate-gradient-xy pointer-events-none" />
    </footer>
  );
}
