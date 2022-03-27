import "./App.css";

import { useState } from "react";
import { ethers } from "ethers";

import CryptoExchangeAbi from "../contractsData/CryptoExchange.json";
import CryptoExchangeAddress from "../contractsData/CryptoExchange-address.json";

import Navigation from "./Navbar";
import { Spinner } from "react-bootstrap";
import { Button } from "react-bootstrap";

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
    <div className="container-class">
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
          <table className="margin-class">
            <tr>
              <td className="left-col-class">
                <Button
                  onClick={handleShowBalance}
                  variant="outline-success"
                  className="button-width-class"
                >
                  Show Balance
                </Button>
                <br></br>
                <br></br>
                {showBalance ? (
                  <table>
                    <tr>
                      <span className="font-class">Pumpcoins in Pool: </span>
                      {avlPMP}
                    </tr>
                    <tr>
                      <span className="font-class">Napcoins in Pool: </span>
                      {avlNPN}
                    </tr>
                    <tr></tr>
                    <tr></tr>
                    <br></br>
                    <br></br>
                    <tr>
                      <span className="font-class">Pumpcoins in Account: </span>
                      {userPMP}
                    </tr>
                    <tr>
                      <span className="font-class">Napcoins in Account: </span>
                      {userNPN}
                    </tr>
                  </table>
                ) : (
                  <p></p>
                )}
              </td>

              <td className="center-class">
                <p className="font-class-1">Exchange PMP for NPN</p>
                <form onSubmit={handlePMPtoNPN}>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    id="PMPamount"
                    placeholder="Amount of PMP"
                  />
                  <button type="submit">PMP to NPN</button>
                </form>
                <br></br>
                <p className="font-class-1">Exchange NPN for PMP</p>
                {/* <ExchangeHome cryptoExchange={cryptoExchange} /> */}
                <form onSubmit={handleNPNtoPMP}>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    id="NPNamount"
                    placeholder="Amount of NPN"
                  />
                  <button type="submit">NPN to PMP</button>
                </form>
              </td>
            </tr>
          </table>
          <div className="lst-row-class">
            <br></br>
            <br></br>
            <Button
              onClick={handleAirdropPMP}
              className="rght-margin"
              variant="outline-dark"
            >
              Airdrop PMP
            </Button>
            <Button onClick={handleAirdropNPN} variant="outline-dark">
              Airdrop NPN
            </Button>
          </div>
          <br></br>
          <br></br>
          <div className="float-right">- Made by Team SurfShore</div>
        </div>
      )}
    </div>
  );
}

export default App;
