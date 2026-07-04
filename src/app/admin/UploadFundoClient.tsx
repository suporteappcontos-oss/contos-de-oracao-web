'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, ImageIcon } from 'lucide-react';

export default function UploadFundoClient() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  // Desktop
  const [previewDesk, setPreviewDesk] = useState<string | null>(null);
  const [fileNameDesk, setFileNameDesk] = useState<string | null>(null);
  const inputDeskRef = useRef<HTMLInputElement>(null);

  // Mobile
  const [previewMob, setPreviewMob] = useState<string | null>(null);
  const [fileNameMob, setFileNameMob] = useState<string | null>(null);
  const inputMobRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isMobile) {
        setFileNameMob(file.name);
        setPreviewMob(reader.result as string);
      } else {
        setFileNameDesk(file.name);
        setPreviewDesk(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    setStatus('idle');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileDesk = inputDeskRef.current?.files?.[0];
    const fileMob = inputMobRef.current?.files?.[0];

    if (!fileDesk || !fileMob) {
      setStatus('error');
      setMessage('Selecione AS DUAS imagens (Desktop e Mobile) primeiro.');
      return;
    }

    setStatus('uploading');
    setMessage('Enviando imagens para o servidor...');

    try {
      const formData = new FormData();
      formData.append('backgroundDesktop', fileDesk);
      formData.append('backgroundMobile', fileMob);

      const res = await fetch('/api/admin/upload-fundo', {
        method: 'POST',
        body: formData,
        // Sem Content-Type header — o browser define automaticamente com boundary correto
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.details ? `${data.error}: ${data.details}` : data.error || 'Erro desconhecido no servidor.');
      }

      setStatus('success');
      setMessage('Fundos sincronizados com sucesso! Já estão ativos.');

      if (inputDeskRef.current) inputDeskRef.current.value = '';
      if (inputMobRef.current) inputMobRef.current.value = '';

    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Falha ao enviar. Tente novamente.');
    }
  };

  const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DESKTOP */}
        <div>
          <label className={labelCls}>Fundo Desktop (16:9)</label>
          {previewDesk && (
            <div className="mb-4 relative rounded-xl overflow-hidden border border-white/10 aspect-video max-h-40">
              <img src={previewDesk || ''} alt="Preview Desktop" className="w-full h-full object-cover" />
            </div>
          )}
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/10 hover:border-[#D4AF37]/40 rounded-xl cursor-pointer bg-[#0f171e] hover:bg-[#D4AF37]/5 transition-all group">
            <div className="flex flex-col items-center gap-2 text-white/30 group-hover:text-white/60 transition-colors">
              <ImageIcon size={24} />
              <span className="text-xs font-medium">{fileNameDesk || 'Selecionar imagem Desktop'}</span>
            </div>
            <input ref={inputDeskRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, false)} className="hidden" required />
          </label>
        </div>

        {/* MOBILE */}
        <div>
          <label className={labelCls}>Fundo Mobile/App (9:16)</label>
          {previewMob && (
            <div className="mb-4 relative rounded-xl overflow-hidden border border-white/10 aspect-[9/16] max-h-40 mx-auto w-fit">
              <img src={previewMob || ''} alt="Preview Mobile" className="w-full h-full object-cover" />
            </div>
          )}
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/10 hover:border-[#D4AF37]/40 rounded-xl cursor-pointer bg-[#0f171e] hover:bg-[#D4AF37]/5 transition-all group">
            <div className="flex flex-col items-center gap-2 text-white/30 group-hover:text-white/60 transition-colors">
              <ImageIcon size={24} />
              <span className="text-xs font-medium">{fileNameMob || 'Selecionar imagem Mobile'}</span>
            </div>
            <input ref={inputMobRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, true)} className="hidden" required />
          </label>
        </div>
      </div>

      {/* Feedback de status */}
      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-xl text-sm border ${
          status === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : status === 'error'
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]'
        }`}>
          {status === 'success' && <CheckCircle size={18} className="shrink-0 mt-0.5" />}
          {status === 'error' && <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          {status === 'uploading' && (
            <svg className="animate-spin shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={18} height={18}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <span>{message}</span>
        </div>
      )}

      {/* Botão de envio */}
      <div className="pt-4 border-t border-white/5">
        <button
          type="submit"
          disabled={status === 'uploading'}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-sm text-black transition-all hover:brightness-110 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' }}
        >
          {status === 'uploading' ? (
            <>
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width={18} height={18}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sincronizando Fundo...
            </>
          ) : (
            <>
              <Upload size={18} strokeWidth={3} />
              Salvar e Sincronizar Fundo
            </>
          )}
        </button>
      </div>
    </form>
  );
}
