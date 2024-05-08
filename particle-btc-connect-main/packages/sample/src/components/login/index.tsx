'use client';

import {
  // UnisatConnector,
  useAccounts,
  useBTCProvider,
  useConnectModal,
  useConnector,
  useETHProvider,
} from '@particle-network/btc-connectkit';
import {useEffect, useState} from 'react';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure} from "@nextui-org/react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from "@nextui-org/react";
import {Input} from "@nextui-org/react";
import {Tooltip} from "@nextui-org/tooltip";

import {toast} from 'react-toastify';
// import {bgBlack} from "next/dist/lib/picocolors";
// import { useLocation } from 'react-router-dom';
import '../../styles/login.css';

export default function Login() {
  const {openConnectModal, disconnect} = useConnectModal();
  const {accounts} = useAccounts();
  const {evmAccount, chainId, switchChain, publicClient, getFeeQuotes, sendUserOp} = useETHProvider();
  // const location = useLocation();

  const {provider, getNetwork, switchNetwork, signMessage, getPublicKey, sendBitcoin, sendInscription} =
    useBTCProvider();
  // const [gasless, setGasless] = useState<boolean>(false);
  // const [inscriptionReceiverAddress, setInscriptionReceiverAddress] = useState<string>();
  // const [inscriptionId, setInscriptionId] = useState<string>();
  const [message, setMessage] = useState<string>('Login For Bitmapwar!');
  // const [address, setAddress] = useState<string>();
  // const [satoshis, setSatoshis] = useState<string>('1');
  const {connectors, connect} = useConnector();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

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
      let wsUrl = '';
      if (window.location.hostname === 'dev.bitmapwar.com') {
        wsUrl = 'wss://dev-server.bitmapwar.com/api';
      } else if (window.location.hostname === 'bitmapwar.com' || window.location.hostname === 'www.bitmapwar.com') {
        wsUrl = 'wss://server.bitmapwar.com/api';
      } else if (window.location.hostname === 'localhost') {
        wsUrl = 'ws://localhost:3000/api';
      } else if (window.location.hostname === 'unity.bitmapwar.com') {
        wsUrl = 'wss://test.bitmapwar.com/api';
      }
      console.log('wsUrl', wsUrl);
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
    if (code_) {
      setCode(code_);
    }
  }, []);


  const rows = [
    {
      key: "1",
      name: "Tony Reichert",
      role: "CEO",
      status: "Active",
    },
    {
      key: "2",
      name: "Zoey Lang",
      role: "Technical Lead",
      status: "Paused",
    },
    {
      key: "3",
      name: "Jane Fisher",
      role: "Senior Developer",
      status: "Active",
    },
    {
      key: "4",
      name: "William Howard",
      role: "Community Manager",
      status: "Vacation",
    },
  ];

  const columns = [
    {
      key: "name",
      label: "NAME",
    },
    {
      key: "role",
      label: "ROLE",
    },
    {
      key: "status",
      label: "STATUS",
    },
  ];


  return (
    <div className="bgBlack dark">
      {/*<Button color="primary" onClick={onGetNetwork}>*/}
      {/*  Get Network*/}
      {/*</Button>*/}
      {accounts.length === 0 && (

        <div className="btnBox">
          <div className="code-123456">
            CODE: {code}
          </div>

          <Button color="warning" size="lg" onClick={openConnectModal} className="btn" style={{marginTop: "100px"}}>
            Connect Wallet
          </Button>
        </div>
      )}

      <br/>
      {accounts.length !== 0 && (
        <Button color="primary" onClick={disconnect}>
          Disconnect
        </Button>
      )}
      <br/>
      <Button color="primary" onClick={onGetPubkey}>
        Get Pubkey
      </Button>
      <Button onPress={onOpen}>Purchase Soldier</Button>

      <br/>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="dark" size="5xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Purchase</ModalHeader>
              <ModalBody>
                <Button color="warning" variant="flat">
                  Please do not close the browser or fresh the page during the recharge process.
                  <br/>
                  If you encounter any issues, please contact our customer service.
                </Button>
                <Tooltip content="1BTC = 0.04">
                <Input
                  type="number"
                  label="Price"
                  placeholder="0.00"
                  labelPlacement="outside"
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                />
                </Tooltip>
                <Table aria-label="Example table with dynamic content" isStriped>
                  <TableHeader columns={columns}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                  </TableHeader>
                  <TableBody items={rows}>
                    {(item) => (
                      <TableRow key={item.key}>
                        {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
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
