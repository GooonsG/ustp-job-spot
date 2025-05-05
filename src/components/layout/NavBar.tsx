import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import traillogo from '../../image/traillogo.png';
import { useAuth } from '@/context/AuthProvider';
import { useUserRole } from '@/hooks/useUserRole';
import logo from '../../image/iconavatar.jpg';
const NavBar = () => {
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const {
    isEmployer
  } = useUserRole();
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again."
      });
    }
  };
  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : 'US';
  return <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src={traillogo} alt="USTP Logo" className="h-20 w-20 object-contain" />
              <h1 className="text-ustp-darkblue text-xl font-extrabold tracking-wide"> TRAIL</h1>
              <span className="text-l font-semi bold text-ustp-yellow tracking-wide">SYSTEM</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {!isEmployer && <NavLink to="/marketplace" className={({
            isActive
          }) => `flex items-center transition-colors ${isActive ? 'text-ustp-magenta font-bold' : 'text-gray-700 hover:text-ustp-magenta'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Marketplace
              </NavLink>}
            <NavLink to="/jobs" className={({
            isActive
          }) => `flex items-center transition-colors ${isActive ? 'text-ustp-cyan font-bold' : 'text-gray-700 hover:text-ustp-cyan'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Jobs
            </NavLink>
            {user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={logo} alt={user.email || ""} />
                      <AvatarFallback className="bg-ustp-blue text-white">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" forceMount className="w-56 bg-[#e3e3e3]/90 mx-[22px] my-0 py-[7px]">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      {isEmployer ? <p className="text-xs text-red-900 font-semibold">
                          Employer Account
                        </p>: <p className="text-xs text-ustp-blue font-semibold">
                          Student Account
                          </p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to="/dashboard" className="w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/profile" className="w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                    <button className="flex items-center w-full text-left">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Log out</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <div className="flex items-center space-x-2">
                <Link to="/auth">
                  <Button className="bg-ustp-blue text-white hover:bg-ustp-darkblue">Login</Button>
                </Link>
              </div>}
          </div>
        </div>
      </div>
    </nav>;
};
export default NavBar;