import ERC20_ABI from 'constants/abis/erc20.json';
import ERC20_BYTES32_ABI from 'constants/abis/erc20_bytes32.json';

import { Interface } from '@ethersproject/abi';

const ERC20_INTERFACE = new Interface(ERC20_ABI);

const ERC20_BYTES32_INTERFACE = new Interface(ERC20_BYTES32_ABI);

export default ERC20_INTERFACE;
export { ERC20_ABI, ERC20_BYTES32_ABI,ERC20_BYTES32_INTERFACE };
