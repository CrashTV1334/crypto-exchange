import "./Navbar.css";

import { Button } from "react-bootstrap";

const Navigation = ({ web3Handler, account }) => {
  return (
    <div>
      {account ? (
        <div>
          <h1 className="heading-class">Cryptocurrency Exchange</h1>
          <div className="right-float">
            <a
              href={`https://etherscan.io/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
              className="button nav-button btn-sm mx-4"
            >
              <Button variant="outline-dark">
                {account.slice(0, 5) + "..." + account.slice(38, 42)}
              </Button>
            </a>
          </div>
        </div>
      ) : (
        <Button
          onClick={web3Handler}
          variant="outline-dark"
          className="center-class"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default Navigation;
