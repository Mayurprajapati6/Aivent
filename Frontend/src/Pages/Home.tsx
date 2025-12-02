import Header from "./Header";

const Home: React.FC = () => {
  return (
    <div className="relative min-h-screen text-white">
        <Header />
        {/* Dark premium gradient */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#0a0a0f] via-[#0e0e1a] to-[#08080c]" />

        {/* Neo-Glow Blurred Blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {/* Pink glow top-left */}
            <div className="absolute -top-20 -left-10 w-[500px] h-[500px] bg-pink-500/25 rounded-full blur-[150px] animate-pulse" />

            {/* Violet glow center-right */}
            <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[170px] animate-pulse delay-300" />

            {/* Blue glow bottom-left */}
            <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-blue-500/20 rounded-full blur-[180px] animate-pulse delay-700" />
        </div>

        {/* Optional subtle AI grid pattern */}
        <div className="absolute inset-0 -z-10 opacity-[0.04] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:40px_40px]" />

        {/* Optional glow ring behind hero image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[700px] h-[700px] rounded-full bg-gradient-to-r from-pink-500/10 to-violet-600/10 blur-[140px]" />

        {/* page content */}
        <div className="relative z-10 min-h-[70vh]">
            {/* ...your content... */}
        </div>
        <footer className="border-t border-gray-800/50 py-8 px-6 max-w-7xl mx-auto">
            <div className="text-sm texy-gray-400">Made with ❤️ By Aivent</div>
        </footer>
    </div>

    


  );
}


export default Home;
