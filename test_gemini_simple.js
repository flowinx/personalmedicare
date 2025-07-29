// Teste simples da API do Gemini
const fetch = require('node-fetch');

const API_KEY = 'AIzaSyDLL64gXACWEcnmSSJyjZV_pdVSTDn5yus';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function testSimpleRequest() {
  console.log('🧪 Testando requisição simples para o Gemini...');
  
  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: "Olá! Você pode me dizer apenas 'Oi, tudo bem?' como resposta?"
            }
          ]
        }
      ]
    };
    
    console.log('📡 Fazendo requisição...');
    console.log(`URL: ${BASE_URL}?key=${API_KEY.substring(0, 10)}...`);
    
    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    const responseText = await response.text();
    console.log('📋 Resposta completa:');
    console.log(responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      if (data.candidates && data.candidates.length > 0) {
        console.log('✅ Resposta da IA:');
        console.log(data.candidates[0].content.parts[0].text);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testSimpleRequest();