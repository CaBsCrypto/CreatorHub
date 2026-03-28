import React from 'react';
import { Wallet, X } from 'lucide-react';
import { UserProfile } from '../../supabase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onSave: (data: { payment_method: 'binance' | 'wallet', binance_id: string, wallet_address: string, wallet_network: string }) => Promise<void>;
  isSaving: boolean;
}

const EVM_NETWORKS = ['BSC', 'Polygon', 'Ethereum', 'Arbitrum'];

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, profile, onSave, isSaving }) => {
  const [payment_method, setPaymentMethod] = React.useState<'binance' | 'wallet'>(profile?.payment_method || 'binance');
  const [binance_id, setBinanceId] = React.useState(profile?.binance_id || '');
  const [wallet_address, setWalletAddress] = React.useState(profile?.wallet_address || '');
  const [wallet_network, setWalletNetwork] = React.useState(profile?.wallet_network || 'BSC');
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
          setValidationError('La dirección EVM debe empezar con 0x y tener 42 caracteres en total.');
          return;
        }
      } else if (wallet_address.trim().length < 32) {
        setValidationError('La dirección de wallet parece demasiado corta.');
        return;
      }
    }

    onSave({ payment_method, binance_id, wallet_address, wallet_network });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg animate-in zoom-in-95 duration-200">
        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
              <Wallet className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">Configuración de Pagos</h3>
              <div className="mt-2 text-sm text-gray-500 mb-4">
                ¿Cómo te gustaría recibir tus pagos? Elige Binance Pay o una Wallet Directa.
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">Método de Pago</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('binance')}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset transition-colors ${
                        payment_method === 'binance' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Binance Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wallet')}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset transition-colors ${
                        payment_method === 'wallet' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20' : 'bg-white text-gray-700 ring-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Crypto Wallet
                    </button>
                  </div>
                </div>

                {payment_method === 'binance' ? (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label htmlFor="binance_id" className="block text-sm font-medium leading-6 text-gray-900">Binance Pay ID</label>
                    <div className="mt-2">
                      <input
                        type="text"
                        id="binance_id"
                        required
                        value={binance_id}
                        onChange={(e) => setBinanceId(e.target.value)}
                        placeholder="Ingresa tu ID de Binance"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                    <div>
                      <label htmlFor="wallet_network" className="block text-sm font-medium leading-6 text-gray-900">Red</label>
                      <div className="mt-2">
                        <select
                          id="wallet_network"
                          value={wallet_network}
                          onChange={(e) => setWalletNetwork(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="BSC">BNB Smart Chain (BEP20)</option>
                          <option value="Polygon">Polygon (MATIC)</option>
                          <option value="Ethereum">Ethereum (ERC20)</option>
                          <option value="Solana">Solana (SOL)</option>
                          <option value="Arbitrum">Arbitrum One</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="wallet_address" className="block text-sm font-medium leading-6 text-gray-900">Dirección de Wallet</label>
                      <div className="mt-2">
                        <input
                          type="text"
                          id="wallet_address"
                          required
                          value={wallet_address}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          placeholder="0x..."
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {validationError && (
                  <p className="text-sm text-rose-600 font-medium bg-rose-50 rounded-xl px-4 py-2.5">{validationError}</p>
                )}
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-50"
                  >
                    {isSaving ? 'Guardando...' : 'Guardar Ajustes'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
