'use client';

import {
  // UnisatConnector,
  useAccounts,
  useBTCProvider,
  useConnectModal,
  useConnector,
  useETHProvider,
} from '@particle-network/btc-connectkit';
import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Chip,
} from '@nextui-org/react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from '@nextui-org/react';
import { Input, Spinner } from '@nextui-org/react';
import { Tooltip } from '@nextui-org/tooltip';
import { Select, SelectItem } from '@nextui-org/react';

import { toast } from 'react-toastify';
// import {bgBlack} from "next/dist/lib/picocolors";
// import { useLocation } from 'react-router-dom';
import '../../styles/login.css';
import BitMapWarAbi from './bitmapwar_abi.json';
import { Contract, parseEther, formatEther } from 'ethers';
import axios from 'axios';
import Image from 'next/image';
import logo from '../../assets/login/logo.png';
import { MerlinTestnet } from '@particle-network/chains';

export default function Login() {
  const days = [
    {
      label: '7 Days',
      value: 7,
    },
    {
      label: '15 Days',
      value: 15,
    },
    {
      label: '30 Days',
      value: 30,
    },
  ];

  const { openConnectModal, disconnect } = useConnectModal();
  const { accounts } = useAccounts();
  const { evmAccount, chainId, switchChain, publicClient, getFeeQuotes, sendUserOp } = useETHProvider();
  // const location = useLocation();

  const { provider, getNetwork, switchNetwork, signMessage, getPublicKey, sendBitcoin, sendInscription } =
    useBTCProvider();
  // const [gasless, setGasless] = useState<boolean>(false);
  // const [inscriptionReceiverAddress, setInscriptionReceiverAddress] = useState<string>();
  // const [inscriptionId, setInscriptionId] = useState<string>();
  const [message, setMessage] = useState<string>('Login For Bitmapwar!');
  // const [address, setAddress] = useState<string>();
  // const [satoshis, setSatoshis] = useState<string>('1');
  const { connectors, connect } = useConnector();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpenExtract, onOpen: onOpenExtract, onOpenChange: onOpenChangeExtract } = useDisclosure();
  const { isOpen: isOpenRent, onOpen: onOpenRent, onOpenChange: onOpenChangeRent } = useDisclosure();
  const [forceHideModal, setForceHideModal] = useState<boolean>(false);

  let wsUrl = '';
  let httpUrl = '';

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'dev.bitmapwar.com') {
      wsUrl = 'wss://dev-server.bitmapwar.com';
      httpUrl = 'https://dev-server.bitmapwar.com';
    } else if (window.location.hostname === 'bitmapwar.com' || window.location.hostname === 'www.bitmapwar.com') {
      wsUrl = 'wss://server.bitmapwar.com/api';
      httpUrl = 'https://server.bitmapwar.com';
    } else if (window.location.hostname === 'localhost') {
      wsUrl = 'ws://localhost:3000/api';
      httpUrl = 'http://localhost:3000';
    } else if (window.location.hostname === 'unity.bitmapwar.com') {
      wsUrl = 'wss://test.bitmapwar.com/api';
      httpUrl = 'https://test.bitmapwar.com';
    }
    console.log('wsUrl', wsUrl);
    const domain = window.location.hostname;
    if (domain === 'www.bitmapwar.com' || domain === 'bitmapwar.com') {
      switchChain(4200);
    } else {
      switchChain(MerlinTestnet.id);
    }
  }

  const bitmapwarContractAddress = {
    686868: '0x06BF9cD02ae449c0CC1c77F5d22B7B6E2D0f64ec',
    4200: '0x1F8C06CFF96Cdc230b5660343af39889828e16EB',
  };

  const refreshPurchase = async (pubkey: string) => {
    setIsLoading(true);
    const resp = await axios.post(httpUrl + '/GetPurchaseLog', {
      pubkey: pubkey,
      code: code,
    });
    console.log('resp', resp.data.data.purchase_log);
    setRows(resp.data.data.purchase_log);
    setIsLoading(false);
  };
  const onOpenPurchaseModal = async () => {
    onOpen();
    const pubkey = await getPublicKey();
    await refreshPurchase(pubkey);
  };

  const [profit, setProfit] = useState('0');
  const refreshExtract = async (publicKey: string) => {
    setIsLoading(true);
    const resp = await axios.post(httpUrl + '/GetExtractLog', {
      pubkey: publicKey,
      code: code,
    });
    console.log('resp', resp.data.data.extract_log);
    setRows(resp.data.data.extract_log);
    setProfit(resp.data.data.profit);
    setIsLoading(false);
  };
  const onOpenExtractProfitModal = async () => {
    onOpenExtract();
    const pubkey = await getPublicKey();
    await refreshExtract(pubkey);
  };

  const onConfirm = async () => {
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
    const fee = price * BigInt(soldierAmount);
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

    toast.warning('do not close the window, waiting for the transaction to be confirmed');

    await axios.get(httpUrl + '/Purchase?txid=' + hash + '&code=' + code);
    toast.success('Purchase success!');
  };

  const [extractAmount, setExtractAmount] = useState('0');
  const [soldierAmount, setSoldierAmount] = useState('0');
  const onConfirmExtract = async () => {
    try {
      const pubKey = await getPublicKey();
      const timestamp = Math.floor(Date.now() / 1000); // 获取当前时间戳（单位：秒）
      const message = 'Extract Profit!' + timestamp;
      const sig = await signMessage(message);
      console.log('🚀 ~ onConfirmExtract ~ pubKey:', pubKey);
      console.log('🚀 ~ onConfirmExtract ~ sig:', sig);
      const resp = await axios.post(httpUrl + '/ExtractProfit', {
        pubkey: pubKey,
        sig: sig,
        amount: extractAmount,
        code: code,
        message: message,
      });
      console.log('🚀 ~ onConfirmExtract ~ resp:', resp.data);

      if (resp.data.code !== 0) {
        toast.error(resp.data.message);
        return;
      }

      const to = resp.data.data.extract_log.address;
      const amount = resp.data.data.extract_log.amount;
      const signature = resp.data.data.signature;
      const nonce = resp.data.data.nonce;

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
      // return hash;
      await refreshExtract(pubKey);

      toast.warning('do not close the window, waiting for the transaction to be confirmed');
      await axios.post(httpUrl + '/ExtractProfit', {
        txid: hash,
        pubKey: pubKey,
        amount: amount,
        code: code,
        id: nonce,
      });
      await refreshExtract(pubKey);

      toast.success('Extract Profit Success!');
      await refreshPurchase(pubKey);
    } catch (error: any) {
      if (typeof error === 'object' && error.data && error.data.extraMessage) {
        const { message } = error.data.extraMessage;
        console.log('retry error', message);
        toast.error(message);
      }
      if (typeof error === 'object' && error.message) {
        const { message } = error.message;
        console.log('retry error', message);
        toast.error(message);
      } else {
        const msg = error.toString();
        console.log('retry error', msg);
        toast.error(msg);
      }
      throw error;
    }
  };

  const [rentMapId, setRentMapId] = useState<string>('0');
  const [rentDays, setRentDays] = useState<number>(7);
  const onConfirmRent = async () => {
    console.log('rentMap', rentMapId, rentDays);

    try {
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
      const transaction = await contract.rentMap.populateTransaction(rentMapId, rentDays);
      console.log('transaction', transaction);
      let price = parseEther('0') as bigint;
      switch (rentDays) {
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
      // return hash;

      toast.warning('do not close the window, waiting for the transaction to be confirmed');
      const rentResp = await axios.post(httpUrl + '/BuyGoodsForRentMap', {
        txid: hash,
        mapId: rentMapId,
        code: code,
      });

      if (rentResp.data.code !== 0) {
        toast.error(rentResp.data.message);
        return;
      }

      toast.success('rent map success');
    } catch (error: any) {
      if (typeof error === 'object' && error.data && error.data.extraMessage) {
        const { message } = error.data.extraMessage;
        console.log('rent error', message);
        toast.error(message);
      }
      if (typeof error === 'object' && error.message) {
        const { message } = error.message;
        console.log('rent error', message);
        toast.error(message);
      } else {
        const msg = error.toString();
        console.log('rent error', msg);
        toast.error(msg);
      }
      throw error;
    }
  };

  const retry = useCallback(
    async function (row: any) {
      console.log('retry', row);

      try {
        const pubKey = await getPublicKey();
        console.log('retry', pubKey);

        const to = row.address;
        const amount = row.amount;
        const signature = row.signature;
        const nonce = row.id;

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
        // return hash;
        await refreshExtract(pubKey);

        toast.warning('do not close the window, waiting for the transaction to be confirmed');
        await axios.post(httpUrl + '/Extract', {
          txid: hash,
          pubKey: pubKey,
          amount: amount,
          code: code,
          id: nonce,
        });
        await refreshExtract(pubKey);

        toast.success('Extract Profit Success!');
        await refreshPurchase(pubKey);
      } catch (error: any) {
        if (typeof error === 'object' && error.data && error.data.extraMessage) {
          const { message } = error.data.extraMessage;
          console.log('retry error', message);
          toast.error(message);
        }
        if (typeof error === 'object' && error.message) {
          const message = error.message;
          console.log('retry error', message);
          toast.error(message);
        } else {
          const msg = error.toString();
          console.log('retry error', msg);
          toast.error(msg);
        }
        throw error;
      }
    },
    [chainId]
  );
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
      const timestamp = Math.floor(Date.now() / 1000); // 获取当前时间戳（单位：秒）
      const message = 'Login For Bitmapwar!' + timestamp;
      const sig = await signMessage(message);
      console.log('🚀 ~ onGetPubkey ~ pubKey:', pubKey);
      toast.success(pubKey);
      //创建websocket客户端

      const payload = JSON.stringify({
        method: 'LoginFromWeb',
        pubKey: pubKey,
        code: code,
        sig: sig,
        message: message,
      });
      console.log(payload);
      const ws = new WebSocket(wsUrl);
      //当客户端链接成功向客户端发送数据
      ws.onopen = () => {
        ws.send(payload);
      };
    } catch (error: any) {
      toast.error(error.message || 'get pubkey error');
    }
  };

  const [code, setCode] = useState<string>('');

  useEffect(() => {
    // 在组件挂载时更新 code 状态
    const searchParams = new URLSearchParams(location.search);
    const code_ = searchParams.get('code');
    const mapId = searchParams.get('mapId');
    const days = searchParams.get('days');
    if (code_) {
      setCode(code_);
    }
    if (mapId && days) {
      setRentMapId(mapId.toString());
      setRentDays(Number(days));
      onOpenRent();
    }
  }, []);

  const [rows, setRows] = useState([]);

  const columns = [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'txid',
      label: 'TXID',
    },
    {
      key: 'fee',
      label: 'Fee',
    },
    {
      key: 'virus',
      label: 'Soldier',
    },
    {
      key: 'create_time',
      label: 'Create Time',
    },
    {
      key: 'status',
      label: 'Status',
    },
  ];

  const columnsExtract = [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'txid',
      label: 'TXID',
    },
    {
      key: 'amount',
      label: 'Amount',
    },
    {
      key: 'create_time',
      label: 'Create Time',
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'action',
      label: 'Action',
    },
  ];

  const [isLoading, setIsLoading] = useState(true);

  // const statusColorMap = {'0':'warning', '1':'success', '2':'danger'};
  const statusName = ['Pending', 'Success', 'Failed'];

  const renderCell = useCallback(
    (row: string[], columnKey: any) => {
      const cellValue = row[columnKey];
      // console.log('columnKey', columnKey);
      switch (columnKey) {
        case 'fee':
          if (cellValue === null || cellValue === undefined) {
            return '0 BTC';
          }
          return formatEther(cellValue) + ' BTC';
        case 'amount':
          // console.log('cellValue', cellValue);
          if (cellValue === null || cellValue === undefined) {
            return '0 BTC';
          }
          return formatEther(cellValue) + ' BTC';
        case 'create_time':
          return new Date(Number(cellValue) * 1000).toLocaleString();
        case 'status':
          // const color  =
          return (
            <Chip className="capitalize" color={'success'} size="sm" variant="flat">
              {statusName[Number(cellValue)]}
            </Chip>
          );
        case 'action':
          // @ts-ignore
          if (row['status'] == 0) {
            return (
              <Button size="sm" onPress={() => retry(row)}>
                Retry
              </Button>
            );
          }
          return <></>;
        default:
          return cellValue;
      }
    },
    [chainId]
  );

  return (
    <div className="bgBlack dark">
      {/*<Button color="primary" onClick={onGetNetwork}>*/}
      {/*  Get Network*/}
      {/*</Button>*/}

      <div className="logo">
        <Image src={logo} alt="logo" />
      </div>

      {!code && (
        <div className="btnBox codeBox">
          <Button color="danger" variant="flat">
            Need Code!
          </Button>
        </div>
      )}

      {code && accounts.length === 0 && (
        <div className="btnBox codeBox">
          <div className="code-123456" style={{ backgroundImage: 'url(code_bg.png)', backgroundSize: '100% 46px' }}>
            CODE: {code}
          </div>
          <br /> <br />
          <Button color="warning" size="lg" onClick={openConnectModal} className="btn">
            Connect Wallet
          </Button>
        </div>
      )}

      {code && accounts.length !== 0 && (
        <div className="btnBox">
          <br />
          <br />
          <div className="address" style={{ backgroundImage: 'url(ID_bg.png)' }}>
            {accounts}
          </div>
          <br />
          <br />
          <Button color="primary" onClick={disconnect} size="lg" className="btn">
            Disconnect Wallet
          </Button>
          <br />
          <br />
          <Button color="primary" onClick={onGetPubkey} size="lg" className="btn">
            Enter Game
          </Button>
          <br />
          <br />
          <Button onPress={onOpenPurchaseModal} size="lg" className="btn">
            Purchase Soldier
          </Button>
          <br />
          <br />
          <Button onPress={onOpenExtractProfitModal} size="lg" className="btn">
            Extract Profit
          </Button>
          {/*<br />*/}
          {/*<br />*/}
          {/*<Button onPress={onOpenRent} size="lg" className="btn">*/}
          {/*  Rent Map*/}
          {/*</Button>*/}
        </div>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark" size="5xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Purchase</ModalHeader>
              <ModalBody>
                <Button color="warning" variant="flat">
                  Please do not close the browser or fresh the page during the recharge process.
                  <br />
                  If you encounter any issues, please contact our customer service.
                </Button>
                <Tooltip content="1 Soilder = 0.00003 BTC">
                  <Input
                    type="number"
                    label="Enter amount"
                    placeholder="0"
                    step="1"
                    onChange={(event) => setSoldierAmount(event.target.value)}
                    // labelPlacement="outside"
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">Soldier</span>
                      </div>
                    }
                  />
                </Tooltip>
                <Table aria-label="Example table with dynamic content" selectionMode="single">
                  <TableHeader columns={columns}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                  </TableHeader>
                  <TableBody items={rows} isLoading={isLoading} loadingContent={<Spinner label="Loading..." />}>
                    {(item: any) => (
                      // <TableRow key={item.key}>
                      //   {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                      // </TableRow>
                      <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onConfirm}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenExtract} onOpenChange={onOpenChangeExtract} className="dark" size="5xl">
        <ModalContent>
          {(onCloseExtract) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Extract Profit</ModalHeader>
              <ModalBody>
                <Button color="warning" variant="flat">
                  Please do not close the browser or fresh the page during the recharge process.
                  <br />
                  If you encounter any issues, please contact our customer service.
                </Button>
                <Input
                  type="number"
                  label="Your profit:"
                  placeholder={formatEther(profit).toString()}
                  disabled={true}
                  // labelPlacement="outside"
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">BTC</span>
                    </div>
                  }
                />
                <Input
                  type="number"
                  label="Enter amount"
                  placeholder="0.00"
                  step="0.0000000000001"
                  // labelPlacement="outside"
                  onChange={(event) => setExtractAmount(event.target.value)}
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">BTC</span>
                    </div>
                  }
                />
                <Table aria-label="Example table with dynamic content" selectionMode="single">
                  <TableHeader columns={columnsExtract}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                  </TableHeader>
                  <TableBody items={rows} isLoading={isLoading} loadingContent={<Spinner label="Loading..." />}>
                    {(item: any) => (
                      <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onCloseExtract}>
                  Close
                </Button>
                <Button color="primary" onPress={onConfirmExtract}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal isOpen={isOpenRent} onOpenChange={onOpenChangeRent} className="dark" size="2xl">
        <ModalContent>
          {(onCloseRent) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Leasehold</ModalHeader>
              <ModalBody>
                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                  <Input type="email" label="Map ID" value={rentMapId} disabled />
                </div>
                <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                  <Input type="days" label="Days" value={rentDays.toString()} disabled />
                  {/*<Select*/}
                  {/*  label="Select an animal"*/}
                  {/*  className="max-w-xs"*/}
                  {/*>*/}
                  {/*  {days.map((day) => (*/}
                  {/*    <SelectItem key={day.value} value={day.value}>*/}
                  {/*      {day.label}*/}
                  {/*    </SelectItem>*/}
                  {/*  ))}*/}
                  {/*</Select>*/}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onCloseRent}>
                  Close
                </Button>
                <Button color="primary" onPress={onConfirmRent}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
