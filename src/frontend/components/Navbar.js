import { Button } from "react-bootstrap";

const Navigation = ({ web3Handler, account }) => {
  return (
    <div>
      {account ? (
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
      ) : (
        <Button onClick={web3Handler} variant="outline-dark">
          Connect Wallet
        </Button>
      )}
    </div>
  );
};

export default Navigation;
