#!/usr/bin/env node

/**
 * Script para atualizar o version.json automaticamente durante o build
 * Uso: node scripts/update-version.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminhos dos arquivos
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const versionJsonPath = path.join(__dirname, '..', 'public', 'version.json');

try {
  // Ler package.json para obter a versão
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Gerar hash único baseado no timestamp e conteúdo
  const buildTime = new Date().toISOString();
  const hashContent = buildTime + packageJson.version + Math.random();
  const hash = crypto.createHash('md5').update(hashContent).digest('hex').substring(0, 8);
  
  // Criar objeto de versão
  const versionInfo = {
    version: packageJson.version || '1.0.0',
    buildTime: buildTime,
    hash: hash
  };
  
  // Escrever version.json
  fs.writeFileSync(versionJsonPath, JSON.stringify(versionInfo, null, 2));
  
  console.log('✅ version.json atualizado com sucesso:');
  console.log(`   Versão: ${versionInfo.version}`);
  console.log(`   Build: ${versionInfo.buildTime}`);
  console.log(`   Hash: ${versionInfo.hash}`);
  
} catch (error) {
  console.error('❌ Erro ao atualizar version.json:', error.message);
  process.exit(1);
}