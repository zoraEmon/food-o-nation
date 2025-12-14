export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-green-600 via-green-500 to-yellow-500 bg-clip-text text-transparent">
            Welcome to the NGO System
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 mb-2">Making a difference, one program at a time</p>
          <p className="text-lg text-gray-600">Please navigate to the Donor or Beneficiary Dashboard</p>
        </div>
        
        <div className="mt-12 space-y-4 sm:space-y-0 sm:space-x-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <a 
            href="/donordashboard" 
            className="group bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-2 inline-flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            <span>Go to Donor Dashboard</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a 
            href="/beneficiarydashboard" 
            className="group bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-10 py-5 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-2 inline-flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            <span>Go to Beneficiary Dashboard</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
