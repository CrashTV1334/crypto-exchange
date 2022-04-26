/* global BigInt */
import "./App.css";

import { useState } from "react";
import { ethers } from "ethers";

import CryptoExchangeAbi from "../contractsData/CryptoExchange.json";
import CryptoExchangeAddress from "../contractsData/CryptoExchange-address.json";

import Navigation from "./Navbar";
import { Spinner } from "react-bootstrap";
import { Button } from "react-bootstrap";

let tokenPMP, acc, tokenNPN; 

function App() {
  const CONSTANT_VALUE = 1000000;
  const DECIMAL = 100000000000000;

  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [showBalance, setShowBalance] = useState(false);

  const [avlPMP, setAvlPMP] = useState("0");
  const [avlNPN, setAvlNPN] = useState("0");

  const [userPMP, setUserPMP] = useState("0");
  const [userNPN, setUserNPN] = useState("0");

  const [convPMP, setConvPMP] = useState(-1);
  const [convNPN, setConvNPN] = useState(-1);

  const [cryptoExchange, setCryptoExchange] = useState({});

  const [approvedPMP, setApprovedPMP] = useState(0.0); 
  const [approvedNPN, setApprovedNPN] = useState(0.0); 

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
    acc = accounts[0];

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

    setAvlPMP(avPMP);
    setAvlNPN(avNPN);

    setUserPMP(uPMP);
    setUserNPN(uNPN);

    // const address = await cryptoExchange.tokenPMP();
    // console.log(address);

    await loadTokenContracts(signer, cryptoExchange);

    setLoading(false);
  };

  const loadTokenContracts = async (signer, cryptoExchange) => {
    
    const addressPMP = await cryptoExchange.tokenPMP();
    const addressNPN = await cryptoExchange.tokenNPN();
    
    const tokenInterface = [
      'function totalSupply()  view returns (uint256)',
      'function balanceOf(address account)  view returns (uint256)',
      'function allowance(address owner, address spender)  view returns (uint256)',

      'function transfer(address recipient, uint256 amount)  returns (bool)',
      'function approve(address spender, uint256 amount)  returns (bool)',
      // 'function approve(address owner, address spender, uint256 amount)  returns (bool)',
      'function transferFrom(address sender, address recipient, uint256 amount)  returns (bool)',

      'function _mint(address receiver, uint amount)',
      'function _decimals()  returns (uint)',

      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'event Approval(address indexed owner, address indexed spender, uint256 value)'
    ];

    console.log(tokenInterface);

    tokenPMP = new ethers.Contract(addressPMP, tokenInterface, signer);
    // console.log(tokenPMP);
    tokenNPN = new ethers.Contract(addressNPN, tokenInterface, signer);

    await updatePMPAllowance();
    await updateNPNAllowance();
  } 

  const updatePMPAllowance = async () => {
    let PMPallowance = await tokenPMP.allowance(acc, CryptoExchangeAddress.address);
    console.log(PMPallowance);

    let amount = parseInt(PMPallowance._hex, 16);

    setApprovedPMP(amount/DECIMAL);
  }

  const updateNPNAllowance = async () => {
    let NPNallowance = await tokenNPN.allowance(acc, CryptoExchangeAddress.address);
    console.log(NPNallowance);

    let amount = parseInt(NPNallowance._hex, 16);

    setApprovedNPN(amount/DECIMAL);
  }

  const handlePMPtoNPN = async (event) => {
    // var amt = document.getElementById("PMPamount").value;
    // var amount = parseInt(amt);

    var amt = parseInt(document.getElementById("PMPamount").value);
    var amount = amt;

    event.preventDefault();

    const currAvlPMP = avlPMP / DECIMAL;
    const currAvlNPN = avlNPN / DECIMAL;

    const newAvlPMP = currAvlPMP + amount;
    const newAvlNPN = CONSTANT_VALUE / newAvlPMP;

    const debitNPN = Math.floor((currAvlNPN - newAvlNPN) * DECIMAL);
    const creditPMP = Math.floor(amount * DECIMAL);

    setConvNPN(-1);
    setShowBalance(false);

    await cryptoExchange.PMPtoNPN(creditPMP, debitNPN);
    await updatePMPAllowance();
  };

  const handleOnChangePMPtoNPN = async (event) => {
    // var amt = document.getElementById("PMPamount").value;
    // var amount = parseInt(amt);

    var amt = parseInt(document.getElementById("PMPamount").value);
    var amount = amt;

    const currAvlPMP = avlPMP / DECIMAL;
    const currAvlNPN = avlNPN / DECIMAL;

    const newAvlPMP = currAvlPMP + amount;
    const newAvlNPN = CONSTANT_VALUE / newAvlPMP;

    const debitNPN = Math.floor((currAvlNPN - newAvlNPN) * DECIMAL);

    if (isNaN(debitNPN)) {
      setConvNPN(-1);
    } else {
      setConvNPN(debitNPN);
    }
  };

  const handleNPNtoPMP = async (event) => {
    // var amt = document.getElementById("NPNamount").value;
    // var amount = parseInt(amt);

    var amt = parseInt(document.getElementById("NPNamount").value);
    var amount = amt;

    event.preventDefault();

    const currAvlPMP = avlPMP / DECIMAL;
    const currAvlNPN = avlNPN / DECIMAL;

    const newAvlNPN = currAvlNPN + amount;
    const newAvlPMP = CONSTANT_VALUE / newAvlNPN;

    const debitPMP = Math.floor((currAvlPMP - newAvlPMP) * DECIMAL);
    const creditNPN = Math.floor(amount * DECIMAL);

    setConvPMP(-1);
    setShowBalance(false);

    await cryptoExchange.NPNtoPMP(creditNPN, debitPMP);
    await updateNPNAllowance();
  };

  const handleOnChangeNPNtoPMP = async (event) => {
    var amt = document.getElementById("NPNamount").value;
    var amount = parseInt(amt);

    const currAvlPMP = avlPMP / DECIMAL;
    const currAvlNPN = avlNPN / DECIMAL;

    const newAvlNPN = currAvlNPN + amount;
    const newAvlPMP = CONSTANT_VALUE / newAvlNPN;

    const debitPMP = Math.floor((currAvlPMP - newAvlPMP) * DECIMAL);

    if (isNaN(debitPMP)) {
      setConvPMP(-1);
    } else {
      setConvPMP(debitPMP);
    }

  };

  const handleShowBalance = async () => {
    setShowBalance(true);
    const avPMP = await cryptoExchange.showAvlPMP();
    const avNPN = await cryptoExchange.showAvlNPN();
    const uPMP = await cryptoExchange.showUsrPMP();
    const uNPN = await cryptoExchange.showUsrNPN();

    setAvlPMP(avPMP);
    setAvlNPN(avNPN);

    setUserPMP(uPMP);
    setUserNPN(uNPN);
  };

  const handleAirdropPMP = async () => {
    setShowBalance(false);
    await cryptoExchange.airdropPMPToken();
  };
  const handleAirdropNPN = async () => {
    setShowBalance(false);
    await cryptoExchange.airdropNPNToken();
  };

  const handleApprovePMP = async (event) => {
    var amt = parseInt(document.getElementById("PMPamount").value);
    var amount = amt * DECIMAL;

    event.preventDefault();

    console.log(tokenPMP);

    let txn = await tokenPMP.approve(CryptoExchangeAddress.address, amount);
    await txn.wait();
    console.log(txn);

    await updatePMPAllowance();
  };

  const handleApproveNPN = async (event) => {
    var amt = parseInt(document.getElementById("NPNamount").value);
    var amount = amt * DECIMAL;

    event.preventDefault();

    let txn = await tokenNPN.approve(CryptoExchangeAddress.address, amount);
    await txn.wait();
    console.log(txn);

    await updateNPNAllowance();
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
                      {avlPMP / DECIMAL}
                    </tr>
                    <tr>
                      <span className="font-class">Napcoins in Pool: </span>
                      {avlNPN / DECIMAL}
                    </tr>
                    <tr></tr>
                    <tr></tr>
                    <br></br>
                    <br></br>
                    <tr>
                      <span className="font-class">Pumpcoins in Account: </span>
                      {userPMP / DECIMAL}
                    </tr>
                    <tr>
                      <span className="font-class">Napcoins in Account: </span>
                      {userNPN / DECIMAL}
                    </tr>
                  </table>
                ) : (
                  <p></p>
                )}
              </td>

              <td className="center-class center-class-padding">
                <p className="font-class-1">Exchange PMP for NPN</p>
                <form onSubmit={handlePMPtoNPN}>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    id="PMPamount"
                    placeholder="Amount of PMP"
                    onChange={handleOnChangePMPtoNPN}
                    class="formInput"
                  />

                  {convNPN !== -1 ? (
                    <p>
                      You will get <strong>{convNPN / DECIMAL}</strong> NPN
                    </p>
                  ) : (
                    <p></p>
                  )}

                  <hr></hr>
                  <span class="font-class">Approved Amount : </span> {approvedPMP}

                  <br></br>
                  <button type="button" class="btnTag warningTag" onClick={handleApprovePMP}>Approve</button>
                  
                  <hr></hr>
                  <button type="submit" class="btnTag successTag">PMP to NPN</button>
                  
                </form>
                
              </td>

              <td className="center-class center-class-padding">
                <p className="font-class-1">Exchange NPN for PMP</p>

                <form onSubmit={handleNPNtoPMP}>
                  <input
                    type="text"
                    pattern="[0-9]*"
                    id="NPNamount"
                    placeholder="Amount of NPN"
                    onChange={handleOnChangeNPNtoPMP}
                    class="formInput"
                  />

                  {convPMP !== -1 ? (
                    <p>
                      You will get <strong>{convPMP / DECIMAL}</strong> PMP
                    </p>
                  ) : (
                    <p></p>
                  )}

                  <hr></hr>
                  <span class="font-class">Approved Amount : </span> {approvedNPN}
                  <br></br>

                  <button type="button" class="btnTag warningTag" onClick={handleApproveNPN}>Approve</button>
                  <hr></hr>
                  <button type="submit" class="btnTag successTag">NPN to PMP</button>
                  
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
          
        </div>
      )}
    </div>
  );
}

export default App;
