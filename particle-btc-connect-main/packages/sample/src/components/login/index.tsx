'use client';

import {
  // UnisatConnector,
  useAccounts,
  useBTCProvider,
  useConnectModal,
  useConnector,
  useETHProvider,
} from '@particle-network/btc-connectkit';
import { useState } from 'react';
import { Simulate } from 'react-dom/test-utils';
import click = Simulate.click;
import { Button } from '@nextui-org/react';
import { toast } from 'react-toastify';

export default function Login() {
  const { openConnectModal, disconnect } = useConnectModal();
  const { accounts } = useAccounts();
  const { evmAccount, smartAccount, chainId, switchChain } = useETHProvider();

  const { provider, getNetwork, switchNetwork, signMessage, getPublicKey, sendBitcoin, sendInscription } =
    useBTCProvider();
  // const [gasless, setGasless] = useState<boolean>(false);
  // const [inscriptionReceiverAddress, setInscriptionReceiverAddress] = useState<string>();
  // const [inscriptionId, setInscriptionId] = useState<string>();
  const [message, setMessage] = useState<string>('Login For Bitmapwar!');
  // const [address, setAddress] = useState<string>();
  // const [satoshis, setSatoshis] = useState<string>('1');
  const { connectors, connect } = useConnector();

  // const connect_wallet = async (name: string) => {
  //   await connect(name);
  //   const publicKey = await (window as any).getPublicKey(name);
  //   return await new Promise((resolve) => {
  //     const interval = setInterval(() => {
  //       if ((window as any).evmAccount !== undefined && (window as any).accounts !== undefined) {
  //         clearInterval(interval);
  //         resolve({
  //           btcAddress: (window as any).accounts[0],
  //           merlinAddress: (window as any).evmAccount,
  //           publicKey: publicKey,
  //         });
  //       }
  //     }, 50);
  //   });
  // };

  // const connect_wallet =  (name: string) => {
  //    connect(name);
  // }

  const onGetNetwork = async () => {
    try {
      const network = await getNetwork();
      toast.success(network);
    } catch (error: any) {
      console.log('🚀 ~ onGetNetwork ~ error:', error);
      toast.error(error.message || 'get network error');
    }
  };

  const onGetPubkey = async () => {
    try {
      const pubKey = await getPublicKey();
      console.log('🚀 ~ onGetPubkey ~ pubKey:', pubKey);
      toast.success(pubKey);
    } catch (error: any) {
      toast.error(error.message || 'get pubkey error');
    }
  };

  return (
    <div>
      {/*<Button color="primary" onClick={connect_wallet('unisat')}>login</Button>*/}
      <Button color="primary" onClick={onGetNetwork}>
        Get Network
      </Button>
      {accounts.length === 0 && (
        <Button color="primary" onClick={openConnectModal}>
          Connect
        </Button>
      )}
      {accounts.length !== 0 && (
        <Button color="primary" onClick={disconnect}>
          Disconnect
        </Button>
      )}
      <Button color="primary" onClick={onGetPubkey}>
        Get Pubkey
      </Button>
    </div>
  );
}
