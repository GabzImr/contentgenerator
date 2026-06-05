import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
    >
      {copied ? <FiCheck color="#10b981" /> : <FiCopy />}
      <span style={{ fontSize: '12px' }}>{copied ? 'Copiado!' : 'Copiar'}</span>
    </button>
  );
}