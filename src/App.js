import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { ethers } from "ethers";
import MyNFT from './utils/MyNFT.json';

// Constants
const TWITTER_HANDLE = '__mikareyes';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/your-snooty-coffee-order-g0czizq92i';
const TOTAL_MINT_COUNT = 456;
const CONTRACT_ADDRESS = "0x8eaBB76B750E0eAb8AE24808248d27c6c11c5bC6"; // Change Address
const MINT_DATE = "2021-10-24T19:00:00";

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

  // OCTOPUS FUN: KEEP THIS
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
  // OCTOPUS FUN: KEEP THIS
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
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        console.log("Inside setupEventListener, ethereum");
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        // Ethers is a library that helps our frontend talk to our contract. Provider is what we use to actually talk to ethereum nodes. We use nodes that Metamask provides
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT.abi, signer);
        // The above line is what actually creates the connection to contract; neesd abi and signer
        console.log(connectedContract);
        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log("From, tokenId", from, tokenId.toNumber());
          console.log("Inside connected contract WOOT WOOT");
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Set up Image
  const setImage = () => {
    // some logic here with the contract IPFS
    img_file = "https://gateway.pinata.cloud/ipfs/QmZWLjdRN5HXTSraEkhM1MSTZxNifjrssmr3dJM4JMSeuS";
  }

  useEffect(() => {
    setImage();
  }, [])

  const setRound = () => {
    console.log("CURRENT ROUND pre:", currentRound)
    var dateRound1 = new Date('2021-10-20T10:00:00');
    var dateRound2 = new Date('2021-10-22T10:00:00');
    var dateRound3 = new Date('2021-10-23T10:00:00');
    var dateRound4 = new Date('2021-10-24T10:00:00');
    var dateRound5 = new Date('2021-10-25T10:00:00');
    var dateRound6 = new Date('2021-10-26T10:00:00');
    var dateNow = new Date().getTime();

    if (dateNow > dateRound1) {
      setCurrentRound(1);
    }
    else if (dateNow > dateRound2) {
      setCurrentRound(2);
    }
    else if (dateNow > dateRound3) {
      setCurrentRound(3);
    }
    console.log("CURRENT ROUND post:", currentRound)
    // use currentRound results to render specific functions from contract
  } 

 // OCTOPUS FUN: KEEP THIS
  /* Get current number of mints*/
  const getMints = useCallback(async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT.abi, signer);
        const currentMints = await connectedContract.getCurrentMints(); 
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

  const playRound = () => {
    // const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT.abi, signer);
    if (currentRound=1) {
      // const playRound1 = await connectedContract.playRound1();
    }
    // For the "play round" button
    // Assuming the player has the existing NFT AND is alive to see the "Play Round" button AND after the game is open AND the current round is open 
  }

  const afterCountdownTimer = () => {
    /// CHARLES -> COUNTDOWN TIMER LOGIC
    // if (countdown time > 0) -> set as FALSE to hide the "time to play" secion
    // if (countdown time < 0) -> set as TRUE to show the "time to play"
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

  // We can use useEffect so that when the component
  // mount the timer will start as soon as possible

  // We put empty array to act as componentDid
  // mount only
  useEffect(() => {
      clearTimer(getDeadTime());
  }, []);

  // OCTOPUS FUN: KEEP THIS
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT.abi, signer);
        console.log("Going to pop wallet now to pay gas...")
        
        // This is what calls our connected contract
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        getMints();

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}
  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    setRound();
  }, [])

  useEffect(() => {
    afterCountdownTimer();
  }, [])

  useEffect(() => {
    getTotalPlayers()
  }, [getTotalPlayers])

  useEffect(() => {
    getMints()
  }, [getMints])


  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
      Mint me an Octopus
    </button>
  )

  const renderPlayGame = () => (
    <div className="body-container">
          <p className="header gradient-text"> Time to play </p> 
    </div> 
  )

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
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
           <p className="sub-text">{currentMints} / {totalPlayers}</p> 
        </div>
        {gameOpen === false ? <div></div> : renderPlayGame()}
    </div>
  </div>
  );
};
export default App;
