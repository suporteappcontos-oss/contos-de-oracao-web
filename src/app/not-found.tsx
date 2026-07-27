import Link from 'next/link'

export const metadata = {
  title: 'Página não encontrada — Contos de Oração Club',
  description: 'A página que você está procurando não existe ou foi removida.',
}

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#090B10' }}
    >
      {/* Ícone */}
      <div className="mb-8">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <span className="text-5xl">✝</span>
        </div>
        <h1
          className="text-8xl font-black mb-2"
          style={{ background: 'linear-gradient(135deg,#D4AF37,#FFD700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          404
        </h1>
        <h2 className="text-white text-2xl font-bold mb-3">
          Página não encontrada
        </h2>
        <p className="text-white/40 text-base max-w-sm mx-auto leading-relaxed">
          Talvez essa página tenha sido movida ou não exista mais.<br />
          Mas a jornada continua — volte ao início.
        </p>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#FFD700,#D4AF37)', color: '#090B10' }}
        >
          Voltar ao Início
        </Link>
        <Link
          href="/watch"
          className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:bg-white/10"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#FFF', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Ver Catálogo
        </Link>
      </div>

      {/* Versículo */}
      <p className="mt-12 text-white/20 text-xs italic max-w-xs">
        "Porque eu sei os planos que tenho para você, diz o Senhor."<br />
        — Jeremias 29:11
      </p>
    </main>
  )
}
