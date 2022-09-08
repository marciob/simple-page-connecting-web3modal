import Head from "next/head";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { ethers, providers } from "ethers";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  // state to check if walletconnect is connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  // Web3 Modal reference, it will persists while the page is open
  const web3ModalRef = useRef();

  console.log("walletConnected state: ", walletConnected);

  // ENS state
  const [ens, setENS] = useState("");

  // state for the current connected address
  const [address, setAddress] = useState("");

  // it checks if the current connected address has an ENS
  const setENSOrAddress = async (address, web3Provider) => {
    // lookupAddress is a method from Ethersjs
    //it checks if the address has a ENS reserve record
    var _ens = await web3Provider.lookupAddress(address);

    //if there is an ENS reserve record, it sets as ENS state
    //if not, it sets as address state
    if (_ens) {
      setENS(_ens);
    } else {
      setAddress(address);
    }
  };

  const getProviderOrSigner = async () => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    const signer = web3Provider.getSigner();
    // Get the address associated to the signer which is connected to  MetaMask
    const address = await signer.getAddress();
    // Calls the function to set the ENS or Address
    await setENSOrAddress(address, web3Provider);
    return signer;
  };

  // connectWallet: Connects the MetaMask wallet
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner(true);
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // renderButton: Returns a button based on the state of the dapp
  const renderButton = () => {
    if (walletConnected) {
      return <div>Wallet connected: {address || ens}</div>;
    } else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Dapp</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome to the DAPP, {ens ? ens : address}!
          </h1>
          <div className={styles.description}>It's a Dapp page</div>
          {renderButton()}
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084;</footer>
    </div>
  );
}
