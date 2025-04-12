"use client"

import { useState, useEffect } from "react"
import { Search, Wallet, FileCheck, Scale, ArrowRight, Star } from "lucide-react"
import { Input } from "./ui/input"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"

export function Hero() {
  const [searchQuery, setSearchQuery] = useState("")
  const [userRole, setUserRole] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      setUserRole(user.role || "")
    }
  }, [])

  const handleGetStarted = () => {
    if (userRole === "freelancer") {
      navigate("/client/find")
    } else {
      navigate("/freelancer/find")
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-white">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-green-300 blur-3xl" />
        <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-green-200 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-12 text-center lg:py-20">
          <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 mb-5">
            <Star className="mr-1 h-3.5 w-3.5" />
            <span>Trusted by freelancers </span>
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Secure Freelancing with{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Blockchain Protection
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Connect with talented freelancers in a trustless environment powered by smart contracts, wallet integration,
            and community-governed dispute resolution.
          </p>

          {userRole === "client" && (
            <>
              <div className="mt-8 flex w-full max-w-2xl items-center">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Try 'smart contract developer' or 'blockchain designer'"
                    className="w-full rounded-l-md border border-r-0 border-gray-300 py-6 pl-10 pr-3 focus-visible:ring-green-500"
                  />
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                <Link
                  to={`/freelancer/find${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}
                  className="inline-flex h-12 items-center justify-center rounded-r-md bg-gradient-to-r from-green-600 to-emerald-600 px-6 font-medium text-white transition-all hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Search
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="text-gray-500">Popular:</span>
                {["Smart Contract Development", "DeFi Experts", "NFT Design", "Web3 Integration"].map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(tag)}
                    className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </>
          )}

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group flex flex-col items-center p-8 bg-white rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg hover:border-green-100 hover:translate-y-[-4px]">
              <div className="p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                <Wallet className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">Wallet Integration</h3>
              <p className="mt-3 text-gray-600 text-center">
                Connect your crypto wallet for seamless, secure payments and identity verification.
              </p>
            </div>

            <div className="group flex flex-col items-center p-8 bg-white rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg hover:border-green-100 hover:translate-y-[-4px]">
              <div className="p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                <FileCheck className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">Smart Contract Escrow</h3>
              <p className="mt-3 text-gray-600 text-center">
                Funds are held securely in escrow and automatically released when project milestones are met.
              </p>
            </div>

            <div className="group flex flex-col items-center p-8 bg-white rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg hover:border-green-100 hover:translate-y-[-4px]">
              <div className="p-4 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                <Scale className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">Community Dispute Resolution</h3>
              <p className="mt-3 text-gray-600 text-center">
                Fair and transparent dispute handling through jury voting from our trusted community members.
              </p>
            </div>
          </div>

          <div className="mt-12 max-h-[20px] flex flex-col sm:flex-row gap-4">
            <Button 
              className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-6 h-auto text-lg font-semibold rounded-lg shadow-lg shadow-green-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 group"
              onClick={handleGetStarted}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-15 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700"></span>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 inline-block transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50 px-8 py-6 h-auto text-lg font-medium rounded-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}