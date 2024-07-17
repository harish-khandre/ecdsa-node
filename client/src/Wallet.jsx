import server from "./server";
import { useState } from "react";
import Transfer from "./Transfer";

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const generateWallet = () => {
    server.get("/generate").then(({ data }) => {
      setBalance(data.balance);
      setAddress(data.address);
      setPrivateKey(data.privateKey);
    });
  };

  return (
    <>
      <div className="container wallet">
        <h1>Your Wallet</h1>

        <label>Wallet Address</label>

        <div className="balance">Balance: {balance}</div>
        <div className="balance">Address: {address}</div>
        <div className="balance">Private key: {privateKey}</div>

        {!address && (
          <button className="button" onClick={generateWallet}>
            Generate Wallet
          </button>
        )}
      </div>
      <Transfer
        setBalance={setBalance}
        address={address}
        privateKey={privateKey}
      />
    </>
  );
}

export default Wallet;
