import {JsonRpcProvider, Contract} from "ethers";


async function convertCallToTransaction() {
    // 连接到以太坊网络
    const provider = new JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

    // 智能合约地址和 ABI
    const contractAddress = '0x192c9ac0e888f9BD9Ba4BbB63f14E9B78d691c7C';
    const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "num",
                    "type": "uint256"
                }
            ],
            "name": "store",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "retrieve",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    // 要调用的智能合约函数和参数
    const contractArgs = [42];

    // 创建智能合约实例
    const contract = new Contract(contractAddress, contractABI);

    // 调用智能合约函数，获取交易对象
    // const transaction = await contract.populateTransaction[contractFunction](...contractArgs);

    const transaction = await contract.store.populateTransaction(...contractArgs)


    // 提供适当的 gas 限制和 gas 价格

    // 将交易对象转换为原始交易
    const rawTransaction = {
        to: contractAddress,
        data: transaction.data,
    };

    console.log('Raw Transaction:', rawTransaction);
}

convertCallToTransaction();
