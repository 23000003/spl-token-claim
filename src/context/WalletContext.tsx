"use client"
import React, { useEffect, useMemo, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';
import Wallet from '../components/Wallet';

export default function WalletContext() {
    const [loading, setLoading] = useState(false);

    const network = WalletAdapterNetwork.Devnet;

    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(() => [new SolflareWalletAdapter(), new PhantomWalletAdapter()], [] );

    useEffect(() => {
        setTimeout(() => {
            setLoading(true);
        }, 2000);
    }, []);    


    if (!loading) {
        return <div>Loading...</div>;
    }

    console.log("TEST")

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <div className='flex flex-row justify-center items-center gap-2'>
                        <WalletMultiButton />
                        <WalletDisconnectButton />
                    </div>
                    <Wallet/>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};