import React from 'react';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi';
import { abi } from '../contract-abi';
import FlipCard, { BackCard, FrontCard } from '../components/FlipCard';
import { ethers } from 'ethers';

const contractConfig = {
  address: '0x42E16675C793A35009269a4DA7BE1B3E2893F0b1',
  abi,
} as const;

const Home: NextPage = () => {
  const [mounted, setMounted] = React.useState(false);
  const [tokenAmount, setTokenAmount] = React.useState('');
  const [totalMinted, setTotalMinted] = React.useState('');
  const [multiAddress, setMultipleAddress] = React.useState<string[]>([]);
  const [receiversAdd, setReceiversAdd] = React.useState('')
  const { isConnected, address } = useAccount();
  const { data, isError, isLoading } = useBalance({
    address,
  })
  React.useEffect(() => setMounted(true), []);


  const { config: contractWriteConfig } = usePrepareContractWrite({
    address: '0x42E16675C793A35009269a4DA7BE1B3E2893F0b1',
    abi,
    functionName: 'mint',
  });

  const {
    data: mintData,
    write: mint,
    isLoading: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useContractWrite({
    address: '0x42E16675C793A35009269a4DA7BE1B3E2893F0b1',
    abi,
    functionName: 'mint',
  });

  const {
    data: transferData,
    write: transfer,
    isLoading: isTransferLoading,
    isSuccess: isTransferStarted,
    error: transferError,
  } = useContractWrite({
    address: '0x42E16675C793A35009269a4DA7BE1B3E2893F0b1',
    abi,
    functionName: 'transfer',
  });

  const { data: totalSupplyData } = useContractRead({
    ...contractConfig,
    functionName: 'totalSupply',
    watch: true,
  });

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const {
    data: trxData,
    isSuccess: transferSuccess,
    error: trxError,
  } = useWaitForTransaction({
    hash: transferData?.hash,
  });

  React.useEffect(() => {
    if (totalSupplyData) {
      let supply = ethers.formatEther(totalSupplyData.toString())
      setTotalMinted(supply);
    }
  }, [totalSupplyData]);

  const handleInputChange = (e: any) => {
    setTokenAmount(e.target.value);
  };

  const handleMintClick = async () => {
    // Add your logic here for what should happen when the "Mint" button is clicked
    console.log('Mint button clicked with input value:', tokenAmount);
    await mint({ args: [address, ethers.parseEther(tokenAmount)] })

  };

  const handleTransfer = async () => {
    // Add your logic here for what should happen when the "Mint" button is clicked
    await transfer({ args: [receiversAdd, ethers.parseEther('1')] })

  };
  const handleMultiTransfer = async () => {
    // Add your logic here for what should happen when the "Mint" button is clicked
    multiAddress?.map(async(item)=>{
      if(item !== '')
        await transfer({ args: [item, ethers.parseEther('1')] })
    })

  };

  const isMinted = txSuccess;
  
  const transactionData = txSuccess ? mintData: transferData

  return (
    <div className="page">
      <div className="container">
        <div style={{ flex: '1 1 auto' }}>
          <div style={{ padding: '24px 24px 24px 0' }}>
            <h1>Token Mint Demo</h1>
            <p style={{ margin: '12px 0 24px' }}>
              {Number(totalMinted)} minted so far!
            </p>
            <ConnectButton />

            {mintError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {mintError.message}
              </p>
            )}
            {txError && (
              <p style={{ marginTop: 24, color: '#FF6257' }}>
                Error: {txError.message}
              </p>
            )}

            {mounted && isConnected && (
              <><input
                type="number"
                placeholder="Enter Amount"
                value={tokenAmount}
                onChange={handleInputChange} />
                <button
                  style={{ marginTop: 24 }}
                  disabled={!mint || isMintLoading || isMintStarted}
                  className="button"
                  data-mint-loading={isMintLoading}
                  data-mint-started={isMintStarted}
                  onClick={handleMintClick}
                >
                  {isMintLoading && 'Waiting for approval'}
                  {isMintStarted && 'Minting...'}
                  {isMinted || (!isMintLoading && !isMintStarted) && 'Mint'}
                </button>
                <div style={{margin:'1rem 0 1rem',fontWeight:'bold'}}>
                Balance: <span style={{color:'red'}}>{data?.formatted} {data?.symbol}</span>
              </div>
              <div style={{margin:'1rem 0 1rem'}}>
              <input
                type="text"
                placeholder="Enter receivers address"
                value={receiversAdd}
                onChange={(e)=>{
                  let add = e?.target?.value
                  setReceiversAdd(add);
                }} />
                <button className="button" onClick={handleTransfer}>
                {isTransferLoading && 'Waiting for approval'}
                  {isTransferStarted && 'Transferring...'}
                  {transferSuccess || (!isTransferLoading && !isTransferStarted) && 'Transfer'}
                  </button>
              </div>
              <div style={{display:'flex',alignContent:'center'}}>
                <textarea
                  placeholder='Enter Addresses'
                  onChange={(e)=>{
                    const add = e.target.value.split('\n');

                    setMultipleAddress(add);
                  }}
                />
                 <button className="button" onClick={handleMultiTransfer}>
                {isTransferLoading && 'Waiting for approval'}
                  {isTransferStarted && 'Transferring...'}
                  {transferSuccess || (!isTransferLoading && !isTransferStarted) && 'Transfer'}

                  </button>
              </div>
                </>
            )}
          </div>
        </div>

        <div style={{ flex: '0 0 auto' }}>
          <FlipCard>
            <FrontCard isCardFlipped={isMinted}>
              <Image
                layout="responsive"
                src="/nft.png"
                width="500"
                height="500"
                alt="RainbowKit Demo"
              />
              <h1 style={{ marginTop: 24 }}>Token minting</h1>
              <ConnectButton />
            </FrontCard>
            <BackCard isCardFlipped={isMinted || transferSuccess}>
              <div style={{ padding: 24 }}>
                <Image
                  src="/nft.png"
                  width="80"
                  height="80"
                  alt="RainbowKit Demo"
                  style={{ borderRadius: 8 }}
                />
                <h2 style={{ marginTop: 24, marginBottom: 6 }}>{isMinted ?'Token Minted!':'Token Transferred!'}</h2>
                <p style={{ marginBottom: 24 }}>
                  Your Token will show up in your wallet in the next few minutes.
                </p>
                <p style={{ marginBottom: 6 }}>
                  View on{' '}
                  <a href={`https://sepolia.etherscan.io/tx/${transactionData?.hash}`}>
                    Etherscan
                  </a>
                </p>
                <p>
                  View on{' '}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${txData?.to}/1`}
                  >
                    Opensea
                  </a>
                </p>
              </div>
            </BackCard>
          </FlipCard>
        </div>
      </div>
    </div>
  );
};

export default Home;
