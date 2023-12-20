import { useState, useEffect } from "react";
import { getAvatarUrl } from "../functions/getAvatarUrl";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";

export const useCashApp = () => {
  // State variables
  const [avatar, setAvatar] = useState("");
  const [userAddress, setUserAddress] = useState("44444444444444444444444444");
  const [amount, setAmount] = useState(0);
  const [receiver, setReceiver] = useState('');
  const [transactionPurpose, setTransactionPurpose] = useState('');
  const [newTransactionModalOpen, setNewTransactionModalOpen] = useState(false);

  // Wallet and connection information from wallet adapter
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  // Custom hook for using localStorage with default state
  const useLoopStorage = (storageKey, fallbackState) => {
    const [value, setValue] = useState(JSON.parse(localStorage.getItem(storageKey)) ?? fallbackState);

    useEffect(() => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    }, [value, setValue]);

    return [value, setValue];
  };

  // Transaction history stored in localStorage
  const [transactions, setTransactions] = useLoopStorage("transactions", []);

  // Get Avatar based on the userAddress
  useEffect(() => {
    if (connected) {
      setAvatar(getAvatarUrl(publicKey.toString()));
      setUserAddress(publicKey.toString());
    }
  }, [connected]);

  // Create the transaction to send to our wallet, which can be signed from there
  const makeTransaction = async (fromWallet, toWallet, amount, reference) => {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);

    // Get recent blockhash to include in the transaction
    const { blockhash } = await connection.getLatestBlockhash('finalized');

    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromWallet, // the buyer pays the transaction fee
    });

    // Create instruction to send SOL from owner to recipient
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: fromWallet,
      lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      toPubkey: toWallet,
    });

    transferInstruction.keys.push({
      pubkey: reference,
      isSigner: false,
      isWritable: false,
    });

    transaction.add(transferInstruction);

    return transaction;
  };

  // Create the function to RUN the transaction, to be added to the button
  const doTransaction = async ({ amount, receiver, transactionPurpose }) => {
    const fromWallet = publicKey;
    const toWallet = new PublicKey(receiver);
    const bnAmount = new BigNumber(amount);
    const reference = Keypair.generate().publicKey;
    const transaction = await makeTransaction(fromWallet, toWallet, bnAmount, reference);

    const txnHash = await sendTransaction(transaction, connection);
    console.log(txnHash);

    // Create transaction history object
    const newID = (transactions.length + 1).toString();
    const newTransaction = {
      id: newID,
      from: {
        name: publicKey,
        handle: publicKey,
        avatar: avatar,
        verified: true,
      },
      to: {
        name: receiver,
        handle: '-',
        avatar: getAvatarUrl(receiver.toString()),
        verified: false,
      },
      description: transactionPurpose,
      transactionDate: new Date(),
      status: 'Completed',
      amount: amount,
      source: '-',
      identifier: '-',
    };

    setNewTransactionModalOpen(false);
    setTransactions([newTransaction, ...transactions]);
  };

  return {
    connected,
    publicKey,
    avatar,
    userAddress,
    doTransaction,
    amount,
    setAmount,
    receiver,
    setReceiver,
    transactionPurpose,
    setTransactionPurpose,
    transactions,
    setTransactions,
    setNewTransactionModalOpen,
    newTransactionModalOpen,
  };
};
