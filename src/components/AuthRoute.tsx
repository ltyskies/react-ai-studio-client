import { getToken } from '../utils/token'
import { Navigate } from 'react-router'

export function AuthRoute ({ children }: { children: React.ReactNode }) {
  const token = getToken()
  if (token) {
    return <>{children}</>
  } else {
    return <Navigate to={'/login'} replace />
  }
}