import { useAuth } from '../context/AuthContext';

export function useApi() {
  const { token, user } = useAuth();

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(user?.role ? { 'X-User-Role': user.role } : {}),
        ...(options.headers || {}),
      },
    });
  };

  return { authFetch };
}
