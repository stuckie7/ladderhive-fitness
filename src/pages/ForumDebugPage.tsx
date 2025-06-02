import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const ForumDebugPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...');

  useEffect(() => {
    checkConnection();
    fetchCategories();
  }, []);

  const checkConnection = async () => {
    try {
      // Use the shared Supabase client
      setConnectionStatus('Testing connection to Supabase...');
      const { data, error } = await supabase.from('forum_categories').select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      setConnectionStatus(`✅ Connected to Supabase! Found ${data?.[0]?.count || 0} categories`);
    } catch (err) {
      console.error('Connection error:', err);
      setConnectionStatus(`❌ Connection failed: ${err.message}`);
      setError(`Failed to connect to database: ${err.message}`);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(`Failed to load categories: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createGeneralCategory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if category already exists
      const { data: existing } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('slug', 'general-discussion')
        .single();
      
      if (existing) {
        setError('General Discussion category already exists');
        return;
      }
      
      const { data, error } = await supabase
        .from('forum_categories')
        .insert([
          { 
            name: 'General Discussion', 
            slug: 'general-discussion', 
            description: 'General discussions about fitness and training',
            sort_order: 1,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      setError(null);
    } catch (err) {
      console.error('Error creating category:', err);
      setError(`Failed to create category: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Forum Database Debug</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <div className="font-mono text-sm">{connectionStatus}</div>
      </div>
      
      <div className="mb-6">
        <button
          onClick={createGeneralCategory}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create General Discussion Category'}
        </button>
        
        <button
          onClick={fetchCategories}
          disabled={isLoading}
          className="ml-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Refresh Categories
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                    {category.slug === 'general-discussion' && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded">{category.slug}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{category.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ForumDebugPage;
