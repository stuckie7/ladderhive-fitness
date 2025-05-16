
/**
 * Utility functions for fetching workout data from GitHub repositories
 */

/**
 * Fetches JSON data from a GitHub raw content URL
 * 
 * @param owner - The GitHub username or organization
 * @param repo - The repository name 
 * @param path - The file path within the repository
 * @param branch - The branch name (default: 'main')
 * @returns Promise with the parsed JSON data
 */
export const fetchGithubJsonData = async <T>(
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<T> => {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
    }
    
    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data from GitHub:', error);
    throw error;
  }
};

/**
 * Fetches CSV data from a GitHub raw content URL and converts it to an array of objects
 * 
 * @param owner - The GitHub username or organization
 * @param repo - The repository name
 * @param path - The file path within the repository
 * @param branch - The branch name (default: 'main')
 * @returns Promise with the parsed CSV data as an array of objects
 */
export const fetchGithubCsvData = async <T>(
  owner: string,
  repo: string,
  path: string, 
  branch: string = 'main'
): Promise<T[]> => {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text();
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(header => header.trim());
    
    const result = rows.slice(1).map(row => {
      if (!row.trim()) return null; // Skip empty rows
      
      const values = row.split(',').map(value => value.trim());
      const obj: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      
      return obj as unknown as T;
    }).filter(Boolean) as T[];
    
    return result;
  } catch (error) {
    console.error('Error fetching CSV data from GitHub:', error);
    throw error;
  }
};

/**
 * Fetches raw text data from a GitHub raw content URL
 * 
 * @param owner - The GitHub username or organization
 * @param repo - The repository name
 * @param path - The file path within the repository
 * @param branch - The branch name (default: 'main')
 * @returns Promise with the raw text data
 */
export const fetchGithubTextData = async (
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<string> => {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
    }
    
    return response.text();
  } catch (error) {
    console.error('Error fetching text data from GitHub:', error);
    throw error;
  }
};

// Add more specialized fetchers as needed
