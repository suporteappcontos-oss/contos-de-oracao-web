'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Props = {
  name: string
  placeholder: string
  label: string
}

export default function PasswordField({ name, placeholder, label }: Props) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <label style={{
        display: 'block', color: 'rgba(255,255,255,0.5)',
        fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px',
        fontFamily: 'Outfit, sans-serif'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          name={name}
          required
          minLength={6}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '14px 48px 14px 14px', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none',
            fontFamily: 'Outfit, sans-serif', transition: 'border 0.2s'
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.35)', padding: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D4AF37' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' }}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  )
}
