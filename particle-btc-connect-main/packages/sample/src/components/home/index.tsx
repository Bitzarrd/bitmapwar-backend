'use client';

// import bitcoinIcon from '@/assets/bitcoin.png';
// import particleLogo from '@/assets/particle-logo.svg';
import { accountContracts } from '@/config';
// import { Button, Checkbox, Divider, Input, Select, SelectItem } from '@nextui-org/react';
import logo from '@/assets/logo.gif';
import {
  useAccountContract,
  useAccounts,
  useBTCProvider,
  useConnectModal,
  useConnector,
  useETHProvider,
  type BaseConnector,
} from '@particle-network/btc-connectkit';
import { chains, MerlinTestnet } from '@particle-network/chains';
import { useRequest } from 'ahooks';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { parseEther, Contract, AbiCoder } from 'ethers';
import BitMapWarAbi from './bitmapwar_abi.json';
import { GoogleAnalytics } from '@next/third-parties/google';
import type { Hex } from 'viem';

export default function Home() {
  const { openConnectModal, disconnect } = useConnectModal();
  const { accounts } = useAccounts();
  const { evmAccount, chainId, switchChain, publicClient, getFeeQuotes, sendUserOp } = useETHProvider();
  const { provider, getNetwork, switchNetwork, signMessage, getPublicKey, sendBitcoin, sendInscription } =
    useBTCProvider();
  // const [gasless, setGasless] = useState<boolean>(false);
  // const [inscriptionReceiverAddress, setInscriptionReceiverAddress] = useState<string>();
  // const [inscriptionId, setInscriptionId] = useState<string>();
  const [message, setMessage] = useState<string>('Login For Bitmapwar!');
  // const [address, setAddress] = useState<string>();
  // const [satoshis, setSatoshis] = useState<string>('1');
  const { connectors, connect } = useConnector();

  const bitmapwarContractAddress = {
    686868: '0xBdC382D517b348315d3C836C4c5084ca293c329a',
    4200: '0x8ceE7810FE3Ce02cc3b633e7eDf0e17B85c21a5C',
  };
  const [forceHideModal, setForceHideModal] = useState<boolean>(false);

  if (typeof window !== 'undefined') {
    (window as any).getPublicKey = async (id: string) => {
      for (const connector in connectors) {
        if (connectors[connector].metadata.id === id) {
          return await connectors[connector].getPublicKey();
        }
      }
    };
    (window as any).accounts = accounts;
    (window as any).evmAccount = evmAccount;
    (window as any).chainId = chainId;
    (window as any).connectors = connectors;
    (window as any).connect = async (name: string) => {
      const domain = window.location.hostname;
      accountContracts.BTC[0].chainIds.map((chainId) => {
        const chain = chains.getEVMChainInfoById(chainId)!;
        console.log('chain', chain.name);
      });
      if (domain === 'www.bitmapwar.com' || domain === 'bitmapwar.com') {
        await switchChain(4200);
      } else {
        await switchChain(MerlinTestnet.id);
      }
      // await switchChain(4200);
      console.log('chainId', chainId);
      await connect(name);
      const publicKey = await (window as any).getPublicKey(name);
      const timestamp = Math.floor(Date.now() / 1000); // 获取当前时间戳（单位：秒）
      const message = 'Login For Bitmapwar!' + timestamp;
      const sig = await signMessage(message);
      return await new Promise((resolve) => {
        const interval = setInterval(() => {
          if ((window as any).evmAccount !== undefined && (window as any).accounts !== undefined) {
            clearInterval(interval);
            resolve({
              btcAddress: (window as any).accounts[0],
              merlinAddress: (window as any).evmAccount,
              publicKey: publicKey,
              message: message,
              sig: sig,
            });
          }
        }, 50);
      });
    };
    (window as any).disconnect = disconnect;
    (window as any).switchNetwork = switchNetwork;
    (window as any).switchChain = switchChain;
    (window as any).contractCall = async () => {
      const tx = {
        to: '0x50CE6428D8aCA4ce02c1701E492A43C8E35a1bc5',
        data: '0x6057361d000000000000000000000000000000000000000000000000000000000000002a',
      };
      console.log('tx', tx);
      const feeQuotes = await getFeeQuotes(tx);
      console.log('feeQuotes', feeQuotes);
      const { userOp, userOpHash } = feeQuotes.verifyingPaymasterNative;
      const hash = await sendUserOp({ userOp, userOpHash }, forceHideModal);
      console.log('hash', hash);
      return hash;
    };
    (window as any).purchase = async (virus: number) => {
      if (!chainId) {
        return;
      }
      let contractAddress = null;
      if (chainId == 4200) {
        contractAddress = bitmapwarContractAddress['4200'];
      }
      if (chainId == 686868) {
        contractAddress = bitmapwarContractAddress['686868'];
      }
      if (!contractAddress) {
        return;
      }
      const price = parseEther('0.00003') as bigint;
      const fee = price * BigInt(virus);
      console.log('fee', fee.toString());
      const contract = new Contract(contractAddress, BitMapWarAbi) as any;
      const transaction = await contract.buySoldier.populateTransaction();
      console.log('transaction', transaction);
      const tx = {
        to: contractAddress,
        data: transaction.data,
        value: fee.toString(),
      };
      console.log('tx', tx);
      const feeQuotes = await getFeeQuotes(tx);
      console.log('feeQuotes', feeQuotes);
      const { userOp, userOpHash } = feeQuotes.verifyingPaymasterNative;
      const hash = await sendUserOp({ userOp, userOpHash }, forceHideModal);
      console.log('hash', hash);
      return hash;
    };
    (window as any).extractProfit = async (amount: string, signature: string, nonce: number, to: string) => {
      console.log('BitMapWarAbi', BitMapWarAbi);
      if (!chainId) {
        return;
      }
      let contractAddress = null;
      if (chainId == 4200) {
        contractAddress = bitmapwarContractAddress['4200'];
      }
      if (chainId == 686868) {
        contractAddress = bitmapwarContractAddress['686868'];
      }
      if (!contractAddress) {
        return;
      }
      const contract = new Contract(to, BitMapWarAbi) as any;
      const transaction = await contract.withdrawETHWithSignature.populateTransaction(amount, signature, nonce, to);
      console.log('transaction', transaction);
      const tx = {
        to: contractAddress,
        data: transaction.data,
      };
      console.log('tx', tx);
      const feeQuotes = await getFeeQuotes(tx);
      console.log('feeQuotes', feeQuotes);
      const { userOp, userOpHash } = feeQuotes.verifyingPaymasterNative;
      const hash = await sendUserOp({ userOp, userOpHash }, forceHideModal);
      console.log('hash', hash);
      return hash;
    };
    (window as any).rentMap = async (mapId: number, day: number) => {
      console.log('rentMap', mapId, day);
      if (!chainId) {
        return;
      }
      let contractAddress = null;
      if (chainId == 4200) {
        contractAddress = bitmapwarContractAddress['4200'];
      }
      if (chainId == 686868) {
        contractAddress = bitmapwarContractAddress['686868'];
      }
      if (!contractAddress) {
        return;
      }
      const contract = new Contract(contractAddress, BitMapWarAbi) as any;
      const transaction = await contract.rentMap.populateTransaction(mapId, day);
      console.log('transaction', transaction);
      let price = parseEther('0') as bigint;
      switch (day) {
        case 7:
          price = parseEther('0.0004') as bigint;
          break;
        case 15:
          price = parseEther('0.0006') as bigint;
          break;
        case 30:
          price = parseEther('0.001') as bigint;
          break;
      }
      const tx = {
        to: contractAddress,
        data: transaction.data,
        value: price.toString(),
      };
      console.log('tx', tx);
      const feeQuotes = await getFeeQuotes(tx);
      console.log('feeQuotes', feeQuotes);
      const { userOp, userOpHash } = feeQuotes.verifyingPaymasterNative;
      console.log('userOp', userOp);
      const hash = await sendUserOp({ userOp, userOpHash }, forceHideModal);
      console.log('hash', hash);
      return hash;
    };
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
    (window as any).getBalance = async () => {
      if (!publicClient) {
        return '0';
      }
      const balance = await publicClient.getBalance({ address: evmAccount as Hex });
      return balance.toString();
      // const balance = await smartAccount.provider.request({
      //   method: 'eth_getBalance',
      //   params: [await smartAccount.getAddress(), 'latest'],
      // });
      // return BigInt(balance).toString();
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

  interface createUnityInstanceFunction {
    (canvas: HTMLElement, config: any, onProgress: (progress: number) => void): Promise<any>;
  }

  const [gitRev, setGitRev] = useState('');

  useEffect(() => {
    const domain = window.location.hostname;
    console.log('domain', domain);
    // if (domain === 'www.bitmapwar.com' || domain === 'bitmapwar.com') {
    //   switchChain(4200);
    // } else {
    //   switchChain(686868);
    // }

    // 在组件加载完成后自动执行的函数
    console.log('组件加载完成');
    const container = document.querySelector('#unity-container') as HTMLElement;
    const canvas = document.querySelector('#unity-canvas') as HTMLElement;
    const loadingCover = document.querySelector('#loading-cover') as HTMLElement;
    const progressBarEmpty = document.querySelector('#unity-progress-bar-empty') as HTMLElement;
    const progressBarFull = document.querySelector('#unity-progress-bar-full') as HTMLElement;
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

    const gitRevisionScript = document.createElement('script');
    const nowTimestamp = new Date().getTime();
    gitRevisionScript.src = 'static/rev.js?' + nowTimestamp.toString();
    gitRevisionScript.onload = () => {
      const gitReva = (window as any).gitRev;
      setGitRev(gitReva);
      console.log('git revision script load success:' + gitReva);

      const hideFullScreenButton = '';
      const buildUrl = '/static/' + gitReva;
      // const buildUrl = '/unity_webgl_player/6d4e2b9';
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

      script.src = loaderUrl;
      script.onload = () => {
        // return;
        console.log('script load success');
        loadingCover.style.display = 'flex';
        const createUnityInstanceFn: createUnityInstanceFunction = (window as any).createUnityInstance;
        createUnityInstanceFn(canvas, config, (progress) => {
          console.log('progress:', progress);
          progressBarEmpty.style.display = 'block';
          progressBarFull.style.width = `${100 * progress}%`;
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
    };
    document.body.appendChild(gitRevisionScript);
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
            <br />
            git revision: {gitRev}
          </div>
          <div id="unity-progress-bar-empty" style={{ display: 'none' }}>
            <div id="unity-progress-bar-full"></div>
          </div>
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
