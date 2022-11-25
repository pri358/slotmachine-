import React, { useEffect, useState } from "react";
import "./App.css";
import abi from "./utils/SlotMachine.json";
import { ethers } from "ethers";

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
    * First make sure we have access to the Ethereum object.
    */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const symbolGenerator = async () => {
  const rand = Math.random();
  
  let symbol = '';
  if(rand < 0.33) {
    symbol = '🍇';
  } else if(rand < 0.66) {
    symbol = '🍑';
  } else {
    symbol = '🍒';
  }
  return symbol;
};


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [valA, setValA] = useState("❓");
  const [valB, setValB] = useState("❓");
  const [valC, setValC] = useState("❓");
  const [betAmount, setBetAmount] = useState('');

  const contractAddress = "0x25b52FdEA66CE9cB78EC311978c796DCBcCFF219";
  const contractABI = abi.abi;
  const web3 = require('web3');

  const checkwallet = async() => { const account = await findMetaMaskAccount();
    if (account !== null) {
      setCurrentAccount(account);
    }
  }

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if(!ethereum) {
        alert("Get Ethereum Wallet")
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected to: ", accounts[0]);
      setCurrentAccount(accounts[0]);
      SetupEventListener()
    } catch (error) {
      console.error(error);
    }
  };

  const onSpin = async () => {
    try {
      // console.log("Bet: ", betAmount);
      // const tempA = await symbolGenerator();
      // const tempB = await symbolGenerator();
      // const tempC = await symbolGenerator();

      // setValA(tempA);
      // setValB(tempB);
      // setValC(tempC);
      // setBetAmount('');
      
      // if(tempA===tempB && tempB===tempC)
      // {
      //   alert("Congratulations! You Won!");
      // }
      // else
      // {
      //   alert("Loser");
      // }
      SetupEventListener();
      await placeBet();
    } catch (error) {
      console.error(error);
    }
  };

  const SetupEventListener = async() => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const slotMachineContract = new ethers.Contract(contractAddress, contractABI, signer);
        slotMachineContract.on("Result", (from, timestamp, message) => {
            console.log(from, timestamp, message)
            console.log("Caught Result event listener!")
        });
        slotMachineContract.on("balances", (betAmount, userBalance, contractBalance) => {
            console.log("Caught Balances event listener!")
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const placeBet = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const slotMachineContract = new ethers.Contract(contractAddress, contractABI, signer);
        const betAmountInWei = web3.utils.toWei(betAmount, 'ether');
        console.log("WEI: ", betAmountInWei);
        await slotMachineContract.play(betAmountInWei);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
   * The passed callback function will be run when the page loads.
   * More technically, when the App component "mounts".
   */
  useEffect(() => {
    checkwallet();
  }, []);

  const onInputChange = (event) => {
    const { value } = event.target;
    setBetAmount(value);
  };


  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          🎰 Casino Slot Machine 🎰
        </div>

        <div className="bio">
          Test your luck!
        </div>
        
        {
          currentAccount && (
            <form className = "betForm"
          onSubmit={(event) => {
            event.preventDefault();
            placeBet();
          }}>
          <text className="betButton">
            Place Bet:
          </text>
          <input
            className="betBox"
            textAlignVertical="top"
            type="text"
            placeholder="Bet Amount"
            value={betAmount}
            onChange={onInputChange}
          />
            
        </form>
          )
        }
        
        {
          betAmount && (  
          <button className="spinButton" onClick={onSpin}>
            Spin Me
          </button>
          )
        }

        {
          !currentAccount && (
            <button className="connectButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )
        }

        <div className="machineSymbols">{valA}{valB}{valC}</div>
      </div>
    </div>
  );
};

export default App;