const fs = require('fs');
const solc = require('solc');
const path = require('path');

function findImports(importPath) {
    try {
        // Handle OpenZeppelin imports
        if (importPath.startsWith('@openzeppelin/')) {
            const npmPath = path.resolve(__dirname, 'node_modules', importPath);
            return {
                contents: fs.readFileSync(npmPath, 'utf8'),
            };
        }
        // Handle local imports
        const fullPath = path.resolve(__dirname, importPath);
        return {
            contents: fs.readFileSync(fullPath, 'utf8'),
        };
    } catch (error) {
        return { error: 'File not found' };
    }
}

function compile() {
    // Read the Solidity source code
    const sourcePath = path.resolve(__dirname, 'TestToken.sol');
    const source = fs.readFileSync(sourcePath, 'utf8');

    // Create input object for solc compiler
    const input = {
        language: 'Solidity',
        sources: {
            'TestToken.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    // Compile the contract with import callback
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    // Check for errors
    if (output.errors) {
        output.errors.forEach(error => {
            console.error(error.formattedMessage);
        });
        if (output.errors.some(error => error.severity === 'error')) {
            throw new Error('Compilation failed');
        }
    }

    // Extract bytecode and ABI
    const contract = output.contracts['TestToken.sol']['TestToken'];

    // Write the artifacts to a file
    fs.writeFileSync(
        path.resolve(__dirname, 'TestToken.json'),
        JSON.stringify(
            {
                abi: contract.abi,
                bytecode: contract.evm.bytecode.object,
            },
            null,
            2
        )
    );

    return {
        abi: contract.abi,
        bytecode: contract.evm.bytecode.object,
    };
}

module.exports = compile;

// If running this script directly, compile and save
if (require.main === module) {
    console.log('Compiling contract...');
    compile();
    console.log('Compilation complete. Artifacts saved to TestToken.json');
}
