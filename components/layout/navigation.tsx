import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {  Menu,  Home,  TrendingUp,  Wallet,  BarChart3,  Settings,  User, Shield,  HelpCircle,  Mail,  FileText,  Newspaper,  PieChart,  Users,  Lock,  X,} from "lucide-react"
import { ThemeSwitcher } from "@/components/theme/theme-switcher"
import { useAuth } from "@/components/providers/auth-provider"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Trade", href: "/trade", icon: TrendingUp },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Markets", href: "/markets", icon: BarChart3 },
    { name: "Analytics", href: "/analytics", icon: PieChart },
    { name: "News", href: "/news", icon: Newspaper },
  ]

  const accountItems = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "KYC Verification", href: "/kyc", icon: Shield, badge: "Pending" },
    { name: "Referrals", href: "/referrals", icon: Users },
    { name: "Security", href: "/security", icon: Lock },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const supportItems = [
    { name: "Help Center", href: "/help", icon: HelpCircle },
    { name: "Contact", href: "/contact", icon: Mail },
    { name: "API Docs", href: "/api", icon: FileText },
  ]

  const isActive = (href: string) => pathname === href

  const handleNavigation = useCallback(
    (href: string) => {
      if (!isReady) return
      
      console.log('Navigating to:', href, 'Current:', pathname)
      setIsOpen(false)
      
      const navigate = () => {
        try {
          router.push(href)
        } catch (error) {
          console.error('Router push failed, using window.location:', error)
          window.location.href = href
        }
      }
      
      navigate()
    },
    [router, pathname, isReady],
  )

  const handleLogout = useCallback(async () => {
    setIsOpen(false)
    try {
      await logout()
      // Use window.location for logout to ensure clean navigation
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Logout failed:", error)
      // Fallback to router if logout fails
      router.push("/auth/login")
    }
  }, [logout, router])

  const NavLink = ({ item, mobile = false }: { item: any; mobile?: boolean }) => {
    const linkClasses = `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
      isActive(item.href)
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
    } ${!isReady ? "opacity-50 pointer-events-none" : ""}`

    if (mobile) {
      return (
        <button 
          onClick={() => handleNavigation(item.href)} 
          className={linkClasses}
          disabled={!isReady}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {item.badge}
            </Badge>
          )}
        </button>
      )
    }

    // For desktop, use both Link and onClick handler for maximum compatibility
    return (
      <div className={linkClasses}>
        <Link 
          href={item.href} 
          className="flex items-center space-x-3 w-full"
          onClick={(e) => {
            if (!isReady) {
              e.preventDefault()
              return
            }
            // Let the Link handle it, but also call our handler as backup
            handleNavigation(item.href)
          }}
          prefetch={true}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {item.badge}
            </Badge>
          )}
        </Link>
      </div>
    )
  }

  // Don't render navigation if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col z-40">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OC</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Exchange</span>
          </Link>
        </div>

        <div className="flex-1 px-4 space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Trading
            </h3>
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Account
            </h3>
            <div className="space-y-1">
              {accountItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Support
            </h3>
            <div className="space-y-1">
              {supportItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{user?.name?.charAt(0) || "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || "user@example.com"}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <ThemeSwitcher />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OC</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Exchange</span>
            </Link>

            <div className="flex items-center space-x-2">
              <ThemeSwitcher />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Navigation</h2>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{user?.name?.charAt(0) || "U"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{user?.name || "User"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    </div>

                    {/* Main Navigation */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Trading
                      </h3>
                      <div className="space-y-1">
                        {navigationItems.map((item) => (
                          <NavLink key={item.name} item={item} mobile />
                        ))}
                      </div>
                    </div>

                    {/* Account Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Account
                      </h3>
                      <div className="space-y-1">
                        {accountItems.map((item) => (
                          <NavLink key={item.name} item={item} mobile />
                        ))}
                      </div>
                    </div>

                    {/* Support Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Support
                      </h3>
                      <div className="space-y-1">
                        {supportItems.map((item) => (
                          <NavLink key={item.name} item={item} mobile />
                        ))}
                      </div>
                    </div>

                    {/* Logout */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <Button variant="outline" className="w-full bg-transparent" onClick={handleLogout}>
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-16" />
      </div>

      {/* Main content spacer for desktop */}
      <div className="hidden lg:block w-64" />
    </>
  )
}