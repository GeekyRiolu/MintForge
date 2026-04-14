export const createNftOwnerMap = (nfts) => {
  const nftsByOwner = nfts.reduce(function (obj, nft) {
    const key = nft.wallet.address;
    if(!obj[key]){
      obj[key] = { isOwner: nft.isOwnedByMe, totalNftsShown: 1 };
    } else {
      obj[key].totalNftsShown = obj[key].totalNftsShown + 1;
    }
    return obj;
  }, {});

  return nftsByOwner;
};
