# Greenverse Go-Live Guide (Production Readiness)

This document explains how to transition Greenverse from a locally running prototype to a live, on-chain Web3 application.

## 1. Smart Contract Deployment
You must deploy the contracts provided in `backend/contracts/` to a blockchain (e.g., Polygon Amoy for testing, or Polygon Mainnet for production).

1.  Open [Remix IDE](https://remix.ethereum.org/).
2.  Upload `EcoToken.sol` and `NFTTree.sol`.
3.  Deploy **EcoToken** first. Note the address.
4.  Deploy **NFTTree** second. Note the address.
5.  **Critical**: Transfer ownership of `EcoToken` or grant `MINTER_ROLE` (if customized) to the `ADMIN_PRIVATE_KEY` wallet address so the backend can issue rewards.

## 2. Environment Configuration
Update your `.env` files with the new contract details.

### Backend (`backend/.env`)
```env
RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
ADMIN_PRIVATE_KEY=...your_wallet_private_key...
ECO_TOKEN_ADDRESS=0x...deployed_token_address...
NFT_TREE_ADDRESS=0x...deployed_nft_address...
```

### Frontend (`.env`)
```env
VITE_NFT_TREE_ADDRESS=0x...deployed_nft_address...
```

## 3. Storage Strategy
Currently, file evidence is stored in `backend/uploads`. For a professional release:
1.  Sign up for [Pinata](https://www.pinata.cloud/) or [Web3.Storage](https://web3.storage/).
2.  Update the file upload logic in `backend/src/services/blockchain.service.js` to upload the image to IPFS before minting.
3.  Store the CID (Content Identifier) in the NFT metadata URI.

## 4. Administrative Workflow
1.  **Register as Admin**: Manually update your user role in the Supabase `Users` table to `admin`.
2.  **Verify Action**: When a user submits an action, go to the **Admin Portal**.
3.  **Approve**: Clicking "Approve" will trigger a real transaction from the `ADMIN_PRIVATE_KEY` wallet to the user's registered wallet.

## 5. Deployment
*   **Backend**: Can be hosted on Railway, Render, or a VPS. Ensure the `PORT` is open.
*   **Frontend**: Can be hosted on Vercel or Netlify.
*   **Database**: Continue using Supabase or migrate to a managed RDS instance.

---

### Verification Checklist
- [ ] Wallet connects in Navbar.
- [ ] User can upload proof.
- [ ] Admin can see proof in portal.
- [ ] Approve button triggers MATIC transaction (visible on Explorer).
- [ ] Marketplace purchase triggers MetaMask prompt.
