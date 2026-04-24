import urllib.request
import os

# Baixar o logo original diretamente se não quisermos instalar o PIL
# Ou podemos só usar PIL se estiver instalado
try:
    from PIL import Image
    
    logo = Image.open('D:/Projeto/web/public/logo.png')
    logo.thumbnail((256, 256), Image.Resampling.LANCZOS)
    logo.save('D:/Projeto/web/public/logo_stripe.png', format='PNG', optimize=True)
    
    favicon = Image.open('D:/Projeto/web/public/favicon.png')
    favicon.thumbnail((256, 256), Image.Resampling.LANCZOS)
    favicon.save('D:/Projeto/web/public/favicon_stripe.png', format='PNG', optimize=True)
    print("Sucesso usando PIL!")
except ImportError:
    print("PIL não encontrado. Tentando outra abordagem ou avise o usuário.")
