export type DeployedContract = {
  goerli: string;
  mainnet: string;
}

export const nftProfileHelper: DeployedContract = {
  mainnet : '0xB9A5A787153b6C4898cb2A05A596A22E73B1DCc1',
  goerli: '0x3efb23c05DD34035fDb23cC74D85Ec586A2e7068'
};

export const genesisKey: DeployedContract = {
  mainnet : '0x8fB5a7894AB461a59ACdfab8918335768e411414',
  goerli: '0xe0060010c2c81A817f4c52A9263d4Ce5c5B66D55',
};

export const genesisKeyDistributor: DeployedContract = {
  mainnet : '0x0eBa8d862AF4E01A0573B663FB3eb3A06D7937dE',
  goerli: '0x36c9cadedC7fff4Ad2e316B6cCcE2CF0343BFdd4' // todo: use goerli address
};

export const genesisKeyTeamClaim: DeployedContract = {
  mainnet : '0xfc99E6b4447a17EA0C6162854fcb572ddC8FbB37',
  goerli: '0x7B7d88d7718294E27575aA7F4d1e2F25fF51b81c'
};

export const genesisKeyTeamDistributor: DeployedContract = {
  mainnet : '0x5fb1941b5415b4817d9CC62f8039F7A4B366Ff8F',
  goerli: '0x85c7fBFD62C4470Ee6C0Eb8a722c92d7cD840A11'
};

export const nftToken: DeployedContract = {
  mainnet : '0xd60054F74c9685e5F9E474F36344494D6a1DB3cF',
  goerli: '0x7ffe04f3213d893bb4ebe76fbb49ca2a8f9c4610',
};

export const nftProfile: DeployedContract = {
  mainnet : '0x98ca78e89Dd1aBE48A53dEe5799F24cC1A462F2D',
  goerli: '0x9Ef7A34dcCc32065802B1358129a226B228daB4E',
};

export const maxProfiles: DeployedContract = {
  mainnet : '0x30f649D418AF7358f9c8CB036219fC7f1B646309',
  goerli: '0x40023d97Ca437B966C8f669C91a9740C639E21C3'
};

export const profileAuction: DeployedContract = {
  mainnet : '0x30f649D418AF7358f9c8CB036219fC7f1B646309',
  goerli: '0x40023d97Ca437B966C8f669C91a9740C639E21C3',
};

export const ethereumRegex: DeployedContract = {
  goerli: '0x44Ab7157EA5aa43b538F00FF8E23B7cb9Bcd7C0D',
  mainnet: '0xe9F5CBeE4a58B1EB47b303c14765Ab102E4ABC37'
};

export const nftResolver: DeployedContract = {
  goerli: '0x3a3539B6727E74fa1c5D4d39B433F0fAB5BC4F4a',
  mainnet: '0xA657C988e8aC39D3268D390eB7c522a535B10453',
};

export const nftAggregator: DeployedContract = {
  goerli: '0x165699Cf79Aaf3D15746c16fb63ef7dDCcb8dF10',
  mainnet: '0xf2821154d4752862b49a7C7fA7728B76ea44495e',
};

export const marketplace: DeployedContract = {
  goerli: '0xa75F995f252ba5F7C17f834b314201271d32eC35',
  mainnet: '0x1fD9Bc58C7FfdB18D19a8A8d791B6ae9fa2BD097',
};

export const transferProxy: DeployedContract = {
  goerli: '0xCD979ec33B43eCE6523B41BA5c9e409568eDFB97',
  mainnet: '0x151271EF11D8FA022A81f8de70feA53fdCCc0107'
};

export function getAddressForChain(contract: DeployedContract, chainId: number | string): string {
  switch (chainId) {
  case 1:
    return contract.mainnet;
  case '1':
    return contract.mainnet;
  case 5:
    return contract.goerli;
  case '5':
    return contract.goerli;
  default:
    return contract.mainnet;
  }
}