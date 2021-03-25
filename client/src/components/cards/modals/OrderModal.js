import { Modal } from "antd";

const OrderModal = ({ session, orderedBy, showModal, setShowModal }) => {
  return (
    <Modal
      visible={showModal}
      title="Order Payment info"
      onCancel={() => setShowModal(!showModal)}
    >
      <p>Payment intent: {session.payment_intent}</p>
      <p>Payment status: {session.payment_status}</p>
      <p>
        Amount total: {session.currency.toUpperCase()}{" "}
        {session.amount_total / 100}
      </p>
      <p>Stripe customer id: {session.customer}</p>
      <p>Customer: {orderedBy.name}</p>
      {/* <pre>{JSON.stringify(session, null, 4)}</pre> */}
    </Modal>
  );
};

export default OrderModal;
