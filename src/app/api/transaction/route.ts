import { NextRequest, NextResponse } from 'next/server';
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
} from "@solana/web3.js";
import { 
    createTransferCheckedInstruction,
    getOrCreateAssociatedTokenAccount, 
    TOKEN_2022_PROGRAM_ID, 
    TokenAccountNotFoundError, 
} from "@solana/spl-token";
import bs58 from "bs58";

async function processTokenTransaction(publicKey : string, amount : number) : Promise<string> {
    
    try{
        const connection = new Connection(clusterApiUrl("devnet"), "finalized");
        
        // Token Holder
        const sourceKeypair = Keypair.fromSecretKey(
            bs58.decode(
                process.env.TOKENHOLDER || "",
            ),
        );

        const sendToAddress = new PublicKey(
            publicKey,
        ); 

        console.log(sendToAddress.toBase58())

        const mintPubkey = new PublicKey(
            "EcspzwoxUsh9ABKxrkJ2snhdjp1H2e2vaXMSw8dUFwQd",
        );
       
        const sendToATA = await getOrCreateAssociatedTokenAccount(
            connection, 
            sourceKeypair,
            mintPubkey,
            sendToAddress,
            false,
            "finalized",
            {
                skipPreflight: true,
            },
            TOKEN_2022_PROGRAM_ID
        );

        const sourceATA = await getOrCreateAssociatedTokenAccount(
            connection, 
            sourceKeypair,
            mintPubkey,
            sourceKeypair.publicKey,
            false,
            "finalized",
            {
                skipPreflight: true,
            },
            TOKEN_2022_PROGRAM_ID
        );

        const { blockhash } = await (connection.getLatestBlockhash('finalized'))

        const transaction = new Transaction();

        // Set the recent blockhash and fee payer, without this it will give error
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = sourceKeypair.publicKey;

        const lamports = await connection.getMinimumBalanceForRentExemption(5)
        
        // transfer instruction
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: sendToAddress,
                toPubkey: sourceKeypair.publicKey,
                lamports,
            })
        );

        // Add the transfer instruction to the transaction instance
        transaction.add(createTransferCheckedInstruction(
            sourceATA.address, // source
            mintPubkey, // mint
            sendToATA.address, // destination
            sourceKeypair.publicKey, // owner of source account
            amount * LAMPORTS_PER_SOL, // amount to transfer
            9, // decimals of my created token
            [sourceKeypair, sendToAddress], // Signers
            TOKEN_2022_PROGRAM_ID
        ));

        transaction.partialSign(sourceKeypair); 

        // serialize it to pass to the FE to let user sign it
        const serializedTransaction = transaction.serialize({
            requireAllSignatures: false
        })
        const base64 = serializedTransaction.toString('base64')

        console.log("-------------------\n")
        console.log(base64)
        console.log("\n-------------------")

        return base64;
    }
    catch(error){
        console.log(error)
        if(error instanceof TokenAccountNotFoundError){
            console.log(error.message, "HERE")
        }
        return "Transaction Error";
    }
}

export async function POST(req: NextRequest) {
    try {
        const { publicKey, amount } : { 
            publicKey : string, 
            amount : number 
        } = await req.json();

        const signature = await processTokenTransaction(publicKey, amount);
        
        return NextResponse.json({ 
            message: 'Success',
            data: signature
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ 
            message: 'Error processing request',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}