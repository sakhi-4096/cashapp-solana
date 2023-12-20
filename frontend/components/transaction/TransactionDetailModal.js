import React from 'react';
import { format } from 'date-fns';
import {
  CheckBadgeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import { capitalize } from '../../utils/string';
import Modal from '../Modal';

// Component displaying transaction details in a modal
const TransactionDetailModal = ({ currentTransaction, modalOpen, setModalOpen }) => {
  return (
    <Modal modalOpen={modalOpen} setModalOpen={setModalOpen}>
      <div className="space-y-20">
        {/* Display the transaction profile */}
        <TransactionProfile
          name={currentTransaction?.to.name}
          handle={currentTransaction?.to.name}
          avatar={currentTransaction?.to.avatar}
          verified={currentTransaction?.to.verified}
        />

        {/* Display the transaction details */}
        <TransactionDetails
          amount={currentTransaction?.amount}
          description={currentTransaction?.description}
          transactionDate={currentTransaction?.transactionDate}
        />

        {/* Display the transaction status */}
        <TransactionStatus status={currentTransaction?.status} />

        {/* Display metadata related to the transaction */}
        <TransactionMetadata
          metadata={{
            amount: `${Number(currentTransaction?.amount).toFixed(2)} SOL`,
            to: currentTransaction?.to.name,
            from: currentTransaction?.from.name,
          }}
        />

        {/* Display the transaction footer */}
        <TransactionFooter />
      </div>
    </Modal>
  );
};

// Component for displaying the transaction profile information
const TransactionProfile = ({ name, handle, avatar, verified }) => {
  console.log(verified);
  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Display user avatar */}
      <div className="h-16 w-16 rounded-full border-2 border-white">
        <img className="h-full w-full rounded-full object-cover" src={avatar} alt={`${name}'s avatar`} />
      </div>

      <div className="flex flex-col items-center space-y-1">
        {/* Display user name and verification status */}
        <div className="flex items-center space-x-1">
          <p className="font-semibold">{name}</p>
          {verified && <CheckBadgeIcon className="h-5 w-5 text-blue-500" />}
        </div>

        {/* Display transaction information */}
        <p className="text-sm font-light text-gray-600 truncate">Payment to ${handle}</p>
      </div>
    </div>
  );
};

// Component for displaying transaction details like amount and date
const TransactionDetails = ({ amount, description, transactionDate }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Display transaction amount */}
      <h3 className="text-6xl">{Number(amount).toFixed(1)} SOL</h3>

      <div className="flex flex-col items-center text-gray-400">
        {/* Display transaction description and date */}
        <p>{description}</p>
        <p>
          {format(new Date(transactionDate), 'MMM d')} at {format(new Date(transactionDate), 'h:mm aa')}
        </p>
      </div>
    </div>
  );
};

// Component for displaying the transaction status
const TransactionStatus = ({ status }) => {
  const isCompleted = status === 'Completed';

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {/* Display transaction status icon and text */}
      {isCompleted ? <CheckCircleIcon className="h-8 w-8 text-[#0bb534]" /> : <XCircleIcon className="h-8 w-8 text-red-600" />}
      <p className="text-lg font-semibold">{capitalize(status)}</p>
    </div>
  );
};

// Component for displaying transaction metadata
const TransactionMetadata = ({ metadata }) => {
  return (
    <div className="space-y-1">
      {/* Display metadata information */}
      {Object.entries(metadata).map(([title, data], index) => (
        <div key={index} className="flex justify-between">
          <p className="text-gray-400 max-w-[25%]">{capitalize(title)}</p>
          <p className="font-medium text-gray-400 max-w-[75%] truncate">{data}</p>
        </div>
      ))}
    </div>
  );
};

// Component for displaying the transaction footer
const TransactionFooter = () => {
  return (
    <div className="flex flex-col items-center justify-center text-sm text-gray-400">
      {/* Display company address information */}
      <p>Block Inc.</p>
      <p>1455 Market St. Suite 600</p>
      <p>San Francisco. CA 94103</p>
      <p>(800) 969-1940</p>
      <p>Privacy Notice</p>
    </div>
  );
};

export default TransactionDetailModal;
