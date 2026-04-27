'use client';
import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

export default function FormularioPagamento() {
  const stripe = useStripe();
  const elements = useElements();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setCarregando(true);
    setErro(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/sucesso`,
      },
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setErro(error.message || 'Dados inválidos do cartão.');
      } else {
        setErro('Ocorreu um erro ao processar o pagamento. Tente novamente.');
      }
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col mt-6">
      <PaymentElement options={{ layout: 'tabs' }} />
      
      {erro && (
        <div className="mt-6 p-3 bg-red-900/40 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {erro}
        </div>
      )}
      
      <button 
        disabled={!stripe || !elements || carregando}
        className="w-full py-4 mt-6 font-extrabold rounded-xl text-base transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: '#D4AF37', color: '#090B10' }}>
        {carregando ? <><Loader2 className="animate-spin" size={18} /> Finalizando Assinatura...</> : 'Efetuar Pagamento Agora'}
      </button>
    </form>
  )
}
