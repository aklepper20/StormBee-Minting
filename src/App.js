import "./App.css";
import backgroundVideo from "./assets/background.mp4";
import surron from "./assets/donNFT.png";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { ethers } from "ethers";
import abi from "./contracts/contract.json";

const CONTRACT_ADDRESS = "0xb0020b22638782C26761127be26f66C885f33801";

function App() {
  const [supply, setSupply] = useState("");
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hash, setHash] = useState("");

  const { authenticate, isAuthenticated, logout, user, enableWeb3, Moralis } =
    useMoralis();

  const mint = async () => {
    //this is matching the contract of the mint function
    const sendOptions = {
      contractAddress: CONTRACT_ADDRESS,
      functionName: "mint",
      abi: abi,
      params: {
        amount: 1,
      },
      msgValue: 1000000000000000,
    };
    setCompleted(false);
    //this allows you to get the transaction information
    const transaction = await Moralis.executeFunction(sendOptions);
    //set the hash in order to check the etherscan
    setHash(transaction.hash);
    setTransactionInProgress(true);

    await transaction.wait(3).then((receipt) => {
      setTransactionInProgress(false);
      setCompleted(true);
    });
  };

  const checkEthScan = () => {
    let nftHash = `https://rinkeby.etherscan.io/tx/${hash}`;
    window.open(nftHash, "_blank");
  };

  const startOver = () => {
    setCompleted(false);
    setTransactionInProgress(false);
    setHash(null);
    logout();
  };

  useEffect(async () => {
    if (isAuthenticated) {
      const web3Provider = await enableWeb3();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, web3Provider);
      let totalHexSupply = await contract.totalSupply(0);
      setSupply(totalHexSupply.toNumber());
    }
  }, [isAuthenticated]);

  return (
    <div className="App">
      <video
        className="background-video"
        src={backgroundVideo}
        width="600"
        height="300"
        playsInline={true}
        muted={true}
        autoPlay={true}
        loop={true}
      />
      <div className="main">
        <div className="main-left">
          <img src={surron} alt="Sur Ron" />
        </div>
        <div className="main-right">
          <div className="main-title">
            <h2>StormBee: INTO THE METAVERSE</h2>
          </div>
          <div className="main-mintNumber">
            <p>{supply} minted / 100</p>
          </div>
          {completed && (
            <div className="main-mintNumber">
              Congrats! You're NFT has been minted!
            </div>
          )}
          <div className="buttons">
            {isAuthenticated ? (
              <>
                {transactionInProgress ? (
                  <>
                    <ReactLoading
                      type="bubbles"
                      color="#fff"
                      height={64}
                      // width={375}
                    />
                    <button onClick={checkEthScan} className="filled">
                      Etherscan
                    </button>
                  </>
                ) : (
                  <button onClick={mint} className="filled">
                    Mint
                  </button>
                )}
                <button onClick={startOver} className="transparent">
                  START OVER
                </button>
              </>
            ) : (
              <button onClick={authenticate} className="filled">
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        <div className="footer">MINTING...</div>
      </div>
    </div>
  );
}

export default App;
