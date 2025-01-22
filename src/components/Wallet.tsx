import { TransactionService } from '@/service/transaction.service';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';

export default function Wallet() {
    const { publicKey, sendTransaction } = useWallet();
    const [signature, setSignature] = React.useState<string | null>(null);
    const [amount, setAmount] = useState(0);
    const { connection } = useConnection();

    const OnClick = async () => {
        if(!publicKey) return;

        try{
            const x = await TransactionService.ClaimTokenTransaction(publicKey, amount)
            const transaction = Transaction.from(Buffer.from(x, 'base64'));
            const signature = await sendTransaction(transaction, connection);
            setSignature(signature)
        }catch(err){
            console.log(err); 
        }
    };

    useEffect(() => {
        setAmount(Math.floor(Math.random() * 10) + 1);
    }, [])

    return (
        <div className='flex flex-col justify-center items-center gap-3'>
            {publicKey &&
                <>
                <span>You&apos;re Eligible for ChuckieLel Token</span>
                <span>Total Allocation: {amount} Tokens</span>
                <button 
                    onClick={OnClick} disabled={!publicKey} 
                    className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white p-2 rounded-md"
                >
                    Claim Token
                </button>

                <div className='flex flex-col gap-2 items-center'>
                    <span>Tx Signature:</span>
                    {signature &&
                        <span>https://explorer.solana.com/tx/{signature}?cluster=devnet</span>
                    }
                </div>
                </>
            }
        </div>
    );
};