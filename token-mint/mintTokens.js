const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Read the compiled contract artifacts
const contractArtifacts = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'TestToken.json'), 'utf8')
);

async function main() {
    if (!process.env.CONTRACT_ADDRESS) {
        console.error('Please set CONTRACT_ADDRESS in your .env file');
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider('https://eth-sepolia.public.blastapi.io');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Get contract instance using the compiled ABI
    const tokenContract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        contractArtifacts.abi,
        wallet
    );

    try {
        // Verify we're the owner
        const owner = await tokenContract.owner();
        if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
            throw new Error('Wallet is not the owner of the contract');
        }

        // Get initial balance
        const recipient = '0x07335f37009ad3a5EFF7785Ce7fdD1344FdD4197';
        const decimals = await tokenContract.decimals();
        const initialBalance = await tokenContract.balanceOf(recipient);
        console.log('Initial balance:', ethers.formatUnits(initialBalance, decimals));

        // Mint tokens
        const amount = ethers.parseUnits('1000000', decimals); // 1 million tokens with 6 decimals
        console.log('Minting tokens...');
        const tx = await tokenContract.mint(recipient, amount);
        await tx.wait();
        console.log(
            `Successfully minted ${ethers.formatUnits(amount, decimals)} tokens to ${recipient}`
        );

        // Verify final balance
        const finalBalance = await tokenContract.balanceOf(recipient);
        console.log('Final balance:', ethers.formatUnits(finalBalance, decimals));
    } catch (error) {
        console.error('Error:', error.message);
        if (error.data) {
            console.error('Error data:', error.data);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
