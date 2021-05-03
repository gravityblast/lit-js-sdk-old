import multihashing from 'multihashing'
import CID from 'cids'

export const kFragKey = ({ tokenAddress, tokenId, chain }) => {
  const normalizedTokenAddress = tokenAddress.toLowerCase()
  const normalizedTokenId = tokenId.toString(16).padStart(64, '0') // to hex and padded for consistent length
  const formattedKey = `${normalizedTokenAddress}|${normalizedTokenId}|${chain}`
  const hashed = multihashing(Buffer.from(formattedKey), 'sha2-256')
  const cid = new CID(hashed)
  return cid.toString()
}
