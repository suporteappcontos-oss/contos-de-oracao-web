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
        fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px',
        fontFamily: 'Outfit, sans-serif', fontWeight: 600
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
            width: '100%', padding: '14px 48px 14px 16px', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none',
            fontFamily: 'Outfit, sans-serif', transition: 'border 0.2s'
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#000000', padding: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D4AF37' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#000000' }}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show ? <EyeOff size={19} strokeWidth={2.5} /> : <Eye size={19} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  )
}

