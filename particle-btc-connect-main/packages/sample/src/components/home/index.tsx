'use client';

// import bitcoinIcon from '@/assets/bitcoin.png';
// import particleLogo from '@/assets/particle-logo.svg';
// import { accountContracts } from '@/config';
// import { Button, Checkbox, Divider, Input, Select, SelectItem } from '@nextui-org/react';
import logo from '@/assets/logo.gif';
import {
  // UnisatConnector,
  useAccounts,
  useBTCProvider,
  useConnectModal,
  useConnector,
  useETHProvider,
} from '@particle-network/btc-connectkit';
import { chains } from '@particle-network/chains';
import { useRequest } from 'ahooks';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { parseEther, Contract, AbiCoder } from 'ethers';
import BitMapWarAbi from './bitmapwar_abi.json';
import { GoogleAnalytics } from '@next/third-parties/google';

export default function Home() {
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

  if (typeof window !== 'undefined') {
    (window as any).getPublicKey = async (id: string) => {
      for (const connector in connectors) {
        if (connectors[connector].metadata.id === id) {
          return await connectors[connector].getPublicKey();
        }
      }
    };
    (window as any).accounts = accounts;
    (window as any).smartAccount = smartAccount;
    (window as any).evmAccount = evmAccount;
    (window as any).chainId = chainId;
    (window as any).connectors = connectors;
    (window as any).connect = async (name: string) => {
      await connect(name);
      const publicKey = await (window as any).getPublicKey(name);
      return await new Promise((resolve) => {
        const interval = setInterval(() => {
          if ((window as any).evmAccount !== undefined && (window as any).accounts !== undefined) {
            clearInterval(interval);
            resolve({
              btcAddress: (window as any).accounts[0],
              merlinAddress: (window as any).evmAccount,
              publicKey: publicKey,
            });
          }
        }, 50);
      });
    };
    (window as any).disconnect = disconnect;
    (window as any).getBalance = async () => {
      if (typeof smartAccount !== 'undefined') {
        const balance = await smartAccount.provider.request({
          method: 'eth_getBalance',
          params: [await smartAccount.getAddress(), 'latest'],
        });
        console.log('balance', balance);
        return balance;
      }
    };
    (window as any).sendTx = async () => {
      if (typeof smartAccount !== 'undefined') {
        const to = await smartAccount.getAddress();
        console.log('to', to);
        const tx = {
          to: to,
          value: '100000000000',
          data: '0x',
        };
        console.log('tx', tx);
        const feeQuotes = await smartAccount.getFeeQuotes(tx);
        console.log('feeQuotes', feeQuotes);
        const { userOp, userOpHash } = feeQuotes.verifyingPaymasterNative;
        const hash = await smartAccount.sendUserOperation({ userOp, userOpHash });
        console.log('hash', hash);
        return hash;
      }
    };
    (window as any).contractCall = async () => {
      if (typeof smartAccount !== 'undefined') {
        const to = await smartAccount.getAddress();
        console.log('to', to);
        const tx = {
          to: '0x50CE6428D8aCA4ce02c1701E492A43C8E35a1bc5',
          data: '0x6057361d000000000000000000000000000000000000000000000000000000000000002a',
        };
        console.log('tx', tx);
        const feeQuotes = await smartAccount.getFeeQuotes(tx);
        console.log('feeQuotes', feeQuotes);
        const { userOp, userOpHash } = feeQuotes.verifyingPaymasterNative;
        const hash = await smartAccount.sendUserOperation({ userOp, userOpHash });
        console.log('hash', hash);
        return hash;
      }
    };
    (window as any).purchase = async (virus: number) => {
      const price = parseEther('0.000001') as bigint;
      const fee = price * BigInt(virus);
      console.log('fee', fee.toString());
      if (typeof smartAccount !== 'undefined') {
        const tx = {
          to: '0x5a784f7Ab9A85E7bF98653dC6152F13e438Ec08d',
          value: fee.toString(),
          data: '0x',
        };
        console.log('tx', tx);
        const feeQuotes = await smartAccount.getFeeQuotes(tx);
        console.log('feeQuotes', feeQuotes);
        const { userOp, userOpHash } = feeQuotes.verifyingPaymasterNative;
        const hash = await smartAccount.sendUserOperation({ userOp, userOpHash });
        console.log('hash', hash);
        return hash;
      }
    };
    (window as any).extractProfit = async (amount: string, signature: string, nonce: number, to: string) => {
      console.log('BitMapWarAbi', BitMapWarAbi);
      if (typeof smartAccount !== 'undefined') {
        const contract = new Contract('0x5a784f7Ab9A85E7bF98653dC6152F13e438Ec08d', BitMapWarAbi) as any;
        const transaction = await contract.withdrawETHWithSignature.populateTransaction(
          Number(amount),
          signature,
          nonce,
          to
        );
        console.log('transaction', transaction);
        const tx = {
          to: '0x5a784f7Ab9A85E7bF98653dC6152F13e438Ec08d',
          data: transaction.data,
        };
        console.log('tx', tx);
        const feeQuotes = await smartAccount.getFeeQuotes(tx);
        console.log('feeQuotes', feeQuotes);
        const { userOp, userOpHash } = feeQuotes.verifyingPaymasterNative;
        const hash = await smartAccount.sendUserOperation({ userOp, userOpHash });
        console.log('hash', hash);
        return hash;
      }
    };
  }
  //
  // const onGetNetwork = async () => {
  //   try {
  //     const network = await getNetwork();
  //     toast.success(network);
  //   } catch (error: any) {
  //     console.log('🚀 ~ onGetNetwork ~ error:', error);
  //     toast.error(error.message || 'get network error');
  //   }
  // };

  // const onSwitchNetwork = async () => {
  //   try {
  //     const network = await getNetwork();
  //     const changeTo = network === 'livenet' ? 'testnet' : 'livenet';
  //     await switchNetwork(changeTo);
  //     toast.success(`Change To ${changeTo}`);
  //   } catch (error: any) {
  //     console.log('🚀 ~ onSwitchNetwork ~ error:', error);
  //     toast.error(error.message || 'switch chain error');
  //   }
  // };

  // const onGetPubkey = async () => {
  //   try {
  //     const pubKey = await getPublicKey();
  //     console.log('🚀 ~ onGetPubkey ~ pubKey:', pubKey);
  //     toast.success(pubKey);
  //   } catch (error: any) {
  //     toast.error(error.message || 'get pubkey error');
  //   }
  // };

  (window as any).onSignMessage = async () => {
    if (!message) {
      return;
    }
    try {
      const sig = await signMessage(message);
      toast.success(sig);
      return sig;
    } catch (error: any) {
      toast.error(error.message || 'sign message error');
    }
  };

  // const onSendBitcoin = async () => {
  //   if (!address || !satoshis) {
  //     return;
  //   }
  //   try {
  //     const txId = await sendBitcoin(address, Number(satoshis));
  //     toast.success(txId);
  //   } catch (error: any) {
  //     toast.error(error.message || 'send bitcoin error');
  //   }
  // };

  // const onSendInscription = async () => {
  //   if (!inscriptionReceiverAddress || !inscriptionId || !provider) {
  //     return;
  //   }
  //   try {
  //     const result = await sendInscription(inscriptionReceiverAddress, inscriptionId);
  //     const txId = result.txid;
  //     console.log('send inscription success, txid:', txId);
  //     toast.success(`send success \n${txId}`);
  //   } catch (error: any) {
  //     toast.error(error.message || 'send inscription error');
  //   }
  // };

  // const onSwitchChain = async (e: any) => {
  //   const chainId = Number(e.target.value);
  //   if (chainId) {
  //     try {
  //       await switchChain(chainId);
  //     } catch (error: any) {
  //       toast.error(error.message || 'switch chain error');
  //     }
  //   }
  // };

  // const { run: onSendNativeToken, loading: sendTokenLoading } = useRequest(
  //   async () => {
  //     if (!smartAccount) {
  //       throw new Error('Please connect wallet first!');
  //     }
  //     const balance = await smartAccount.provider.request({
  //       method: 'eth_getBalance',
  //       params: [await smartAccount.getAddress(), 'latest'],
  //     });
  //     const value = BigInt(balance) > 100000000n ? '100000000' : '0';
  //     const tx = {
  //       to: '0xe8fc0baE43aA264064199dd494d0f6630E692e73',
  //       value,
  //       data: '0x',
  //     };
  //     const feeQuotes = await smartAccount.getFeeQuotes(tx);
  //     const { userOp, userOpHash } =
  //       (gasless && feeQuotes.verifyingPaymasterGasless) || feeQuotes.verifyingPaymasterNative;
  //     const hash = await smartAccount.sendUserOperation({ userOp, userOpHash });
  //     return hash;
  //   },
  //   {
  //     manual: true,
  //     onSuccess: (hash) => {
  //       toast.success('Send Success!', {
  //         onClick: () => {
  //           const chain = chains.getEVMChainInfoById(chainId ?? 0);
  //           if (chain) {
  //             window.open(`${chain.blockExplorerUrl}/tx/${hash}`, '_blank');
  //           }
  //         },
  //       });
  //     },
  //     onError: (error) => {
  //       console.log('🚀 ~ onSendNativeToken ~ error:', error);
  //       toast.error(error.message || 'send token error');
  //     },
  //   }
  // );

  //============================================Unity相关=======================================================

  const hideFullScreenButton = '';
  const buildUrl = 'unity_webgl_player/Build';
  const loaderUrl = buildUrl + '/web.loader.js';
  const config = {
    dataUrl: buildUrl + '/web.data',
    frameworkUrl: buildUrl + '/web.framework.js',
    codeUrl: buildUrl + '/web.wasm',
    streamingAssetsUrl: 'StreamingAssets',
    companyName: 'DefaultCompany',
    productName: 'Bitmap',
    productVersion: '0.1',
  };

  interface createUnityInstanceFunction {
    (canvas: HTMLElement, config: any, onProgress: (progress: number) => void): Promise<any>;
  }

  useEffect(() => {
    // 在组件加载完成后自动执行的函数
    console.log('组件加载完成');
    const container = document.querySelector('#unity-container') as HTMLElement;
    const canvas = document.querySelector('#unity-canvas') as HTMLElement;
    const loadingCover = document.querySelector('#loading-cover') as HTMLElement;
    // const progressBarEmpty = document.querySelector('#unity-progress-bar-empty') as HTMLElement;
    // const progressBarFull = document.querySelector('#unity-progress-bar-full') as HTMLElement;
    // const fullscreenButton = document.querySelector('#unity-fullscreen-button') as HTMLElement;
    // const spinner = document.querySelector('.spinner');

    const script = document.createElement('script');

    // const googleScript = document.createElement('script');
    // googleScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-87CMZBWYNC';
    // googleScript.onload = () => {
    //   console.log('google script load success');
    //   (window as any).dataLayer = (window as any).dataLayer || [];
    //   function gtag(...args: any[]) {
    //     (window as any).dataLayer.push(args);
    //   }
    //   gtag('js', new Date());
    //   gtag('config', 'G-87CMZBWYNC');
    // };
    // document.body.appendChild(googleScript);

    script.src = loaderUrl;
    script.onload = () => {
      console.log('script load success');
      loadingCover.style.display = 'flex';
      const createUnityInstanceFn: createUnityInstanceFunction = (window as any).createUnityInstance;
      createUnityInstanceFn(canvas, config, (progress) => {
        console.log('progress:', progress);
        // progressBarEmpty.style.display = '';
        // progressBarFull.style.width = `${100 * progress}%`;
      })
        .then((unityInstance) => {
          loadingCover.style.display = 'none';
          console.log('unityInstance', unityInstance);
          // unityInstance.SetFullscreen(1);//这个函数会报错
          (canvas as HTMLElement).style.width = '100vw';
          (canvas as HTMLElement).style.height = '100vh';
        })
        .catch((message) => {
          console.error(message);
        });
    };
    document.body.appendChild(script);
  }, []); // 传递一个空数组作为依赖，确保只在组件加载完成时执行一次

  // const injectGA = () => {
  //   if (typeof window == 'undefined') {
  //     return;
  //   }
  //   (window as any).dataLayer = (window as any).dataLayer || [];
  //   function gtag(...args: any[]) {
  //     (window as any).dataLayer.push(args);
  //   }
  //   gtag('js', new Date());
  //   gtag('config', 'G-87CMZBWYNC');
  //   return <div>Google Analytics injected!</div>;
  // };

  return (
    <div>
      <div id="unity-container" className="unity-desktop">
        <canvas id="unity-canvas"></canvas>
      </div>
      <div id="loading-cover" style={{ display: 'flex' }}>
        <div id="unity-loading-bar">
          <div id="unity-logo">
            <Image src={logo} alt="" />
          </div>
          <div className="loading-text" style={{ color: 'white' }}>
            Entering BitmapWar Explorer...
          </div>
          {/*<div id="unity-progress-bar-empty" style={{ display: 'none' }}>*/}
          {/*  <div id="unity-progress-bar-full"></div>*/}
          {/*</div>*/}
          <div className="spinner"></div>
        </div>
      </div>
      {/*<script async src="https://www.googletagmanager.com/gtag/js?id=87CMZBWYNC" />*/}
      {/*<script>{injectGA()}</script>*/}
      <GoogleAnalytics gaId="G-87CMZBWYNC" />
    </div>
    // <div className="container mx-auto flex h-full flex-col items-center gap-6 overflow-auto py-10">
    //   <Image src={particleLogo} alt="" className=""></Image>
    //   <div className="flex items-center gap-3 text-2xl font-bold">
    //     <Image src={bitcoinIcon} alt="" className="inline h-10 w-10 rounded-full"></Image>
    //     BTC Connect
    //   </div>
    //
    //   <div className=" -skew-x-6">The First Account Abstraction Protocol on Bitcoin</div>
    //
    //   <div className="absolute right-4 top-4">
    //     {accounts.length === 0 && (
    //       <Button color="primary" onClick={openConnectModal}>
    //         Connect
    //       </Button>
    //     )}
    //     {accounts.length !== 0 && (
    //       <Button color="primary" onClick={disconnect}>
    //         Disconnect
    //       </Button>
    //     )}
    //   </div>
    //
    //   {accounts.length === 0 && (
    //     <>
    //       <Divider></Divider>
    //       <div className="mt-6 flex gap-8">
    //         {connectors.map((connector) => {
    //           return (
    //             connector.isReady() && (
    //               <Image
    //                 key={connector.metadata.id}
    //                 src={connector.metadata.icon}
    //                 alt={connector.metadata.name}
    //                 width={50}
    //                 height={50}
    //                 className="cursor-pointer rounded-lg"
    //                 onClick={() => connect(connector.metadata.id)}
    //               ></Image>
    //             )
    //           );
    //         })}
    //       </div>
    //     </>
    //   )}
    //
    //   <div className="mt-12 flex h-auto w-[40rem] max-w-full flex-col gap-4 rounded-lg p-4 shadow-md">
    //     <div className="mb-4 text-2xl font-bold">Bitcoin</div>
    //
    //     <div className="overflow-hidden text-ellipsis whitespace-nowrap">Addresses: {accounts.join(', ')}</div>
    //
    //     <Button color="primary" onClick={onGetNetwork}>
    //       Get Network
    //     </Button>
    //
    //     <Button color="primary" onClick={onSwitchNetwork}>
    //       Change Network
    //     </Button>
    //
    //     <Button color="primary" onClick={onGetPubkey}>
    //       Get Pubkey
    //     </Button>
    //
    //     <Divider />
    //     <Input label="Message" value={message} onValueChange={setMessage}></Input>
    //     <Button color="primary" onClick={onSignMessage}>
    //       Sign Message
    //     </Button>
    //
    //     <Divider />
    //     <Input label="Address" value={address} onValueChange={setAddress}></Input>
    //     <Input label="Satoshis" value={satoshis} onValueChange={setSatoshis} inputMode="numeric"></Input>
    //     <Button color="primary" onClick={onSendBitcoin}>
    //       Send Bitcoin
    //     </Button>
    //
    //     {accounts.length !== 0 && (
    //       <div className="flex flex-col gap-4">
    //         <Divider></Divider>
    //         <Input
    //           label="Receiver Address"
    //           value={inscriptionReceiverAddress}
    //           onValueChange={setInscriptionReceiverAddress}
    //         ></Input>
    //         <Input label="Inscription ID" value={inscriptionId} onValueChange={setInscriptionId}></Input>
    //         <Button color="primary" onClick={onSendInscription}>
    //           Send Inscription
    //         </Button>
    //       </div>
    //     )}
    //   </div>
    //
    //   <div className="mt-20 flex h-auto w-[40rem] max-w-full flex-col gap-4 rounded-lg p-4 shadow-md">
    //     <div className="mb-4 text-2xl font-bold">EVM</div>
    //
    //     <div className="overflow-hidden text-ellipsis whitespace-nowrap">Address: {evmAccount}</div>
    //     <div className="overflow-hidden text-ellipsis whitespace-nowrap">ChainId: {chainId}</div>
    //     <Select
    //       label="Switch Chain"
    //       size="sm"
    //       selectedKeys={chainId ? [chainId?.toString()] : []}
    //       onChange={onSwitchChain}
    //       isRequired
    //     >
    //       {accountContracts.BTC[0].chainIds.map((chainId) => {
    //         const chain = chains.getEVMChainInfoById(chainId)!;
    //         return (
    //           <SelectItem key={chain.id} value={chain.id}>
    //             {chain.fullname}
    //           </SelectItem>
    //         );
    //       })}
    //     </Select>
    //
    //     <div className="felx w-full items-center">
    //       <Button color="primary" onClick={onSendNativeToken} isLoading={sendTokenLoading} className="px-10">
    //         Send Native Token
    //       </Button>
    //       <Checkbox className="ml-4 flex-none" isSelected={gasless} onValueChange={setGasless}>
    //         Gasless
    //       </Checkbox>
    //     </div>
    //   </div>
    //
    //   {/* <Link href="/others">Others</Link> */}
    // </div>
  );
}
