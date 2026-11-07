import { useAuth } from '../context/AuthContext';

export function useApi() {
  const { token } = useAuth();

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  };

  return { authFetch };
}
