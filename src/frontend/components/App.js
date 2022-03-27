import "./App.css";

import { useState } from "react";
import { ethers } from "ethers";

import CryptoExchangeAbi from "../contractsData/CryptoExchange.json";
import CryptoExchangeAddress from "../contractsData/CryptoExchange-address.json";

import Navigation from "./Navbar";
import { Spinner } from "react-bootstrap";

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [showBalance, setShowBalance] = useState(false);

  const [avlPMP, setAvlPMP] = useState(0);
  const [avlNPN, setAvlNPN] = useState(0);

  const [userPMP, setUserPMP] = useState(0);
  const [userNPN, setUserNPN] = useState(0);

  const [cryptoExchange, setCryptoExchange] = useState({});

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    window.ethereum.on("chainChanged", (chainId) => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", async function (accounts) {
      setAccount(accounts[0]);
      await web3Handler();
    });

    loadContracts(signer);
  };

  const loadContracts = async (signer) => {
    const cryptoExchange = new ethers.Contract(
      CryptoExchangeAddress.address,
      CryptoExchangeAbi.abi,
      signer
    );
    setCryptoExchange(cryptoExchange);
    const avPMP = await cryptoExchange.showAvlPMP();
    const avNPN = await cryptoExchange.showAvlNPN();
    const uPMP = await cryptoExchange.showUsrPMP();
    const uNPN = await cryptoExchange.showUsrNPN();

    setAvlPMP(avPMP.toString());
    setAvlNPN(avNPN.toString());

    setUserPMP(uPMP.toString());
    setUserNPN(uNPN.toString());

    setLoading(false);
  };

  const handlePMPtoNPN = async (event) => {
    var amt = document.getElementById("PMPamount").value;
    var amount = parseInt(amt);

    event.preventDefault();

    setShowBalance(false);

    await cryptoExchange.PMPtoNPN(amount);
  };

  const handleNPNtoPMP = async (event) => {
    var amt = document.getElementById("NPNamount").value;
    var amount = parseInt(amt);

    event.preventDefault();

    setShowBalance(false);

    await cryptoExchange.NPNtoPMP(amount);
  };

  const handleShowBalance = async () => {
    setShowBalance(true);
    const avPMP = await cryptoExchange.showAvlPMP();
    const avNPN = await cryptoExchange.showAvlNPN();
    const uPMP = await cryptoExchange.showUsrPMP();
    const uNPN = await cryptoExchange.showUsrNPN();

    setAvlPMP(avPMP.toString());
    setAvlNPN(avNPN.toString());

    setUserPMP(uPMP.toString());
    setUserNPN(uNPN.toString());
  };

  const handleAirdropPMP = async () => {
    setShowBalance(false);
    await cryptoExchange.airdropPMPToken();
  };
  const handleAirdropNPN = async () => {
    setShowBalance(false);
    await cryptoExchange.airdropNPNToken();
  };

  return (
    <div>
      <Navigation web3Handler={web3Handler} account={account} />
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
          }}
        >
          <Spinner animation="border" style={{ display: "flex" }} />
          <p className="mx-3 my-0">Awaiting Metamask Connection...</p>
        </div>
      ) : (
        <div>
          <button onClick={handleShowBalance}>Show Balance</button>
          {showBalance ? (
            <div>
              <p>Bank Pumpcoins: {avlPMP}</p>
              <p>Bank Napcoins: {avlNPN}</p>
              <br />
              <p>User Pumpcoins: {userPMP}</p>
              <p>User Napcoins: {userNPN}</p>
            </div>
          ) : (
            <p></p>
          )}

          <br></br>
          <p>PMP to NPN</p>
          {/* <ExchangeHome cryptoExchange={cryptoExchange} /> */}
          <form onSubmit={handlePMPtoNPN}>
            <input type="text" pattern="[0-9]*" id="PMPamount" />
            <button type="submit">PMP to NPN</button>
          </form>
          <br></br>
          <p>NPN to PMP</p>
          {/* <ExchangeHome cryptoExchange={cryptoExchange} /> */}
          <form onSubmit={handleNPNtoPMP}>
            <input type="text" pattern="[0-9]*" id="NPNamount" />
            <button type="submit">NPN to PMP</button>
          </form>

          <button onClick={handleAirdropPMP}>Airdrop PMP</button>
          <button onClick={handleAirdropNPN}>Airdrop NPN</button>
        </div>
      )}
    </div>
  );
}

export default App;
