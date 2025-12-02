import Aivent from '../assets/Aivent.png' // replace with transparent PNG or .svg
function Header (){
    return (
        <nav className="fixed top-0 left-0 right-0 bg-[#07070b]/90 backdrop-blur-xl z-20 border-b">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex-none">
                  <img src={Aivent} alt="Aivent logo" className="h-11 w-auto" />
                </div>
            </div>
        </nav>
    )
}
export default Header;