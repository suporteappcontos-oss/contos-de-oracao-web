'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ background: '#0C121D', color: '#ff6b6b', padding: '2rem', minHeight: '100vh', fontFamily: 'monospace' }}>
      <h1>Erro Global no Servidor!</h1>
      <p><strong>Mensagem:</strong> {error.message || 'Erro Desconhecido'}</p>
      <p><strong>Digest:</strong> {error.digest || 'Nenhum'}</p>
      <pre style={{ background: 'rgba(255,0,0,0.1)', padding: '1rem', overflowX: 'auto', borderRadius: '8px' }}>
        {error.stack}
      </pre>
      <button 
        onClick={() => reset()}
        style={{ marginTop: '1rem', padding: '10px 20px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Tentar Novamente
      </button>
    </div>
  )
}
