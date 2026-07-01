import React from 'react';
import { Printer } from 'lucide-react';

const ComandaPrint = ({ venda, tipo = 'comanda' }) => {
  const calcularTotal = (items = []) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce(
      (acc, item) => acc + (item.preco || 0) * (item.quantidade || 0),
      0
    );
  };

  const calcularSubtotal = (items = []) => {
    if (!Array.isArray(items)) return 0;
    return items
      .filter(item => item.nome !== 'Taxa de Serviço')
      .reduce((acc, item) => acc + (item.preco || 0) * (item.quantidade || 0), 0);
  };

  const obterTaxaServico = (items = []) => {
    if (!Array.isArray(items)) return null;
    return items.find(item => item.nome === 'Taxa de Serviço');
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const imprimirComanda = () => {
    const conteudoImpressao = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${tipo === 'comanda' ? 'Comanda' : 'Conta'} - ${venda.identificador || venda.id.slice(0, 8).toUpperCase()}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
          }
          
          .container {
            width: 100%;
            max-width: 70mm;
            margin: 0 auto;
            padding: 5mm;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
          
          .empresa {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          .tipo-documento {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          .info-comanda {
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px dashed #000;
          }
          
          .info-linha {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          
          .itens {
            margin-bottom: 12px;
          }
          
          .item {
            margin-bottom: 6px;
            padding-bottom: 4px;
            border-bottom: 1px dotted #ccc;
          }
          
          .item-nome {
            font-weight: bold;
            margin-bottom: 2px;
          }
          
          .item-detalhes {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
          }
          
          .total {
            border-top: 2px solid #000;
            padding-top: 8px;
            margin-top: 12px;
            text-align: center;
          }
          
          .total-valor {
            font-size: 16px;
            font-weight: bold;
          }
          
          .footer {
            text-align: center;
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px dashed #000;
            font-size: 10px;
          }
          
          .linha-separadora {
            text-align: center;
            margin: 8px 0;
            font-size: 10px;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            
            .container {
              max-width: none;
              width: 100%;
              margin: 0;
              padding: 2mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="empresa">PAINELÉ</div>
            <div class="tipo-documento">${tipo === 'comanda' ? 'COMANDA' : 'CONTA'}</div>
          </div>
          
          <div class="info-comanda">
            <div class="info-linha">
              <span><strong>Número:</strong></span>
              <span>${venda.identificador || venda.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div class="info-linha">
              <span><strong>Data:</strong></span>
              <span>${formatarData(venda.createdAt || new Date())}</span>
            </div>
            <div class="info-linha">
              <span><strong>Status:</strong></span>
              <span>${venda.finalizada ? 'FINALIZADA' : 'ABERTA'}</span>
            </div>
          </div>
          
          <div class="itens">
            <div style="font-weight: bold; margin-bottom: 8px; text-align: center;">ITENS</div>
            ${(venda.itensVenda || [])
              .filter(item => item.nome !== 'Taxa de Serviço')
              .map(item => `
              <div class="item">
                <div class="item-nome">${item.nome}</div>
                <div class="item-detalhes">
                  <span>Qtd: ${item.quantidade}</span>
                  <span>Unit: R$ ${(item.preco || 0).toFixed(2)}</span>
                  <span><strong>Total: R$ ${((item.preco || 0) * (item.quantidade || 0)).toFixed(2)}</strong></span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="total">
            <div class="linha-separadora">================================</div>
            ${(() => {
              const taxaServico = obterTaxaServico(venda.itensVenda);
              const subtotal = calcularSubtotal(venda.itensVenda);
              
              if (taxaServico) {
                return `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
                    <span>Subtotal:</span>
                    <span>R$ ${subtotal.toFixed(2)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
                    <span>Taxa de Serviço (10%):</span>
                    <span>R$ ${taxaServico.preco.toFixed(2)}</span>
                  </div>
                  <div class="linha-separadora">- - - - - - - - - - - - - - - - - -</div>
                `;
              }
              return '';
            })()}
            <div style="margin-bottom: 4px;">TOTAL GERAL</div>
            <div class="total-valor">R$ ${calcularTotal(venda.itensVenda).toFixed(2)}</div>
          </div>
          
          <div class="footer">
            <div class="linha-separadora">- - - - - - - - - - - - - - - - - -</div>
            <div>Obrigado pela preferência!</div>
            <div>Sistema Painelé</div>
            ${tipo === 'comanda' ? '<div style="margin-top: 8px; font-weight: bold;">*** COMANDA PARA CONTROLE ***</div>' : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    // Criar uma nova janela para impressão
     const janelaImpressao = window.open('', '_blank', 'width=800,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no');
     janelaImpressao.document.write(conteudoImpressao);
     janelaImpressao.document.close();
     
     // Aguardar o carregamento e acionar a impressão automaticamente
     janelaImpressao.onload = () => {
       janelaImpressao.focus();
       // Acionar a impressão automaticamente (equivalente ao Ctrl+P)
       janelaImpressao.print();
       
       // Fechar a janela após a impressão
       setTimeout(() => {
         janelaImpressao.close();
       }, 1000);
     };
  };

  return (
    <button
      onClick={imprimirComanda}
      className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-xs font-medium transition-all duration-300 hover:scale-105 shadow-md"
      title={`Imprimir ${tipo === 'comanda' ? 'comanda' : 'conta'}`}
    >
      <Printer className="w-3 h-3" />
      {tipo === 'comanda' ? 'Imprimir' : 'Conta'}
    </button>
  );
};

export default ComandaPrint;