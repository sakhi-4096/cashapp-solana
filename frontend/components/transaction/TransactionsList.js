import { useMemo, useState } from 'react';
import TransactionDetailModal from './TransactionDetailModal';
import TransactionItem from './TransactionItem';

// Component for displaying a list of transactions
const TransactionsList = ({ transactions }) => {
  // State to manage the visibility of the transaction detail modal
  const [modalOpen, setModalOpen] = useState(false);
  // State to keep track of the ID of the currently selected transaction
  const [currentTransactionID, setCurrentTransactionID] = useState(null);
  // Memoized value for the current transaction based on the ID
  const currentTransaction = useMemo(() => transactions.find((transaction) => transaction.id === currentTransactionID), [currentTransactionID]);

  // Function to toggle the visibility of the transaction detail modal
  const toggleTransactionDetailModal = (value, transactionID) => {
    setCurrentTransactionID(transactionID);
    setModalOpen(value);
  };

  return (
    <div>
      {/* Header section */}
      <div className="bg-[#f6f6f6] pb-4 pt-10">
        <p className="mx-auto max-w-3xl px-10 text-sm font-medium uppercase text-[#abafb2] xl:px-0">Transactions</p>
      </div>

      {/* List of transactions */}
      <div className="mx-auto max-w-3xl divide-y divide-gray-100 py-4 px-10 xl:px-0">
        {/* Iterate over each transaction and display a TransactionItem component */}
        {transactions.map(({ id, to, amount, description, transactionDate }) => (
          <TransactionItem
            key={id}
            id={id}
            to={to}
            description={description}
            transactionDate={transactionDate}
            amount={amount}
            toggleTransactionDetailModal={toggleTransactionDetailModal}
          />
        ))}

        {/* Display the TransactionDetailModal component */}
        <TransactionDetailModal modalOpen={modalOpen} setModalOpen={setModalOpen} currentTransaction={currentTransaction} />
      </div>
    </div>
  );
};

export default TransactionsList;
