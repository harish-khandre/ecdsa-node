import express, { json } from "express";
import cors from "cors";
import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";
import { randomBytes } from "crypto";

const app = express();
const port = 3042;

app.use(cors());
app.use(json());

const balances = {};

app.get("/generate", (req, res) => {
  const privateKey = randomBytes(32);
  const publicKey = secp256k1.getPublicKey(privateKey, false).slice(1);
  const address = keccak256(publicKey).slice(-20);
  const privateKeyHex = toHex(privateKey);
  const addressHex = toHex(address);

  balances[addressHex] = 100;

  res.send({
    privateKey: privateKeyHex,
    address: `0x${addressHex}`,
    balance: balances[addressHex],
  });
});

app.post("/send", (req, res) => {
  const { signature, recId, amount, recipient } = req.body;

  const signatureBytes = Uint8Array.from(Buffer.from(signature, "hex"));
  const recIdBytes = parseInt(recId, 16);

  const publicKey = secp256k1.recover(signatureBytes, recIdBytes);

  if (!secp256k1.verify(signatureBytes, publicKey)) {
    return res
      .status(400)
      .send({ status: "error", message: "Signature is invalid" });
  }

  const senderAddress = toHex(keccak256(publicKey).slice(-20));

  if (!balances[senderAddress]) {
    return res
      .status(400)
      .send({ status: "error", message: "Sender does not exist" });
  }

  if (balances[senderAddress] < amount) {
    return res
      .status(400)
      .send({ status: "error", message: "Not enough funds" });
  }

  if (!balances[recipient]) {
    setInitialBalance(recipient);
  }

  balances[senderAddress] -= amount;
  balances[recipient] += amount;

  res.send({
    senderBalance: balances[senderAddress],
    recipientBalance: balances[recipient],
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
