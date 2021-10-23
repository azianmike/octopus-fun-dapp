import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { ethers } from "ethers";
import MyNFT from './utils/MyNFT.json';
import Web3 from 'web3';

// Constants
const TWITTER_HANDLE = '__mikareyes';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/your-snooty-coffee-order-g0czizq92i';
const TOTAL_MINT_COUNT = 456;
const CONTRACT_ADDRESS = "0xC5a51c08A09aF92C816bA32786397C4008d937f6"; // Change Address
const MINT_DATE = "2021-10-23T19:00:00";

const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(process.env.REACT_APP_PINATA_API_KEY, process.env.REACT_APP_PINATA_SECRET);
var img_file;

const App = () => {
  /*
    * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
    */
  const [currentAccount, setCurrentAccount] = useState("");
  const [gameOpen, setGameOpen] = useState("false");
  const [totalPlayers, setTotalPlayers] = useState();
  const [currentRound, setCurrentRound] = useState(0); 
  const [currentMints, setCurrentMints] = useState();
  // const img_file = useState();

  // const web3 = new Web3(window.ethereum);
  // const connectedContract = web3.eth.Contract(MyNFT.abi, CONTRACT_ADDRESS);

  /*----------------------WEB3 WALLET INITIALIZATION---------------------------*/
  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    /*
      * Check if we're authorized to access the user's wallet
      */
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    
    /*
      * User can have multiple authorized accounts, we grab the first one if its there!
      */
    if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account)
          setupEventListener()
      } else {
          console.log("No authorized account found")
    }

  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

   // Setup our listener.
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // Ethers is a library that helps our frontend talk to our contract. Provider is what we use to actually talk to ethereum nodes. We use nodes that Metamask provides
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT, signer);
        // The above line is what actually creates the connection to contract; neesd abi and signer
        console.log("Connected Contract", connectedContract);
        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!

        // connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        //   console.log("From, tokenId", from, tokenId.toNumber());
        //   console.log("Inside connected contract WOOT WOOT");
        //   alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        // });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  /*----------------------MINT---------------------------*/
  const askContractToMintNft = useCallback(async () => {
    // This function doesn't yet work
    try {
      const { ethereum } = window;
      if (ethereum) {
        const amountToSend = 100000000000000000;
        // console.log("amount to send", amountToSend);
        // const provider = new ethers.providers.Web3Provider(ethereum);
        // const signer = provider.getSigner();
        // const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT, signer);
        // console.log("connectedcontract", connectedContract)
        // console.log("Going to pop wallet now to pay gas...")
        // console.log(connectedContract);
        // // This is what calls our connected contract
        // let nftTxn = await connectedContract.mintNFT(currentAccount, "sending money to mint")

        // console.log("Mining...please wait.")
        // await nftTxn.wait();

        // console.log(`Mined, see transaction: https://ropsten.etherscan.io/tx/${nftTxn.hash}`);

        const web3 = new Web3(ethereum);
        const id = await web3.eth.net.getId();
        // const deployedNetwork = MyNFT.networks[id];
        const contract = new web3.eth.Contract(MyNFT, CONTRACT_ADDRESS);
        const addresses = await web3.eth.getAccounts();
        contract.methods.mintNFT(currentAccount, "testing Web3!").send({from:currentAccount, value:amountToSend}).then( function( info ) { 
          console.log("mint info: ", info);
          console.log("token ID is ", info.events.Transfer.returnValues.tokenId);
        });    

        // getMints();

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  })

  /*----------------------MINT SUPPLY & CURRENT---------------------------*/
 // OCTOPUS FUN: KEEP THIS
  /* Get current number of mints*/
  const getMints = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        console.log("ETHEREUM READY TO MINT")
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT.abi, signer);
        const currentMints = await connectedContract.mint(); 
        setCurrentMints(currentMints.toNumber());
      } 
    } catch (error) {
    console.log(error)
    }
  }, [setCurrentMints]);

  // OCTOPUS FUN: KEEP THIS
  /* Gets total mint supply */ 
  const getTotalPlayers = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT.abi, signer);
        const totalPlayers = await connectedContract.getMaxTotalSupply();
        setTotalPlayers(totalPlayers.toNumber());
      } 
    } catch (error) {
    console.log(error)
    }
  }, [setTotalPlayers]);

  /* List of pending functions to connect based on smart contract */ 

  // const getNumberOfAlivePlayers = () => {
  //   // Returns # of living players
  // }

  // const checkWinnerAndPayout = () => {
  //   // Returns current round - use same logic from mint supply
  // }

  /*----------------------SET & PLAY ROUNDS---------------------------*/

  const setRound = () => {
    var dateRound1 = new Date('2021-10-20T10:00:00');
    var dateRound2 = new Date('2021-10-22T10:00:00');
    var dateRound3 = new Date('2021-10-23T10:00:00');
    var dateRound4 = new Date('2021-10-24T10:00:00');
    var dateRound5 = new Date('2021-10-25T10:00:00');
    var dateRound6 = new Date('2021-10-26T10:00:00');
    var endDate = new Date('2021-10-27T10:00:00')
    var dateNow = new Date('2021-10-23T11:00:00');
    if (dateNow >= dateRound1 && dateNow < dateRound2) {
      console.log("CURRENT NOW", dateNow); 
      console.log("DATEROUND1", dateRound1);
      console.log("TRUE OR FALSE", dateNow > dateRound1);
      setCurrentRound(1);
    }
    else if (dateNow >= dateRound2 && dateNow < dateRound3) {
      setCurrentRound(2);
    }
    else if (dateNow >= dateRound3 && dateNow <dateRound4) {
      setCurrentRound(3);
    }
    else if (dateNow >= dateRound4 && dateNow <dateRound5) {
      setCurrentRound(4);
    }
    else if (dateNow >= dateRound5 && dateNow <dateRound6) {
      setCurrentRound(5);
    }
    else if (dateNow >= dateRound6 && dateNow <endDate) {
      setCurrentRound(6);
    }
    else { 
      setCurrentRound(0);
    }
  } 

  const playRound = () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT.abi, signer);
        console.log("Connected Contract", connectedContract);
        if (currentRound===1) {
          console.log("WE ENTEREED CURRENT ROUND 1", currentRound);
          // const playRound1 = await connectedContract.playRound1();
        }
        else if (currentRound===2) {
          console.log("currentRound",currentRound);
        }
        else if (currentRound===3) {
          console.log("currentRound",currentRound);
        }
        else if (currentRound===4) {
          console.log("currentRound",currentRound);
        }
        else if (currentRound===5) {
          console.log("curretnRound",currentRound);
        }
        else if (currentRound===6) {
          console.log("curretnRound",currentRound);
        }
        // For the "play round" button
        // Assuming the player has the existing NFT AND is alive to see the "Play Round" button AND after the game is open AND the current round is open 

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  /*----------------------TIMER---------------------------*/

  const afterCountdownTimer = () => {
    var mintTimer = new Date(MINT_DATE);
    var now = new Date().getTime();
    var timeleft = mintTimer - now;
    if (timeleft > 0) {
      setGameOpen(false);
    } else {
      setGameOpen(true);
    }
  }

  // We need ref in this, because we are dealing
  // with JS setInterval to keep track of it and
  // stop it when needed
  const Ref = useRef(null);

  // The state for our timer
  const [timer, setTimer] = useState();

  const getTimeRemaining = (e) => {
        const total = Date.parse(e) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 * 60 * 60) % 24);
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        return {
            total, days, hours, minutes, seconds
    };
  }

  const startTimer = (e) => {
    let { total, days, hours, minutes, seconds } 
                = getTimeRemaining(e);
    if (total >= 0) {

        // update the timer
        // check if less than 10 then we need to 
        // add '0' at the begining of the variable
        setTimer(
            (days > 9 ? days : '0' + days) + ' Days ' +
            (hours > 9 ? hours : '0' + hours) + ' Hours ' +
            (minutes > 9 ? minutes : '0' + minutes) + ' Minutes '
            + (seconds > 9 ? seconds : '0' + seconds) + ' Seconds'
        )
    }
  }

  const clearTimer = (e) => {
    // If you adjust it you should also need to
    // adjust the Endtime formula we are about
    // to code next    
    setTimer('00 Days 00 Hours 00 Minutes 00 Seconds');

    // If you try to remove this line the 
    // updating of timer Variable will be
    // after 1000ms or 1sec
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
        startTimer(e);
    }, 1000)
    Ref.current = id;
  }

  const getDeadTime = () => {
      var mintTimer = new Date(MINT_DATE);

      return mintTimer;
  }

  /*
  * This runs our function when the page loads.
  */

  useEffect(() => {
    clearTimer(getDeadTime());
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    setRound();
  }, [])

  useEffect(() => {
    afterCountdownTimer();
  }, [])

  // useEffect(() => {
  //   getTotalPlayers()
  // }, [getTotalPlayers])

  useEffect(() => {
    getMints()
  }, [getMints])


  // Set up Image
  const setImage = () => {
    // some logic here with the contract IPFS
    img_file = "https://gateway.pinata.cloud/ipfs/QmZWLjdRN5HXTSraEkhM1MSTZxNifjrssmr3dJM4JMSeuS";
  }

  useEffect(() => {
    setImage();
  }, [])

  // Render Methods
  const renderNotConnectedContainer = () => (
    <div className="walletUI">
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect to Wallet
      </button>
      <br></br>
      <p className="sub-text">{currentMints} / {totalPlayers}</p> 
    </div>
  );

  const renderMintUI = () => (
    <div className="mintUI">
      <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
        Mint me an Octopus
      </button>
      <br></br>
      <p className="sub-text">{currentMints} / {totalPlayers}</p> 
    </div>
  )

  const renderPlayGame = () => (
    <div className="body-container">
        <p className="header gradient-text"> Time to play </p> 
        <br></br>
        <button onClick={playRound} className="cta-button connect-wallet-button">Play Round</button>
    </div> 
  )

  function renderContent() {
    if (gameOpen) {
      if (currentAccount) {
        return renderPlayGame();
      }
      return renderNotConnectedContainer();
    } else {
      if (currentAccount) {
        return renderMintUI();
      } else {
        return renderNotConnectedContainer();
      }
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Octopus Game</p>
          <p className="sub-text">
            456 Octopus. 6 Rounds. 1 Massive Prize. Will you survive?
          </p>
          <h2 className="timer">{timer}</h2>
        </div>
        <div className="box">
          <img src={img_file} />
        </div>
        <br></br>
        <div> 
          {renderContent()}
        </div>
        <br></br>
        <br></br>
    </div>
  </div>
  );
};
export default App;
