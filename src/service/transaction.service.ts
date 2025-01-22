import { 
    // Connection, 
    PublicKey, 
    // clusterApiUrl,
} from '@solana/web3.js';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
// import { getAccount, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, TokenAccountNotFoundError } from '@solana/spl-token';
// import bs58 from 'bs58';
// import { Keypair } from '@solana/web3.js';

// type SignTransac = (<T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>) | undefined;

type UseTransaction = (
    publicKey: PublicKey | null, 
    amount: number
) => Promise<string>;

type TransacResponse = {
    data: string;
    message: string;
}

export class TransactionService {
    static ClaimTokenTransaction: UseTransaction = async (publicKey, amount) => {
        if (!publicKey) throw new WalletNotConnectedError();
        
        try {
            const response = await fetch('/api/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ publicKey: publicKey.toBase58(), amount: amount }),
            });

            const data : TransacResponse = await response.json();

            console.log(data)

            return data.data;
        } catch (error) {
            console.error('Transaction failed:', error);
            return "Transaction Error";
        }
    }
}
