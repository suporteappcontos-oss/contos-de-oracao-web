'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, ImageIcon } from 'lucide-react';

export default function UploadFundoClient() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize((file.size / 1024 / 1024).toFixed(2));
    setPreviewUrl(URL.createObjectURL(file));
    setStatus('idle');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setStatus('error');
      setMessage('Selecione uma imagem primeiro.');
      return;
    }

    setStatus('uploading');
    setMessage('Enviando imagem para o servidor...');

    try {
      const formData = new FormData();
      formData.append('backgroundImage', file);

      const res = await fetch('/api/admin/upload-fundo', {
        method: 'POST',
        body: formData,
        // Sem Content-Type header — o browser define automaticamente com boundary correto
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro desconhecido no servidor.');
      }

      setStatus('success');
      setMessage('Fundo sincronizado com sucesso! O novo fundo já está ativo no site e no app. ✓');

      // Limpar seleção após sucesso
      if (inputRef.current) inputRef.current.value = '';

    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Falha ao enviar. Tente novamente.');
    }
  };

  const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
      {/* Área de seleção de arquivo */}
      <div>
        <label className={labelCls}>Upload do Plano de Fundo (Bíblia, Textura, etc) *</label>

        {/* Preview da imagem selecionada */}
        {previewUrl && (
          <div className="mb-4 relative rounded-xl overflow-hidden border border-white/10 aspect-video max-h-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview do fundo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
              <div>
                <p className="text-white text-xs font-bold truncate">{fileName}</p>
                <p className="text-white/50 text-[0.65rem]">{fileSize} MB</p>
              </div>
            </div>
          </div>
        )}

        {/* Input de arquivo estilizado */}
        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-white/10 hover:border-[#D4AF37]/40 rounded-xl cursor-pointer bg-[#0f171e] hover:bg-[#D4AF37]/5 transition-all group">
          <div className="flex flex-col items-center gap-2 text-white/30 group-hover:text-white/60 transition-colors">
            <ImageIcon size={24} />
            <span className="text-xs font-medium">
              {fileName ? fileName : 'Clique para selecionar uma imagem'}
            </span>
            <span className="text-[0.65rem] text-white/20">JPG, PNG, WEBP — sem limite de tamanho</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            required
          />
        </label>

        <p className="text-white/40 text-xs mt-3">
          Esta imagem será sincronizada automaticamente como{' '}
          <b>fundo de todas as telas</b> — site e app Android.
        </p>
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
