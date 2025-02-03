import { ERC20_ABI } from '../constants/abis';

export const getERC20Contract = (web3, address) => {
    return new web3.eth.Contract(ERC20_ABI, address);
};
