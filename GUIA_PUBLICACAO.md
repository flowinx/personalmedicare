# 📱 Guia de Publicação - Personal MediCare

## ✅ Problemas Resolvidos

- [x] **EAS Project ID**: Configurado como `eeea5012-b2e5-41aa-ae52-6ea67cb7e0ad`
- [x] **EAS Build**: Configurado para iOS e Android
- [x] **Variáveis de ambiente**: Arquivo `.env` já configurado com chaves reais
- [x] **Placeholders removidos**: Código limpo sem placeholders

## ⚠️ Configuração Pendente

### 1. Configurar Senha do Gmail para Functions

**Passo a passo:**

1. Acesse: https://myaccount.google.com/apppasswords
2. Faça login com a conta `personalmedicare@gmail.com`
3. Gere uma nova senha de app (16 caracteres)
4. Substitua `CONFIGURE_GMAIL_APP_PASSWORD` no arquivo:
   ```bash
   # Em functions/.env
   EMAIL_PASSWORD=sua_senha_de_16_caracteres_aqui
   ```

5. Configure no Firebase Functions:
   ```bash
   cd functions
   firebase functions:config:set email.password="sua_senha_de_16_caracteres_aqui"
   ```

## 🚀 Checklist de Publicação

### Preparação
- [x] Configurar EAS Project ID
- [x] Configurar variáveis de ambiente
- [ ] Configurar senha do Gmail
- [ ] Testar envio de email
- [ ] Verificar Face ID no dispositivo físico

### Build e Teste
```bash
# 1. Instalar EAS CLI (se não tiver)
npm install -g @expo/eas-cli

# 2. Login no EAS
eas login

# 3. Build de desenvolvimento para teste
eas build --platform ios --profile development
eas build --platform android --profile development

# 4. Build de produção
eas build --platform all --profile production
```

### Configuração das Lojas

#### App Store (iOS)
1. Criar app no App Store Connect
2. Configurar metadados:
   - Nome: "Personal MediCare"
   - Categoria: "Medicina"
   - Palavras-chave: "medicamentos, saúde, família, lembretes"
3. Preparar screenshots (obrigatório)
4. Configurar política de privacidade

#### Google Play (Android)
1. Criar app no Google Play Console
2. Configurar metadados similares
3. Preparar screenshots
4. Configurar classificação de conteúdo

### Assets Necessários
- [x] Ícone do app (512x512)
- [x] Splash screen
- [ ] Screenshots para App Store (vários tamanhos)
- [ ] Screenshots para Google Play
- [ ] Ícone da feature graphic (Google Play)

## 📋 Comandos Úteis

```bash
# Verificar configuração
eas build:configure

# Ver builds
eas build:list

# Submeter para as lojas
eas submit --platform ios
eas submit --platform android

# Verificar status
eas build:view [BUILD_ID]
```

## 🔒 Segurança

- [x] Variáveis sensíveis em .env
- [x] .env no .gitignore
- [x] Configurações de autenticação
- [x] Permissões adequadas (Face ID, câmera, etc.)

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `eas build:view [BUILD_ID]`
2. Documentação: https://docs.expo.dev/
3. Comunidade: https://forums.expo.dev/

---

**Status Atual**: ✅ Pronto para build! EAS configurado com sucesso

**Próximo Passo**: 
1. Configurar senha do Gmail (opcional para primeira build)
2. Executar `eas build --platform all --profile development` para teste
3. Executar `eas build --platform all --profile production` para produção