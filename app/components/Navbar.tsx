import { Link } from "react-router"


const Navbar = () => {
  return (
    <nav className="navbar">Navbar
    
    <Link to="/">
    <p className="text-2xl font-bold text-gradient" >Resumind</p>
    </Link>
    <Link to="/upload" className="primary-button w-fit">
    Upload resume</Link>
    </nav>
  )
}

export default Navbar