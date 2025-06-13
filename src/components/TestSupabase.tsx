import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TestSupabase() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true)
        console.log('Testing Supabase connection...')
        
        // Test a simple query
        const { data: testData, error: testError } = await supabase
          .from('forum_categories')
          .select('*')
          .limit(1)

        if (testError) throw testError
        
        console.log('Connection successful!', testData)
        setData(testData)
      } catch (err) {
        console.error('Connection error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) return <div className="p-4">Testing Supabase connection...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
         Successfully connected to Supabase!
      </div>
      <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
        <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}
