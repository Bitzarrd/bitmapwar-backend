'use client';
import './App.css';


import {
    ConnectProvider as BTCConnectProvider,
    OKXConnector,
    UnisatConnector,
} from '@particle-network/btc-connectkit';

  function ConnectProvider({ children }: { children: React.ReactNode }) {
    return (
        <BTCConnectProvider
            options={{
                projectId: 'xxxx',
                clientKey: 'xxxx',
                appId: 'xxxx',
                aaOptions: {
                    accountContracts: {
                        BTC: [
                            {
                                chainIds: [686868, 28206, 80001],
                                version: '1.0.0',
                            },
                        ],
                    },
                },
                walletOptions: { // optional: wallet options
                    visible: true,
                }
            }}
            connectors={[new UnisatConnector(), new OKXConnector()]}
        >
            {children}
        </BTCConnectProvider>
    );
}


function App() {
    return (
        <ConnectProvider>
            <div>app</div>
        </ConnectProvider>
    );
}

export default App;
