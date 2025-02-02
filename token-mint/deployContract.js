const { ethers } = require('ethers');
require('dotenv').config();
const compile = require('./compile');

async function main() {
    // Compile the contract first
    console.log('Compiling contract...');
    const { abi, bytecode } = compile();

    console.log('Connecting to network...');
    const provider = new ethers.JsonRpcProvider('https://eth-sepolia.public.blastapi.io');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log('Deploying token contract...');

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const token = await factory.deploy();
    await token.waitForDeployment();

    const tokenContract = new ethers.Contract(token.target, abi, wallet);

    // Verify deployment
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const owner = await tokenContract.owner();

    console.log('\nDeployment successful!');
    console.log('Token contract deployed to:', token.target);
    console.log('Token Name:', name);
    console.log('Token Symbol:', symbol);
    console.log('Token Owner:', owner);
    console.log('\nSave this address to use it in mintTokens.js');
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
