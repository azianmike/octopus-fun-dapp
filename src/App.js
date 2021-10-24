import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import symbols from './assets/symbols.png';
import squid from './assets/squid.png';
import loading from './assets/loading.gif';
import death from './assets/round1.jpeg';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { ethers } from "ethers";
import MyNFT from './utils/MyNFT.json';
import IPFS from './utils/ipfs.json';
import Web3 from 'web3';

// Constants
const TWITTER_HANDLE = '__mikareyes';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/your-snooty-coffee-order-g0czizq92i';
const TOTAL_MINT_COUNT = 456;
const CONTRACT_ADDRESS = "0x1E81482f1C9e91b2c9633f8Bd18D55E61e69DE32"; // Change Address

const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(process.env.REACT_APP_PINATA_API_KEY, process.env.REACT_APP_PINATA_SECRET);

// Dates are set as the END of that round
const MINT_DATE = new Date("2021-10-22T19:00:00").getTime();
var dateRound1 = new Date('2021-10-25T10:00:00').getTime();
var dateRound2 = new Date('2021-10-25T10:00:00').getTime();
var dateRound3 = new Date('2021-10-25T10:00:00').getTime();
var dateRound4 = new Date('2021-10-25T10:00:00').getTime();
var dateRound5 = new Date('2021-10-25T10:00:00').getTime();
var dateRound6 = new Date('2021-10-25T10:00:00').getTime();
var dateNow = new Date().getTime();

const getDeadTime = (currentRound) => {
    var mintTimer = MINT_DATE;
    if (currentRound == 1) {
      mintTimer = dateRound1;
    } else if (currentRound == 2) {
      mintTimer = dateRound2;
    } else if (currentRound == 3) {
      mintTimer = dateRound3;
    } else if (currentRound == 4) {
      mintTimer = dateRound4;
    } else if (currentRound == 5) {
      mintTimer = dateRound5;
    } else if (currentRound == 6) {
      mintTimer = dateRound6;
    }
    return mintTimer;
}

