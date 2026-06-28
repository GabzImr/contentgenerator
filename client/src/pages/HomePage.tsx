import { useState, useEffect } from 'react';
import axios from 'axios';
import CopyButton from '../components/CopyButton';

export default function HomePage() {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  

  const [costPrice, setCostPrice] = useState<number>(0);
  const [marketplaceFee, setMarketplaceFee] = useState<number>(0);
  const [desiredMargin, setDesiredMargin] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);


  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/contents');
      setHistory(response.data);
    } catch (err) {
      console.error("Erro ao carregar histórico", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        link: link.trim() === '' ? undefined : link,
        costPrice: Number(costPrice),
        marketplaceFee: Number(marketplaceFee),
        desiredMargin: Number(desiredMargin)
      };

      const response = await axios.post('/api/generate', payload);
      setResult(response.data);
      fetchHistory(); 
    } catch (error: any) {
      const mensagemErro = error.response?.data?.error || error.message || 'Erro desconhecido';
      alert(`Erro: ${mensagemErro}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que clique no card ao tentar deletar
    if (!confirm("Deseja realmente excluir este registro?")) return;
    try {
      await axios.delete(`/api/contents/${id}`);
      if (result && result.id === id) setResult(null);
      fetchHistory();
    } catch (err) {
      alert("Erro ao deletar item.");
    }
  };

  const handleExportTXT = (productData: any) => {
    const content = productData.contents[0];
    const textData = `==================================================
PRODUTO: ${productData.name}
${productData.link ? `LINK ORIGINAL: ${productData.link}` : ''}
==================================================

[FINANCEIRO]
- Preço de Custo: R$ ${productData.costPrice.toFixed(2)}
- Taxas Aplicadas: ${productData.marketplaceFee}%
- Margem de Lucro Almejada: ${productData.desiredMargin}%
- PREÇO SUGERIDO DE VENDA: R$ ${productData.suggestedPrice.toFixed(2)}

==================================================
TÍTULO OTIMIZADO SEO (Score: ${content.titleScore}/100)
==================================================
${content.title}

==================================================
DESCRIÇÃO MERCADO LIVRE
==================================================
${content.descriptionML}

==================================================
DESCRIÇÃO SHOPEE
==================================================
${content.descriptionShopee}

==================================================
PALAVRAS-CHAVE SELECIONADAS
==================================================
${(() => {
  try {
    const parsed = JSON.parse(content.keywords);
    return Array.isArray(parsed) ? parsed.join(', ') : content.keywords;
  } catch {
    return content.keywords;
  }
})()}

==================================================
POST INSTAGRAM
==================================================
${content.instagramPost}

Hashtags:
${content.instagramHashtags}
`;

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `${productData.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}-conteudo.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; 
    if (score >= 50) return '#f59e0b'; 
    return '#ef4444'; 
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* Bloco de Entrada principal */}
      <div>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Gerador de Conteúdo & Precificação</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px' }}>Gere títulos otimizados, descrições perfeitas e calcule o seu preço de venda ideal</p>

        <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nome do Produto *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Ex: Fone de Ouvido Bluetooth Pro"
                style={{ width: '94%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: '#111', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Link do Produto (Opcional)</label>
              <input
                type="url"
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://..."
                style={{ width: '94%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: '#111', color: '#fff' }}
              />
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px dashed var(--card-border)' }}>
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--accent)' }}>Calculadora de Margem & Canais</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>Custo do Produto (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={costPrice} 
                  onChange={e => setCostPrice(Number(e.target.value))} 
                  style={{ width: '88%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', background: '#161622', color: '#fff' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>Taxa Marketplace (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={marketplaceFee} 
                  onChange={e => setMarketplaceFee(Number(e.target.value))} 
                  style={{ width: '88%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', background: '#161622', color: '#fff' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>Margem Desejada (%)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={desiredMargin} 
                  onChange={e => setDesiredMargin(Number(e.target.value))} 
                  style={{ width: '88%', padding: '10px', borderRadius: '6px', border: '1px solid var(--card-border)', background: '#161622', color: '#fff' }} 
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Gerando inteligência de mercado...' : 'Processar Produto com IA'}
          </button>
        </form>
      </div>

      {/* Resultados da Geração Ativa */}
      {result && result.contents && result.contents[0] && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Resultados Estruturados</h2>
            <button 
              onClick={() => handleExportTXT(result)} 
              className="btn-primary" 
              style={{ background: '#10b981', padding: '8px 16px', fontSize: '14px' }}
            >
              ⬇ Baixar tudo (.TXT)
            </button>
          </div>

          {result.suggestedPrice > 0 && (
            <div className="glass-card" style={{ borderLeft: '5px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>Preço Ideal de Venda Recomendado</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Custo Inicial: R$ {result.costPrice.toFixed(2)} | Taxa Canal: {result.marketplaceFee}% | Margem Alvo: {result.desiredMargin}%</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                R$ {result.suggestedPrice.toFixed(2)}
              </div>
            </div>
          )}

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h3>Título Otimizado SEO</h3>
              <CopyButton text={result.contents[0].title}/>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 500, margin: '0 0 15px 0' }}>{result.contents[0].title}</p>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Score de Qualidade do Título</span>
                <span style={{ fontWeight: 'bold', color: getScoreColor(result.contents[0].titleScore) }}>{result.contents[0].titleScore}/100</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${result.contents[0].titleScore}%`, height: '100%', background: getScoreColor(result.contents[0].titleScore), transition: 'width 0.5s ease' }}></div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Cópia Comercial — Mercado Livre</h3><CopyButton text={result.contents[0].descriptionML}/></div>
            <p style={{ whiteSpace: 'pre-wrap', color: '#e5e7eb' }}>{result.contents[0].descriptionML}</p>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Cópia Comercial — Shopee</h3><CopyButton text={result.contents[0].descriptionShopee}/></div>
            <p style={{ whiteSpace: 'pre-wrap', color: '#e5e7eb' }}>{result.contents[0].descriptionShopee}</p>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Canal Social (Instagram)</h3><CopyButton text={`${result.contents[0].instagramPost}\n\n${result.contents[0].instagramHashtags}`}/></div>
            <p style={{ whiteSpace: 'pre-wrap', color: '#e5e7eb' }}>{result.contents[0].instagramPost}</p>
            <p style={{ color: 'var(--accent)', marginTop: '15px' }}>{result.contents[0].instagramHashtags}</p>
          </div>
        </div>
      )}

      {/* Histórico na Parte Inferior da Tela */}
      {history.length > 0 && (
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--card-border)', paddingTop: '30px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Histórico de Consultas Salvas</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {history.map((item) => (
              <div 
                key={item.id} 
                className="glass-card" 
                style={{ padding: '20px', fontSize: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px', cursor: 'pointer', border: result?.id === item.id ? '1px solid var(--accent)' : '1px solid var(--card-border)' }}
                onClick={() => setResult(item)}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {item.suggestedPrice > 0 && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '8px', borderRadius: '6px', color: '#10b981', fontWeight: '600' }}>
                    Preço Venda: R$ {item.suggestedPrice.toFixed(2)}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }} onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => setResult(item)} 
                    style={{ flex: 1, background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                  >
                    Abrir
                  </button>
                  <button 
                    onClick={() => handleExportTXT(item)} 
                    style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    TXT
                  </button>
                  <button 
                    onClick={(e) => handleDelete(item.id, e)} 
                    style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}