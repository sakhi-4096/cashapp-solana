import Modal from '../Modal'
import { createQR, encodeURL, findReference, validateTransfer, FindReferenceError, ValidateTransferError } from "@solana/pay"
import { PublicKey, Keypair } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useRef, useState } from 'react';
import { truncate } from "../../utils/string"
import { useCashApp } from '../../hooks/cashapp';
import { getAvatarUrl } from '../../functions/getAvatarUrl';




const TransactionQRModal = ({ modalOpen, setModalOpen, userAddress, setQrCode }) => {
    const { transactions, setTransactions } = useCashApp()
    const qrRef = useRef()
    const { connection } = useConnection()
    // Wwe need to generate QR code depending on public key then
    // Set the state to true to rerender the component with generated QR
    const loadQr = () => {
      setQrCode(true)
    }

    useEffect(() => {
      // Generate QR Code
      const recipient = new PublicKey(userAddress)
      const amount = new BigNumber("1")
      const reference = Keypair.generate().publicKey
      const label = "SpaceX Inc"
      const message = "Thaanks for your Sol! 🍪"

      const urlParams = {
        recipient,
        amount,
        reference,
        label,
        message,
      }

      const url = encodeURL(urlParams)
      const qr = createQR(url, 488, 'transparent')
      if(qrRef.current) {
         qrRef.current.innerHTML = ''
         qr.append(qrRef.current)
      }

      // Wait for the user to send the tranaction

      const interval = setInterval(async() => {
        console.log("Waiting for transaction confirmation")
        try {
          const signatureInfo = await findReference(connection, reference, {finality:'confirmed'})
          console.log("Validating")
          await validateTransfer(
            connection,
            signatureInfo.signature,
            {
              recipient,
              amount,
              reference,
            },
            { commitment: 'confirmed' }
          )
          // At this point the transaction is confirmed
          // Lets add the transaction to our Localstorage
          const newID = (transactions.length + 1).toString()
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
            description: 'User sent you SOL though Phantom App!',
            transactionDate: new Date(),
            status: 'Completed',
            amount: amount,
            source: '-',
            identifier: '-'
          };
          setTransactions([newTransaction,...transactions])
          setModalOpen(false)

          clearInterval(interval)

        } catch (e) {
          if(e instanceof FindReferenceError) {
            // No transaction found yet, igrnore this
            return
          }
          if (e instanceof ValidateTransferError) {
            // Transaction is invalid
            console.error('Transaction is invalid', e)
            return;
          }
          console.error('Unknown error', e)
        }
      }, 500)

      return () => clearInterval(interval)
    })

    return (
        <Modal modalOpen={modalOpen} setModalOpen={setModalOpen}>
            <div >
                <div className="flex flex-col items-center justify-center space-y-1">
                    <div ref={qrRef} />
                </div>

                <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="text-lg font-medium text-gray-800">{truncate(userAddress)}</p>

                    <p className="text-sm font-light text-gray-600">Scan to pay ${truncate(userAddress)}</p>

                    <button onClick={() => loadQr()} className="w-full rounded-lg bg-[#16d542] py-3 hover:bg-opacity-70">
                        <span className="font-medium text-white">Load QR code</span>
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default TransactionQRModal