const App = () => {
  /*
    * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
    */
  const [currentAccount, setCurrentAccount] = useState("");
  const [gameOpen, setGameOpen] = useState(false);
  const [totalPlayers, setTotalPlayers] = useState();
  const [currentRound, setCurrentRound] = useState(0); 
  const [currentMints, setCurrentMints] = useState();
  const [deadOrAlive, setDeadOrAlive] = useState(false);
  const [hasNFT, setNFT] = useState(false);
  const [timer, setTimer] = useState("loading");
  const [tokenURI, setTokenURI] = useState();
  const [playRoundLoading, setPlayRoundLoading] = useState(false);
  const [userRound, setUserRound] = useState(1);
  const [img_file, setImageFile] = useState();

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
      // console.log("We have the ethereum object", ethereum);
      // console.log("We have the ethereum object", ethereum);
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
          // console.log("Found an authorized account:", account);
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
        // console.log("Connected Contract", connectedContract);
        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!

        // connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        //   console.log("From, tokenId", from, tokenId.toNumber());
        //   console.log("Inside connected contract WOOT WOOT");
        //   alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        // });

        // console.log("Setup event listener!")

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
        var ipfs_uri = IPFS[currentMints];
        console.log(ipfs_uri);
        console.log("currentaccount", currentAccount);
        contract.methods.mintNFT(currentAccount, ipfs_uri).send({from:currentAccount, value:amountToSend}).then( function( info ) { 
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

    /*----------------------MINT---------------------------*/
  const checkIfWinnerAndPayout = useCallback(async () => {
    // This function doesn't yet work
    try {
      const { ethereum } = window;
      if (ethereum) {

        const web3 = new Web3(ethereum);
        const id = await web3.eth.net.getId();
        // const deployedNetwork = MyNFT.networks[id];
        const contract = new web3.eth.Contract(MyNFT, CONTRACT_ADDRESS);
        const addresses = await web3.eth.getAccounts();
        contract.methods.checkIfWinnerAndPayout(currentAccount).send({from:currentAccount}).then( function( info ) { 
          console.log("checkIfWinnerAndPayout info: ", info);
        });    

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
        // console.log("ETHEREUM READY TO MINT");
        const web3 = new Web3(ethereum);
        const id = await web3.eth.net.getId();
        // const deployedNetwork = MyNFT.networks[id];
        const contract = new web3.eth.Contract(MyNFT, CONTRACT_ADDRESS);
        const addresses = await web3.eth.getAccounts();
        const currentMints = await contract.methods.aliveNFTCount().call();
        // const provider = new ethers.providers.Web3Provider(ethereum);
        // const signer = provider.getSigner();
        // const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT, signer);
        // console.log(connectedContract);
        // const currentMints = await connectedContract.aliveNFTCount(); 
        // console.log(currentMints);
        setCurrentMints(currentMints);
      } 
    } catch (error) {
    console.log(error)
    }
  }, [setCurrentMints]);

  // OCTOPUS FUN: KEEP THIS
  /* Gets total mint supply */ 
  const getTotalPlayers = () => {
    setTotalPlayers(456);
  }

  /* Get current round of player*/
  const getUsersCurrentRound = useCallback(async () => {
    if (currentAccount) {
        try {
        const { ethereum } = window;
        if (ethereum) {
          // console.log("ETHEREUM READY TO MINT");
          const web3 = new Web3(ethereum);
          const contract = new web3.eth.Contract(MyNFT, CONTRACT_ADDRESS);
          const currentMints = contract.methods.aliveNFTs(currentAccount).call().then(function( uRound ) { 
              if (uRound == 0) {
                setUserRound(0);
              } else {
                setUserRound(uRound);
              }
          });
        } 
      } catch (error) {
        console.log(error)
      }
    }
  });

  /*----------------------Check if player has an alive NFT---------------------------*/
 // OCTOPUS FUN: KEEP THIS
  /* Get current number of mints*/
  const checkIfDeadOrAlive = useCallback(async () => {
    if (currentAccount) {
      try {
        const { ethereum } = window;
        if (ethereum) {
          const web3 = new Web3(ethereum);
          const id = await web3.eth.net.getId();
          // const deployedNetwork = MyNFT.networks[id];
          const contract = new web3.eth.Contract(MyNFT, CONTRACT_ADDRESS);
          const addresses = await web3.eth.getAccounts();
          // console.log("Current account is " + currentAccount);
          const currentMints = await contract.methods.checkIfPlayerIsAlive(addresses[0]).call().then(function( deadOrAliveFromContract ) { 
            setDeadOrAlive(deadOrAliveFromContract);
          });
        } 
      } catch (error) {
      console.log(error)
      }
    }
  });

  // OCTOPUS FUN: KEEP THIS
  /* Gets total mint supply */ 
  // const getTotalPlayers = () => {
  //   setTotalPlayers(456);
  // }

  /* List of pending functions to connect based on smart contract */ 

  // const getNumberOfAlivePlayers = () => {
  //   // Returns # of living players
  // }

  // const checkWinnerAndPayout = () => {
  //   // Returns current round - use same logic from mint supply
  // }

  /*----------------------SET ROUND---------------------------*/

  const setRound = () => {
    if (dateNow >= MINT_DATE && dateNow < dateRound1) {
      console.log("set round 1");
      setCurrentRound(1);
    }
    else if (dateNow >= dateRound1 && dateNow < dateRound2) {
      console.log("set round 2");
      setCurrentRound(2);
    }
    else if (dateNow >= dateRound2 && dateNow <dateRound3) {
      console.log("set round 3");
      setCurrentRound(3);
    }
    else if (dateNow >= dateRound3 && dateNow <dateRound4) {
      console.log("set round 4");
      setCurrentRound(4);
    }
    else if (dateNow >= dateRound4 && dateNow <dateRound5) {
      console.log("set round 5");
      setCurrentRound(5);
    }
    else if (dateNow >= dateRound5 && dateNow <dateRound6) {
      console.log("set round 6");
      setCurrentRound(6);
    }
    else { 
      // console.log("set round 0");
      setCurrentRound(1);
    }
  } 

  /*---------------------Get TokedID from Address--------------------*/

  const grabtokenURI = useCallback(async () => {
    if (deadOrAlive) {
      try {
        const { ethereum } = window;
        if (ethereum) {
          const web3 = new Web3(ethereum);
          const id = await web3.eth.net.getId();
          const contract = new web3.eth.Contract(MyNFT, CONTRACT_ADDRESS);
          const addresses = await web3.eth.getAccounts();
          // console.log(currentAccount);
          const contracttokenURI = await contract.methods.getTokenURIFromAddress(currentAccount).call();
          // const provider = new ethers.providers.Web3Provider(ethereum);
          // const signer = provider.getSigner();
          // const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT, signer);
          // console.log(connectedContract);
          // const currentMints = await connectedContract.aliveNFTCount(); 
          // console.log("up next is the token");
          // console.log(contracttokenURI);
          setTokenURI(contracttokenURI);
        } 
      } catch (error) {
        console.log(error)
      }
    }
});

  /*----------------------PLAY ROUND---------------------------*/
  const playRound = () => {
    console.log("inside play round");
    try {
      const { ethereum } = window;
      if (ethereum) {
        console.log("inside if");
        // const provider = new ethers.providers.Web3Provider(ethereum);
        // const signer = provider.getSigner();
        // const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyNFT.abi, signer);

        const web3 = new Web3(ethereum);
        const contract = new web3.eth.Contract(MyNFT, CONTRACT_ADDRESS);
        console.log("Connected Contract", contract);

        console.log("current accont", currentAccount)
        console.log("current round", currentRound)
        const addresses = web3.eth.getAccounts();
        var ipfs_uri = IPFS[currentMints];
        if (currentRound===1) {
          console.log("playing round 1");
          setPlayRoundLoading(true);
          contract.methods.playRound1(currentAccount).send({from:currentAccount}).then( function( info ) { 
            console.log("return is : ", info);
            // Call function to check if player is dead or alive
            checkIfDeadOrAlive();
            getUsersCurrentRound();
            setPlayRoundLoading(false);
          }); 

        }
        else if (currentRound===2) {
          console.log("playing round 2");
          setPlayRoundLoading(true);
          contract.methods.playRound2(currentAccount).send({from:currentAccount}).then( function( info ) { 
            console.log("return is : ", info);
            // Call function to check if player is dead or alive
            checkIfDeadOrAlive();
            getUsersCurrentRound();
            setPlayRoundLoading(false);
          }); 
        }
        else if (currentRound===3) {
          console.log("playing round 3");
          setPlayRoundLoading(true);
          contract.methods.playRound3(currentAccount).send({from:currentAccount}).then( function( info ) { 
            console.log("return is : ", info);
            // Call function to check if player is dead or alive
            checkIfDeadOrAlive();
            getUsersCurrentRound();
            setPlayRoundLoading(false);
          }); 
        }
        else if (currentRound===4) {
          console.log("playing round 4");
          setPlayRoundLoading(true);
          contract.methods.playRound4(currentAccount).send({from:currentAccount}).then( function( info ) { 
            console.log("return is : ", info);
            // Call function to check if player is dead or alive
            checkIfDeadOrAlive();
            getUsersCurrentRound();
            setPlayRoundLoading(false);
          }); 
        }
        else if (currentRound===5) {
          console.log("playing round 5");
          setPlayRoundLoading(true);
          contract.methods.playRound5(currentAccount).send({from:currentAccount}).then( function( info ) { 
            console.log("return is : ", info);
            // Call function to check if player is dead or alive
            checkIfDeadOrAlive();
            getUsersCurrentRound();
            setPlayRoundLoading(false);
          }); 
        }
        else if (currentRound===6) {
          console.log("playing round 6");
          setPlayRoundLoading(true);
          contract.methods.playRound6(currentAccount).send({from:currentAccount}).then( function( info ) { 
            console.log("return is : ", info);
            // Call function to check if player is dead or alive
            checkIfDeadOrAlive();
            getUsersCurrentRound();
            setPlayRoundLoading(false);
          }); 
        }
        // For the "play round" button
        // Assuming the player has the existing NFT AND is alive to see the "Play Round" button AND after the game is open AND the current round is open 

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
      setPlayRoundLoading(false);
    }
  }

  /*----------------------MINT TIMER---------------------------*/

  const haveWeMinted = () => {
    var mintTimer = MINT_DATE;
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

  const getTimeRemaining = (e) => {
        const total = e - (new Date().getTime());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
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
            (days > 9 ? days : '0' + days) + 'd ' +
            (hours > 9 ? hours : '0' + hours) + 'h ' +
            (minutes > 9 ? minutes : '0' + minutes) + 'm '
            + (seconds > 9 ? seconds : '0' + seconds) + 's '
        )
    }
  }

  const clearTimer = (e) => {
    // If you adjust it you should also need to
    // adjust the Endtime formula we are about
    // to code next    
    // If you try to remove this line the 
    // updating of timer Variable will be
    // after 1000ms or 1sec
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
        startTimer(e);
    }, 1000)
    Ref.current = id;
  }

  /*
  * This runs our function when the page loads.
  */

  useEffect(() => {
    setRound();
    haveWeMinted();
    clearTimer(getDeadTime(currentRound));
  }, [currentRound, clearTimer])

  useEffect(() => {
    getTotalPlayers()
  }, [getTotalPlayers])

  useEffect(() => {
    checkIfWalletIsConnected();
    getMints();
    getUsersCurrentRound();
    checkIfDeadOrAlive();
    grabtokenURI();
    setImage();
  })

  // Set up Image
  const setImage = () => {
    // some logic here with the contract IPFS
    // img_file = " https://gateway.pinata.cloud/ipfs/QmWy46X5QpVA4DEVtPebddD4cBmKvCES1um6yCo1G7PuKE";
    if (!gameOpen && !deadOrAlive) { // if game hasn't started, and user is dead (doesn't have squid), show them the next squid that they'd mint
      setImageFile(IPFS[currentMints]);
    } else if (!gameOpen && deadOrAlive) { // if game hasn't started, and user has a squid, show them their squid.
      setImageFile(tokenURI);
    } else if (gameOpen && !deadOrAlive) { // game has started and their squid has died, show them the death image.
      setImageFile(death);
    } else if (gameOpen && deadOrAlive) { // game has started and their squid is alive, show them their squid.
      setImageFile(tokenURI);
    } else {
      setImageFile(squid);
    }
  }

  // function renderContent() {
  //   if (gameOpen) {
  //     if (currentAccount) {
  //       return renderPlayGame();
  //     } else {
  //       return renderNotConnectedContainer();
  //     }
  //   } else {
  //     if (currentAccount) {
  //       if (tokenURI) {
  //         return renderNoMintUI();
  //       } else {
  //         return renderMintUI();
  //       }
  //     } else {
  //       return renderNotConnectedContainer();
  //     }
  //   }
  // }

  // Render Methods
  const renderNotConnectedContainerPreGame = () => (
    <div className="top">
      <div className="topLeft">
        <img className="squidTop" src={img_file} />
      </div>
      <div className="topRight">
        <p className="header gradient-text">Octopus Game</p>
        <p className={timerClass}>{timer}</p>
        <p className="sub-text">until minting ends</p>
        <div className="walletUI">
          <button onClick={connectWallet} className="cta-button connect-wallet-button">
            Connect to Wallet
          </button>
          <br></br>
          <p className="sub-text">{currentMints} Minted / {totalPlayers} Remaining </p>  
        </div>
      </div>
    </div>
  );

  const renderNotConnectedContainerPostGame = () => (
    <div className="top">
      <div className="topLeft">
        <img className="squidTop" src={img_file} />
      </div>
        <div className="topRight">
          <p className="header gradient-text">Octopus Game</p>
          <p className={timerClass}>{timer}</p>
          <p className="sub-text">until end of round</p>
          <div className="walletUI">
            <button onClick={connectWallet} className="cta-button connect-wallet-button">
              Connect to Wallet to Play
            </button>
          </div>
        </div>
    </div>
  );

  const renderMintUI = () => (
    <div className="top">
      <div className="topLeft">
        <img className="squidTop" src={img_file} />
      </div>
      <div className="topRight">
        <p className="header gradient-text">Octopus Game</p>
        <p className={timerClass}>{timer}</p>
        <p className="sub-text">until minting ends</p>
        <div className="mintUI">
          <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
            Mint me an Octopus
          </button>
          <br></br>
          <p className="sub-text">{currentMints} Minted / {totalPlayers} Remaining </p> 
        </div>
      </div>
    </div>
  )

  const renderGameLoadingUI = () => (
    <div className="top">
      <div className="topLeft">
        <img className="squidTop" src={loading} />
      </div>
      <div className="topRight">
        <p className="header gradient-text">Thanks for playing.</p>
        <p className="sub-text">We are deliberating your fate...</p>
      </div>
    </div>
  )

  const renderNoMintUI = () => (
    <div className="top">
      <div className="topLeft">
        <img className="squidTop" src={img_file} />
      </div>
      <div className="topRight">
        <p className="header gradient-text">Octopus Game</p>
        <p className={timerClass}>{timer}</p>
        <p className="sub-text">until minting ends</p>
        <div className="mintUI">
          <button className="cta-button no-mint">
            1 Octopus per person. You already have one!
          </button>
          <br></br>
          <p className="sub-text">{currentMints} Minted / {totalPlayers} Remaining </p> 
        </div>
      </div>
    </div>
  )

  const renderDeadScreen = () => (
    <div className="top">
      <div className="topLeft">
        <img className="squidTop" src={img_file} />
      </div>
      <div className="topRight">
        <p className="header gradient-text">You were eliminated.</p>
        <p className="sub-text">Thanks for playing! Bye!</p>
      </div>
    </div>
  )

  const renderAliveScreen = () => (
    <div className="top">
      <div className="topLeft">
        <img className="squidTop" src={img_file} />
      </div>
      <div className="topRight">
        <p className="header gradient-text">You survived {currentRound}.</p>
        <p className="sub-text">Check back soon for the next round.</p>
      </div>
    </div>
  )

  const renderDeadDueToMissingRound = () => (
    <div className="top">
      <div className="topLeft">
        <img className="squidTop" src={img_file} />
      </div>
      <div className="topRight">
        <p className="header gradient-text">You were eliminated.</p>
        <p className="sub-text">Because you missed the previous round. Bye.</p>
      </div>
    </div>
  )

  const renderWinningScreen = () => (
    <div className="top">
      <div className="topLeft">
        <img className="squidTop" src={img_file} />
      </div>
      <div className="topRight">
        <p className="header gradient-text">You... won!</p>
        <p className="sub-text">Ready to claim your winnings?</p>
        <div className="mintUI">
          <button onClick={checkIfWinnerAndPayout} className="cta-button connect-wallet-button">
            Claim the pot
          </button>
          <br></br>
          <p className="sub-text">{currentMints} Minted / {totalPlayers} Remaining </p> 
        </div>
      </div>
    </div>
  )

  const renderPlayGame = () => (
    <div className="top">
      <div className="topLeft">
        <img className="squidTop" src={img_file} />
      </div>
      <div className="topRight">
        <p className="header gradient-text">Octopus Game</p>
        <p className={timerClass}>{timer}</p>
        <p className="sub-text">until end of round</p>
        <div className="body-container">
            <br></br>
            <button onClick={playRound} className="cta-button connect-wallet-button">Play Round</button>
        </div> 
      </div>
    </div>
  )

  function renderContent() {

    if (playRoundLoading) {
      return renderGameLoadingUI();
    } else if (gameOpen && userRound != 0) {
      if (currentAccount) {
        if (userRound == 7) {
          // winning screen UI #8
          return renderWinningScreen();
        } else if (userRound > 8) {
          // render dead UI #7
          return renderDeadScreen();
        } else if (userRound == currentRound) {
          return renderPlayGame(); // view #5
        } else if (userRound > currentRound && userRound < 7) {
          // render alive UI #6
          console.log("user round " + userRound)
          console.log("current round " + currentRound)
          return renderAliveScreen();
        } else {
          // you missed a round... UI #9
          return renderDeadDueToMissingRound();
        }
      } else {
        return renderNotConnectedContainerPostGame(); // view #4
      }
    } else if (currentAccount) {
        if (tokenURI) {
          return renderNoMintUI(); // view #3
        } else {
          return renderMintUI(); // view #2
        }
    } else {
        return renderNotConnectedContainerPreGame(); // view #1
    }
  }

  let timerClass = "timer"
  if (timer === "loading") {
    timerClass = "timer timer-invisible"
  }

  return (
    <div className="App">
      <div className="container">
        
          <div className="menu">
            <div className="menuItems">How to Play</div>
            <div className="menuItems">Team</div>
            <div className="menuItems">FAQ</div>
          </div>
          {renderContent()}
          <div className="overview"> 
            <img className="overviewCircle" src={squid}></img>
            <div className="overviewBox">
              <p className="header gradient-text">How to Play</p>
              <div className="overviewInstructions">
                <p className="overviewText">1. Mint your NFT. Each minter puts 0.1ETH into the prize pool. Minting for SPC happens from <b>X/X/2021 00:00AM - X/X/2021 00:00PM.</b></p>
                <p className="overviewText">2. When each round opens, click "Play Game" to get your octopus to compete. Your octopus will either win (in which case you can mint in future rounds) or get eliminated.</p>
                <p className="overviewText">3. All players will keep playing for <b>6 rounds</b>. Each round lasts for <b>24 hours.</b></p>
                <p className="overviewText">4. The last player(s) standing will <b>split the pot of ETH.</b></p>
              </div>
            </div>
          </div>
          <div className="faq"> 
            <p className="header gradient-text">FAQs</p>
            <div className="faqItem">
              <img src={symbols} className="symbols"></img>
              <div className="faqQuestion">When is mint day? </div>
              <div className="faqAnswer">For the first round (South Park Commons only), mint start will be on October 25, 2021, Monday. The countdown timer above will reflect mint start. </div>
            </div>
            <div className="faqItem">
              <img src={symbols} className="symbols"></img>
              <div className="faqQuestion">How long does each round last? </div>
              <div className="faqAnswer">Each round lasts for a day. You need to 'Play Round' while the round is open to be counted. If you do not 'Play Round', your Octopus will die automatically.
              <br/>Round 1 is from Oct 25 12am - 11:59pm
              <br/>Round 2 is from Oct 26 12am - 11:59pm
              <br/>Round 3 is from Oct 27 12am - 11:59pm
              <br/>Round 4 is from Oct 28 12am - 11:59pm
              <br/>Round 5 is from Oct 29 12am - 11:59pm
              <br/>Round 6 is from Oct 30 12am - 11:59pm
              </div>
            </div>
            <div className="faqItem">
              <img src={symbols} className="symbols"></img>
              <div className="faqQuestion">How much money is in the pot?</div>
              <div className="faqAnswer">The pot is dependent on the number of people that play and how many people will win. Given each mint is 0.1 ETH, let's assume maximum amount of players mint, hence the maximum amount in the pot is 45.6 ETH. </div>
            </div>
            <div className="faqItem">
              <img src={symbols} className="symbols"></img>
              <div className="faqQuestion">Can there be more than one winner?</div>
              <div className="faqAnswer">Yes. At the end of the 6 rounds, all the winners left standing will divvy up the prize money. </div>
            </div>
          </div>
          <div className="footer"> 
            Follow us on Twitter and Discord. 
          </div>
        <br></br>
        <br></br>
        <br></br>
    </div>
  </div>
  );
};
export default App;
