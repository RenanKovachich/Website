#!/bin/bash

# Criar diretórios necessários
mkdir -p src/{components,pages,services,hooks,contexts,utils,types,assets,theme}

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Instalar dependências de desenvolvimento
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-prettier eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks prettier

# Inicializar Git
git init
git add .
git commit -m "Inicialização do projeto LinkSpace"

echo "Projeto LinkSpace inicializado com sucesso!"
echo "Execute 'npm start' para iniciar o servidor de desenvolvimento." 