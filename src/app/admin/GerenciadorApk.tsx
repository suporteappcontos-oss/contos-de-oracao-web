'use client'

import React, { useState, useTransition } from 'react'
import { Smartphone, Upload, ExternalLink, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { salvarVersaoApk } from './actions'

const BUNNY_BASE_URL = 'https://contos-apks.b-cdn.net'

// APKs disponíveis no CDN (conforme listado pelo usuário)
const APKS_DISPONIVEIS = [
  'contos-de-oracao-v1.0.25.apk',
  'contos-de-oracao-v1.0.23.apk',
  'contos-de-oracao-v1.0.22.apk',
  'contos-de-oracao-v1.0.20.apk',
  'contos-de-oracao-v1.0.18.apk',
  'contos-de-oracao-v1.0.17.apk',
  'contos-de-oracao-v1.0.16.apk',
]

export function GerenciadorApk({ versaoAtual }: { versaoAtual: any }) {
  const [isPending, startTransition] = useTransition()
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const [versao, setVersao] = useState(versaoAtual?.versao_atual || '1.0.25')
  const [apkSelecionado, setApkSelecionado] = useState(versaoAtual?.link_download || `${BUNNY_BASE_URL}/contos-de-oracao-v1.0.25.apk`)
  const [msgUpdate, setMsgUpdate] = useState(versaoAtual?.mensagem || '🙏 Nova versão disponível! Melhorias e correções para sua experiência.')
  const [obrigatorio, setObrigatorio] = useState(versaoAtual?.obrigatorio || false)

  const handleSalvar = () => {
    setMensagem('')
    setErro('')
    startTransition(async () => {
      const res = await salvarVersaoApk(versao, apkSelecionado, msgUpdate, obrigatorio)
      if (res.success) {
        setMensagem('✅ versao.json atualizado! O app vai detectar a nova versão automaticamente.')
      } else {
        setErro(`❌ Erro: ${res.error}`)
      }
    })
  }

  const versaoNoLink = apkSelecionado.match(/v(\d+\.\d+\.\d+)/)?.[1] || versao

  return (
    <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <Smartphone size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-black text-base">Publicar Nova Versão do App</h3>
          <p className="text-white/40 text-xs">Atualiza o versao.json para os usuários receberem a notificação de atualização</p>
        </div>
      </div>

      {/* Status atual */}
      {versaoAtual && (
        <div className="mb-5 p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-white/40 text-xs uppercase tracking-wider">Versão publicada atualmente</span>
            <div className="text-[#D4AF37] font-black text-lg mt-0.5">v{versaoAtual.versao_atual}</div>
          </div>
          <a
            href={versaoAtual.link_download}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
          >
            <ExternalLink size={12} />
            Ver APK atual
          </a>
        </div>
      )}

      <div className="space-y-4">
        {/* Seleção do APK */}
        <div>
          <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">APK no Bunny CDN</label>
          <select
            value={apkSelecionado}
            onChange={(e) => {
              const file = e.target.value
              setApkSelecionado(file)
              const v = file.match(/v(\d+\.\d+\.\d+)/)?.[1]
              if (v) setVersao(v)
            }}
            className="w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white focus:outline-none transition-all text-sm font-mono"
          >
            {APKS_DISPONIVEIS.map(apk => (
              <option key={apk} value={`${BUNNY_BASE_URL}/${apk}`}>
                {apk}
              </option>
            ))}
          </select>
          <p className="text-white/25 text-[10px] mt-1.5">Link gerado: <span className="text-white/40 font-mono">{apkSelecionado}</span></p>
        </div>

        {/* Versão */}
        <div>
          <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Número da Versão</label>
          <input
            value={versao}
            onChange={(e) => setVersao(e.target.value)}
            placeholder="ex: 1.0.25"
            className="w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all text-sm font-mono"
          />
        </div>

        {/* Mensagem */}
        <div>
          <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Mensagem para o Usuário</label>
          <textarea
            value={msgUpdate}
            onChange={(e) => setMsgUpdate(e.target.value)}
            rows={2}
            className="w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all text-sm resize-none"
          />
        </div>

        {/* Obrigatório */}
        <div
          onClick={() => setObrigatorio(!obrigatorio)}
          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${obrigatorio ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 bg-white/2'}`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className={obrigatorio ? 'text-red-400' : 'text-white/30'} />
            <div>
              <span className={`text-sm font-bold ${obrigatorio ? 'text-red-400' : 'text-white/60'}`}>Atualização Obrigatória</span>
              <p className="text-white/30 text-xs">Se ativo, o usuário não pode usar o app sem atualizar</p>
            </div>
          </div>
          <div className={`w-10 h-5 rounded-full flex items-center transition-all ${obrigatorio ? 'bg-red-500' : 'bg-white/10'}`}
            style={{ justifyContent: obrigatorio ? 'flex-end' : 'flex-start', padding: '2px' }}>
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </div>
        </div>
      </div>

      {/* Feedback */}
      {mensagem && (
        <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {mensagem}
        </div>
      )}
      {erro && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
          {erro}
        </div>
      )}

      <button
        onClick={handleSalvar}
        disabled={isPending}
        className="mt-5 w-full flex items-center justify-center gap-2 bg-[#10b981] hover:brightness-110 text-white px-6 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        {isPending ? 'Publicando...' : `Publicar v${versao} para os Usuários`}
      </button>
    </div>
  )
}
