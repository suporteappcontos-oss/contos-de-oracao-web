import re

with open('D:/Projeto/web/src/components/LandingPage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update the main banner container
text = text.replace(
'''        <section className="py-8 px-6 lg:px-10 max-w-6xl mx-auto">
          <div
            className="rounded-3xl overflow-hidden p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center"
            style={{
              background: 'linear-gradient(135deg, #0D1625 0%, #1a2a40 50%, #0D1625 100%)',
              border: `1px solid ${PRIMARY}33`,
            }}
          >
            {/* Col esquerda */}
            <div className="flex-1">''',
'''        <section className="py-8 px-6 lg:px-10 max-w-6xl mx-auto">
          <div
            className="relative rounded-3xl overflow-hidden p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center border transition-all duration-500 hover:shadow-2xl group"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.7) 0%, rgba(10, 14, 25, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(212, 175, 55, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Efeito de brilho de fundo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
               <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[150%] opacity-20 transition-opacity duration-500 group-hover:opacity-40" style={{ background: `radial-gradient(ellipse at center, ${PRIMARY}40 0%, transparent 60%)` }} />
            </div>
            {/* Col esquerda */}
            <div className="flex-1 relative z-10">'''
)

# 2. Update the button
text = text.replace(
'''              <Link
                href={session ? "/revistas" : "/planos"}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm transition-all hover:brightness-110"
                style={{ background: PRIMARY, color: BG_ROOT, textDecoration: 'none' }}
              >
                <BookOpen size={16} /> LER REVISTA
              </Link>''',
'''              <Link
                href={session ? "/revistas" : "/planos"}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm transition-all duration-300 hover:scale-[1.03] shadow-lg hover:shadow-xl"
                style={{ background: PRIMARY, color: BG_ROOT, textDecoration: 'none', boxShadow: `0 10px 25px -5px ${PRIMARY}66` }}
              >
                <BookOpen size={16} /> LER REVISTA
              </Link>'''
)

# 3. Update the cover
text = text.replace(
'''            {/* Col centro — capa */}
            <div
              className="w-40 h-52 rounded-xl shrink-0 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #8B7322)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >''',
'''            {/* Col centro — capa */}
            <div
              className="w-40 h-56 md:w-48 md:h-64 rounded-xl shrink-0 relative overflow-hidden transition-transform duration-500 hover:scale-[1.03] z-10"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #8B7322)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                border: '1px solid rgba(212, 175, 55, 0.4)'
              }}
            >'''
)

text = text.replace(
'''            {/* Col direita — lista */}
            <div className="flex-1">''',
'''            {/* Col direita — lista */}
            <div className="flex-1 relative z-10">'''
)

# Replace right col if dash varies
text = text.replace(
'''            {/* Col direita - lista */}
            <div className="flex-1">''',
'''            {/* Col direita - lista */}
            <div className="flex-1 relative z-10">'''
)

# Replace center col if dash varies
text = text.replace(
'''            {/* Col centro - capa */}
            <div
              className="w-40 h-52 rounded-xl shrink-0 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #8B7322)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            >''',
'''            {/* Col centro - capa */}
            <div
              className="w-40 h-56 md:w-48 md:h-64 rounded-xl shrink-0 relative overflow-hidden transition-transform duration-500 hover:scale-[1.03] z-10"
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #8B7322)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                border: '1px solid rgba(212, 175, 55, 0.4)'
              }}
            >'''
)


with open('D:/Projeto/web/src/components/LandingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Updated successfully')
