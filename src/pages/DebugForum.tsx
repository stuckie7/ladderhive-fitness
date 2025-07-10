import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugForum() {
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const createCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .insert([
          { 
            name: 'General Discussion', 
            slug: 'general-discussion', 
            description: 'General discussions about fitness and training',
            sort_order: 1 
          }
        ])
        .select();

      if (error) throw error;
      
      if (data && data.length > 0) {
        setCategories(prev => [...prev, data[0]]);
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Forum Debug</h1>
      
      <div className="mb-6">
        <button 
          onClick={createCategory}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create General Discussion Category
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{category.description || '-'}</td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Troubleshooting</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
          <li>Make sure you're connected to the internet</li>
          <li>Check if Supabase is up at <a href="https://status.supabase.com/" target="_blank" rel="noopener noreferrer" className="underline">status.supabase.com</a></li>
          <li>Verify your Supabase URL and anon key in <code className="bg-blue-100 px-1">src/lib/supabase.ts</code></li>
          <li>Ensure the <code className="bg-blue-100 px-1">forum_categories</code> table exists in your Supabase database</li>
          <li>Check the browser's developer console (F12) for any error messages</li>
        </ul>
      </div>
    </div>
  );
}
