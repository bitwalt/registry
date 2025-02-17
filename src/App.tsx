import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import logo from '/logo.svg'

type Network = 'signet' | 'regtest'

type ApiError = {
  message: string;
  code?: string;
  details?: string;
}

interface Asset {
  asset_id: string
  asset_iface: string
  ticker: string
  name: string
  precision: number
  issued_supply: number
  is_active: boolean
  balance: {
    settled: number
    future: number
    spendable: number
    offchain_outbound: number
    offchain_inbound: number
  }
}

interface Pair {
  id: string
  base_asset: string
  base_asset_id: string
  quote_asset: string
  quote_asset_id: string
  is_active: boolean
  min_order_size: number
  max_order_size: number
  price_precision: number
  quantity_precision: number
}

const API_ENDPOINTS = {
  signet: 'https://api.signet.kaleidoswap.com',
  regtest: 'https://api.regtest.kaleidoswap.com'
}

function App() {
  const [network, setNetwork] = useState<Network>('signet')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [pairFilter, setPairFilter] = useState('')
  const [sortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(text)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const { data: assetsData, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets', network],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS[network]}/api/v1/market/assets`)
        return response.data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw {
            message: 'Failed to fetch assets',
            code: error.code,
            details: error.response?.data?.message || error.message
          } as ApiError
        }
        throw new Error('An unexpected error occurred while fetching assets')
      }
    }
  })

  const { data: pairsData, isLoading: isLoadingPairs, error: pairsError } = useQuery({
    queryKey: ['pairs', network],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS[network]}/api/v1/market/pairs`)
        return response.data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw {
            message: 'Failed to fetch trading pairs',
            code: error.code,
            details: error.response?.data?.message || error.message
          } as ApiError
        }
        throw new Error('An unexpected error occurred while fetching trading pairs')
      }
    }
  })

  const sortData = <T extends Record<string, any>>(data: T[], key: string, direction: 'asc' | 'desc'): T[] => {
    return [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
      return 0
    })
  }

  const filteredPairs = pairsData?.pairs.filter((pair: Pair) =>
    `${pair.base_asset}/${pair.quote_asset}`.toLowerCase().includes(pairFilter.toLowerCase()) ||
    pair.base_asset_id.toLowerCase().includes(pairFilter.toLowerCase()) ||
    pair.quote_asset_id.toLowerCase().includes(pairFilter.toLowerCase())
  ) || []

  const sortedPairs = sortConfig && filteredPairs.length > 0
    ? sortData(filteredPairs, sortConfig.key, sortConfig.direction)
    : filteredPairs

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-200" data-theme={theme}>
      {/* Navbar */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50 transition-all duration-200">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><a href="#assets">Assets</a></li>
              <li><a href="#pairs">Trading Pairs</a></li>
            </ul>
          </div>
          <a className="btn btn-ghost normal-case text-xl gap-2">
            <img src={logo} alt="KaleidoSwap Logo" className="w-8 h-8" />
            <span className="font-bold text-ks-purple">KaleidoSwap</span>
          </a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a href="#assets" className="font-medium gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7a4 4 0 014-4h8a4 4 0 014 4v10a4 4 0 01-4 4H8a4 4 0 01-4-4V7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11h6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6" />
                </svg>
                Assets
              </a>
            </li>
            <li>
              <a href="#pairs" className="font-medium gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Trading Pairs
              </a>
            </li>
          </ul>
        </div>
        <div className="navbar-end gap-2">
          <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-primary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="capitalize">{network}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52">
              <li>
                <a 
                  onClick={() => setNetwork('signet')} 
                  className={`flex items-center gap-2 ${network === 'signet' ? 'active' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="font-medium">Signet</span>
                    <span className="text-xs opacity-70">Bitcoin Signet Network</span>
                  </div>
                </a>
              </li>
              <li>
                <a 
                  onClick={() => setNetwork('regtest')} 
                  className={`flex items-center gap-2 ${network === 'regtest' ? 'active' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="font-medium">Regtest</span>
                    <span className="text-xs opacity-70">Local Testing Network</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero bg-gradient-to-b from-base-100 to-base-200 py-16">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img src={logo} alt="KaleidoSwap Logo" className="w-32 h-32 animate-float" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-base-100/50 blur-xl -z-10"></div>
              </div>
            </div>
            <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-ks-purple via-ks-blue to-ks-purple bg-clip-text text-transparent animate-gradient">
              KaleidoSwap Registry
            </h1>
            <p className="py-6 text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Explore RGB assets and trading pairs available through the KaleidoSwap market maker on the{' '}
              <span className="font-semibold text-primary">{network}</span> network. 
              These assets can be traded over the Lightning Network using RGB channels.
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-8 mb-12">
              <a href="#assets" className="btn btn-primary btn-lg gap-3 min-w-[200px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7a4 4 0 014-4h8a4 4 0 014 4v10a4 4 0 01-4 4H8a4 4 0 01-4-4V7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11h6" />
                </svg>
                Browse Assets
              </a>
              <a href="#pairs" className="btn btn-secondary btn-lg gap-3 min-w-[200px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                View Pairs
              </a>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="card-body">
                  <h3 className="card-title text-xl mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How it works
                  </h3>
                  <ul className="steps steps-vertical">
                    <li className="step step-primary">Browse available RGB assets and trading pairs</li>
                    <li className="step step-primary">Request to open RGB-enabled Lightning channels</li>
                    <li className="step step-primary">Trade assets securely over the Lightning Network</li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="card-body">
                  <h3 className="card-title text-xl mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Market Stats
                  </h3>
                  <div className="stats stats-vertical shadow-lg bg-base-200">
                    <div className="stat">
                      <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7a4 4 0 014-4h8a4 4 0 014 4v10a4 4 0 01-4 4H8a4 4 0 01-4-4V7z" />
                        </svg>
                      </div>
                      <div className="stat-title">RGB Assets</div>
                      <div className="stat-value text-primary">{assetsData?.assets.length || 0}</div>
                      <div className="stat-desc">Available for trading</div>
                    </div>
                    <div className="stat">
                      <div className="stat-figure text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                      <div className="stat-title">Trading Pairs</div>
                      <div className="stat-value text-secondary">{pairsData?.pairs.length || 0}</div>
                      <div className="stat-desc">Active markets</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 space-y-8 mb-16">
        {/* Assets Section */}
        <div id="assets" className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-ks-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7a4 4 0 014-4h8a4 4 0 014 4v10a4 4 0 01-4 4H8a4 4 0 01-4-4V7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11h6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6" />
                </svg>
                <span className="text-ks-blue">Supported</span> Assets
              </h2>
              {isLoadingAssets && (
                <span className="loading loading-spinner loading-md text-ks-blue"></span>
              )}
            </div>
            <div className="divider"></div>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead className="bg-base-300 text-base-content">
                  <tr>
                    <th>Ticker</th>
                    <th>Name</th>
                    <th className="min-w-[300px]">Asset ID</th>
                    <th>Precision</th>
                    <th>Supply</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assetsData?.assets.map((asset: Asset) => (
                    <tr key={asset.asset_id} className="hover transition-colors duration-200">
                      <td className="font-medium text-primary">{asset.ticker}</td>
                      <td>{asset.name}</td>
                      <td>
                        <button
                          onClick={() => copyToClipboard(asset.asset_id)}
                          className="group flex items-center gap-2 font-mono text-sm hover:bg-base-200 rounded-lg px-2 py-1 transition-colors duration-200"
                        >
                          <span className="opacity-80">{asset.asset_id}</span>
                          {copiedId === asset.asset_id ? (
                            <div className="flex items-center gap-1 text-success">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-xs">Copied!</span>
                            </div>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover:opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td>{asset.precision}</td>
                      <td className="font-mono">{new Intl.NumberFormat().format(asset.issued_supply)}</td>
                      <td>
                        <div className={`badge ${asset.is_active ? 'badge-success' : 'badge-error'} gap-2`}>
                          {asset.is_active ? 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path></svg>
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                          }
                          {asset.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Trading Pairs Section */}
        <div id="pairs" className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="card-title text-2xl font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-ks-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span className="text-ks-purple">Trading</span> Pairs
                </h2>
                {isLoadingPairs && (
                  <span className="loading loading-spinner loading-md text-ks-purple"></span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="form-control flex-1 max-w-xl">
                    <label htmlFor="pair-search" className="label">
                      <span className="label-text font-medium">Search Trading Pairs</span>
                      <span className="label-text-alt opacity-70">Search by pair symbol or asset ID</span>
                    </label>
                    <div className="join w-full">
                      <div className="join-item bg-base-200 px-4 flex items-center border border-base-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        id="pair-search"
                        type="text"
                        placeholder="Search by pair (e.g., BTC/USD) or asset ID..."
                        className="input input-bordered join-item w-full focus:outline-none focus:border-ks-purple"
                        value={pairFilter}
                        onChange={(e) => setPairFilter(e.target.value)}
                        aria-label="Search trading pairs by symbol or asset ID"
                      />
                      {pairFilter && (
                        <button 
                          className="btn join-item btn-ghost"
                          onClick={() => setPairFilter('')}
                          aria-label="Clear search"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="divider" role="separator"></div>
            {pairsError ? (
              <div className="alert alert-error shadow-lg" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-medium">{(pairsError as ApiError).message}</span>
                  {(pairsError as ApiError).details && (
                    <span className="text-sm opacity-80">{(pairsError as ApiError).details}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra" role="grid">
                  <thead className="bg-base-300 text-base-content">
                    <tr>
                      <th className="min-w-[200px]">Pair</th>
                      <th>Order Size</th>
                      <th>Precision</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingPairs ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="animate-pulse" role="row" aria-label="Loading pair data">
                          <td><div className="h-8 bg-base-300 rounded w-32"></div></td>
                          <td><div className="h-8 bg-base-300 rounded w-32"></div></td>
                          <td><div className="h-8 bg-base-300 rounded w-32"></div></td>
                          <td><div className="h-4 bg-base-300 rounded w-16"></div></td>
                        </tr>
                      ))
                    ) : sortedPairs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2 text-base-content/70">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01" />
                            </svg>
                            <p className="text-lg">No trading pairs found</p>
                            <p className="text-sm">Try adjusting your search or check back later</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedPairs.map((pair: Pair) => (
                        <tr key={pair.id} className="hover transition-colors duration-200" role="row">
                          <td className="font-medium relative group">
                            <div className="flex items-center gap-2">
                              <div className="badge badge-secondary badge-outline text-base p-3">
                                {`${pair.base_asset}/${pair.quote_asset}`}
                              </div>
                              <button
                                className="btn btn-ghost btn-xs tooltip tooltip-right"
                                data-tip="Show Asset IDs"
                                onClick={(e) => {
                                  const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (tooltip) {
                                    tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
                                  }
                                }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <div className="hidden absolute top-full left-0 mt-2 p-4 bg-base-200 rounded-box shadow-lg z-10 w-max">
                                <div className="flex flex-col gap-3">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-sm font-medium text-base-content/70">{pair.base_asset} ID:</span>
                                      <button
                                        onClick={() => copyToClipboard(pair.base_asset_id)}
                                        className="group/copy flex items-center gap-2 font-mono text-sm hover:bg-base-300 rounded-lg px-2 py-1 transition-colors duration-200"
                                        aria-label={`Copy ${pair.base_asset} asset ID`}
                                      >
                                        <span className="opacity-80">{pair.base_asset_id}</span>
                                        {copiedId === pair.base_asset_id ? (
                                          <div className="flex items-center gap-1 text-success" role="status">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-xs">Copied!</span>
                                          </div>
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover/copy:opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                          </svg>
                                        )}
                                      </button>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-sm font-medium text-base-content/70">{pair.quote_asset} ID:</span>
                                      <button
                                        onClick={() => copyToClipboard(pair.quote_asset_id)}
                                        className="group/copy flex items-center gap-2 font-mono text-sm hover:bg-base-300 rounded-lg px-2 py-1 transition-colors duration-200"
                                        aria-label={`Copy ${pair.quote_asset} asset ID`}
                                      >
                                        <span className="opacity-80">{pair.quote_asset_id}</span>
                                        {copiedId === pair.quote_asset_id ? (
                                          <div className="flex items-center gap-1 text-success" role="status">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-xs">Copied!</span>
                                          </div>
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-0 group-hover/copy:opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                          </svg>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm opacity-70">Min:</span>
                                <span className="font-mono">{new Intl.NumberFormat().format(pair.min_order_size)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm opacity-70">Max:</span>
                                <span className="font-mono">{new Intl.NumberFormat().format(pair.max_order_size)}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm opacity-70">Price:</span>
                                <span className="font-mono">{pair.price_precision}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm opacity-70">Quantity:</span>
                                <span className="font-mono">{pair.quantity_precision}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div 
                              className={`badge ${pair.is_active ? 'badge-success' : 'badge-error'} gap-2`}
                              role="status"
                              aria-label={`Pair status: ${pair.is_active ? 'Active' : 'Inactive'}`}
                            >
                              {pair.is_active ? 
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4"></path></svg>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              }
                              {pair.is_active ? 'Active' : 'Inactive'}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded">
        <div className="grid grid-flow-col gap-4">
          <a href="https://github.com/kaleidoswap" className="link link-hover flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-github" viewBox="0 0 16 16">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            GitHub
          </a>
          <a href="https://docs.kaleidoswap.com" className="link link-hover flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-book" viewBox="0 0 16 16">
              <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
            </svg>
            Documentation
          </a>
        </div>
        <div>
          <div className="grid grid-flow-col gap-4">
            <a href="https://twitter.com/kaleidoswap" className="btn btn-ghost btn-square">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
              </svg>
            </a>
            <a href="https://t.me/kaleidoswap" className="btn btn-ghost btn-square">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-telegram" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/>
              </svg>
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-success font-medium">Privacy First</span>
          </div>
          <div className="max-w-md text-center opacity-75">
            <p>This website respects your privacy. We don't use any cookies, trackers, or analytics tools. Your data stays with you.</p>
          </div>
          <div className="text-sm opacity-60">
            <p>© 2025 KaleidoSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
