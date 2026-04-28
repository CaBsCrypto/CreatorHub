import React from 'react';
import { Wallet, X, CheckCircle } from 'lucide-react';
import { UserProfile } from '../../supabase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSave: (data: { 
    payment_method: 'binance' | 'wallet', 
    binance_id: string, 
    wallet_address: string, 
    wallet_network: string,
    wallet_note: string,
    wallet_address_2: string,
    wallet_network_2: string,
    wallet_2_note: string
  }) => Promise<void>;
  isSaving: boolean;
}

const EVM_NETWORKS = ['BSC', 'Polygon', 'Ethereum', 'Arbitrum'];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, profile, onSave, isSaving }) => {
  const [payment_method, setPaymentMethod] = React.useState<'binance' | 'wallet'>(profile?.payment_method || 'binance');
  const [binance_id, setBinanceId] = React.useState(profile?.binance_id || '');
  const [wallet_address, setWalletAddress] = React.useState(profile?.wallet_address || '');
  const [wallet_network, setWalletNetwork] = React.useState(profile?.wallet_network || 'BSC');
  const [wallet_note, setWalletNote] = React.useState(profile?.wallet_note || '');
  const [wallet_address_2, setWalletAddress_2] = React.useState(profile?.wallet_address_2 || '');
  const [wallet_network_2, setWalletNetwork_2] = React.useState(profile?.wallet_network_2 || 'BSC');
  const [wallet_2_note, setWallet_2_Note] = React.useState(profile?.wallet_2_note || '');
  const [validationError, setValidationError] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (payment_method === 'binance') {
      if (!/^[a-zA-Z0-9]{6,20}$/.test(binance_id.trim())) {
        setValidationError('El Binance Pay ID debe tener 6-20 caracteres alfanuméricos.');
        return;
      }
    } else {
      if (EVM_NETWORKS.includes(wallet_network)) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address.trim())) {
          setValidationError('La dirección EVM debe empezar con 0x y tener 42 caracteres.');
          return;
        }
      } else if (wallet_address.trim().length < 32) {
        setValidationError('La dirección de wallet es demasiado corta.');
        return;
      }
    }

    onSave({ 
      payment_method, 
      binance_id, 
      wallet_address, 
      wallet_network,
      wallet_note,
      wallet_address_2,
      wallet_network_2,
      wallet_2_note
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-600" />
              Ajustes de Pago
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">Configura cómo deseas recibir tus pagos y recompensas.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-gray-50 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Método Preferido</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('binance')}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest border transition-all ${
                  payment_method === 'binance' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-gray-50 text-slate-400 border-gray-100 hover:bg-white hover:border-indigo-200'
                }`}
              >
                Binance Pay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest border transition-all ${
                  payment_method === 'wallet' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-gray-50 text-slate-400 border-gray-100 hover:bg-white hover:border-indigo-200'
                }`}
              >
                Crypto Wallet
              </button>
            </div>
          </div>

          {payment_method === 'binance' ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Binance Pay ID</label>
              <input
                type="text" required value={binance_id}
                onChange={(e) => setBinanceId(e.target.value)}
                placeholder="Ej: 123456789"
                className="block w-full rounded-xl border border-gray-100 bg-gray-50 py-3 px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all outline-none"
              />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" /> Wallet Principal
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Red</label>
                    <select
                      value={wallet_network}
                      onChange={(e) => setWalletNetwork(e.target.value)}
                      className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                      <option value="BSC">BNB Chain</option>
                      <option value="Polygon">Polygon</option>
                      <option value="Ethereum">Ethereum</option>
                      <option value="Solana">Solana</option>
                      <option value="Arbitrum">Arbitrum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Etiqueta</label>
                    <input
                      type="text" value={wallet_note}
                      onChange={(e) => setWalletNote(e.target.value)}
                      placeholder="Ej: Personal"
                      className="block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Dirección Wallet</label>
                  <input
                    type="text" required value={wallet_address}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Wallet Secundaria (Opcional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <select
                      value={wallet_network_2}
                      onChange={(e) => setWalletNetwork_2(e.target.value)}
                      className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                      <option value="BSC">BNB Chain</option>
                      <option value="Polygon">Polygon</option>
                      <option value="Ethereum">Ethereum</option>
                      <option value="Solana">Solana</option>
                      <option value="Arbitrum">Arbitrum</option>
                    </select>
                  </div>
                  <input
                    type="text" value={wallet_2_note}
                    onChange={(e) => setWallet_2_Note(e.target.value)}
                    placeholder="Ej: Ahorros"
                    className="block w-full rounded-xl border border-gray-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  />
                </div>
                <input
                  type="text" value={wallet_address_2}
                  onChange={(e) => setWalletAddress_2(e.target.value)}
                  placeholder="0x..."
                  className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none font-mono"
                />
              </div>
            </div>
          )}

          {validationError && (
            <p className="text-xs text-rose-600 font-bold bg-rose-50 rounded-xl px-4 py-3 border border-rose-100 animate-in shake duration-300">{validationError}</p>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-50">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-gray-100 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-gray-50 transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all">
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
