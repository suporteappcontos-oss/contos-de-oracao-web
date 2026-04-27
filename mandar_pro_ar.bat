@echo off
title Mandar Site para o Ar
color 0A

echo ===================================================
echo     PREPARANDO PARA ENVIAR ATUALIZACOES PARA O AR
echo ===================================================
echo.
echo [1/3] Preparando arquivos modificados...
git add .

echo.
echo [2/3] Salvando versao no historico...
git commit -m "Atualizacao automatica via BAT"

echo.
echo [3/3] Enviando para os servidores (GitHub e Vercel)...
echo Por favor, aguarde alguns segundos...
git push

echo.
echo ===================================================
echo     SUCESSO! O SISTEMA JA RECEBEU AS ALTERACOES!
echo.
echo     Acesse o seu painel da Vercel ou aguarde cerca
echo     de 1 minuto para ver as mudancas no ar.
echo ===================================================
echo.
pause
