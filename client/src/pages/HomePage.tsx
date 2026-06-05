import { useState } from 'react';

import axios from 'axios';

import CopyButton from '../components/CopyButton';



export default function HomePage() {

  const [name, setName] = useState('');

  const [link, setLink] = useState('');

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<any>(null);



 const handleSubmit = async (e: React.FormEvent) => {

  e.preventDefault();

  setLoading(true);

  try {

    

    const payload = {

      name,

      link: link.trim() === '' ? undefined : link

    };



    const response = await axios.post('/api/generate', payload);

    setResult(response.data);

 } catch (error: any) {

    

    const mensagemErro = error.response?.data?.error || error.message || 'Erro desconhecido';

    alert(`Erro Real: ${mensagemErro}`);

  } finally {

    setLoading(false);

  }

};





  return (

    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>

      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Gerador de Conteúdo IA</h1>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px' }}>Crie títulos, descrições e posts em segundos</p>



      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div>

          <label style={{ display: 'block', marginBottom: '8px' }}>Nome do Produto *</label>

          <input

            type="text"

            value={name}

            onChange={e => setName(e.target.value)}

            required

            style={{ width: '96%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: '#111', color: '#fff' }}

          />

        </div>

        <div>

          <label style={{ display: 'block', marginBottom: '8px' }}>Link do Produto (Opcional)</label>

          <input

            type="url"

            value={link}

            onChange={e => setLink(e.target.value)}

            style={{ width: '96%', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: '#111', color: '#fff' }}

          />

        </div>

        <button type="submit" className="btn-primary" disabled={loading}>

          {loading ? 'Gerando Conteúdo Incrível...' : 'Gerar com IA'}

        </button>

      </form>



      {result && result.contents && result.contents[0] && (

        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

          <h2>Conteúdo Gerado com Sucesso!</h2>

         

          <div className="glass-card">

            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Título Otimizado SEO</h3><CopyButton text={result.contents[0].title}/></div>

            <p>{result.contents[0].title}</p>

          </div>



          <div className="glass-card">

            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Mercado Livre</h3><CopyButton text={result.contents[0].descriptionML}/></div>

            <p style={{ whiteSpace: 'pre-wrap' }}>{result.contents[0].descriptionML}</p>

          </div>



          <div className="glass-card">

            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Shopee</h3><CopyButton text={result.contents[0].descriptionShopee}/></div>

            <p style={{ whiteSpace: 'pre-wrap' }}>{result.contents[0].descriptionShopee}</p>

          </div>



          <div className="glass-card">

            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3>Instagram Post</h3><CopyButton text={`${result.contents[0].instagramPost}\n\n${result.contents[0].instagramHashtags}`}/></div>

            <p style={{ whiteSpace: 'pre-wrap' }}>{result.contents[0].instagramPost}</p>

            <p style={{ color: 'var(--accent)' }}>{result.contents[0].instagramHashtags}</p>

          </div>

        </div>

      )}

    </div>

  );

}