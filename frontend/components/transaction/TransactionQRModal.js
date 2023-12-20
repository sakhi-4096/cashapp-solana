import Modal from '../Modal';
import {
  createQR,
  encodeURL,
  findReference,
  validateTransfer,
  FindReferenceError,
  ValidateTransferError
} from "@solana/pay";
import { PublicKey, Keypair } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useRef } from 'react';  // Removed useState, since it's not needed
import { truncate } from "../../utils/string";
import { useCashApp } from '../../hooks/cashapp';
import { getAvatarUrl } from '../../functions/getAvatarUrl';

const TransactionQRModal = ({ modalOpen, setModalOpen, userAddress, setQrCode }) => {
  const { transactions, setTransactions } = useCashApp();
  const qrRef = useRef();
  const { connection } = useConnection();

  // Function to generate QR code and monitor transaction
  const generateQRCode = async () => {
    try {
      // User details
      const recipient = new PublicKey(userAddress);
      const amount = new BigNumber("0.001");
      const reference = Keypair.generate().publicKey;
      const label = "Company Inc";
      const message = "Cookies 🍪";

      // Create URL parameters
      const urlParams = {
        recipient,
        amount,
        reference,
        label,
        message,
      };

      // Encode parameters into a URL
      const url = encodeURL(urlParams);

      // Generate QR code
      const qr = createQR(url, 488, 'transparent');

      // Display QR code in the component
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
        qr.append(qrRef.current);
      }

      // Set up interval to monitor transaction confirmation
      const interval = setInterval(async () => {
        try {
          console.log("Waiting for transaction confirmation");
          // Find transaction by reference
          const signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });
          console.log("Validating transaction");
          // Validate the transaction
          await validateTransfer(
            connection,
            signatureInfo.signature,
            {
              recipient,
              amount,
              reference,
            },
            { commitment: 'confirmed' }
          );

          // Transaction is confirmed, update local storage
          const newID = (transactions.length + 1).toString();
          const newTransaction = {
            id: newID,
            from: {
              name: recipient,
              handle: recipient,
              avatar: getAvatarUrl(recipient.toString()),
              verified: true,
            },
            to: {
              name: reference,
              handle: '-',
              avatar: getAvatarUrl(reference.toString()),
              verified: false,
            },
            description: 'User sent you SOL through Phantom App!',
            transactionDate: new Date(),
            status: 'Completed',
            amount: amount,
            source: '-',
            identifier: '-'
          };

          // Update transactions in local storage
          setTransactions([newTransaction, ...transactions]);
          setModalOpen(false);

          // Stop monitoring the transaction
          clearInterval(interval);
        } catch (e) {
          if (e instanceof FindReferenceError) {
            // No transaction found yet, ignore this
            return;
          }
          if (e instanceof ValidateTransferError) {
            // Transaction is invalid
            console.error('Transaction is invalid', e);
            return;
          }
          console.error('Unknown error', e);
        }
      }, 500);

      // Cleanup function to stop monitoring on component unmount
      return () => clearInterval(interval);
    } catch (error) {
      // Log any errors during QR code generation or transaction monitoring
      console.error('Error generating QR code or monitoring transaction:', error);
    }
  };

  // Call the function to generate QR code and monitor transaction when the button is clicked
  const loadQr = () => {
    console.log('QR Code Clicked');
    generateQRCode();
    // Set the state to true to rerender the component with generated QR (if needed)
    setQrCode(true);
  };

  return (
    <Modal modalOpen={modalOpen} setModalOpen={setModalOpen}>
      <div>
        <div className="flex flex-col items-center justify-center space-y-1">
          <div ref={qrRef} />
        </div>

        <div className="flex flex-col items-center justify-center space-y-1">
          <p className="text-lg font-medium text-gray-800">{truncate(userAddress)}</p>

          <p className="text-sm font-light text-gray-600">Scan to pay ${truncate(userAddress)}</p>

          {/* Button to trigger QR code generation */}
          <button onClick={loadQr} className="w-full rounded-lg bg-[#16d542] py-3 hover:bg-opacity-70">
            <span className="font-medium text-white">Load QR code</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransactionQRModal;
