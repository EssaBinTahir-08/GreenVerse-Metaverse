import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen py-20 relative z-10 w-full max-w-4xl mx-auto px-6">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary font-medium text-sm mb-6 shadow-[var(--shadow-glow)]">
          <Shield className="w-4 h-4" />
          <span>Legal</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold mb-4 gradient-text">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="glass-card p-8 md:p-12 space-y-8 text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold font-heading mb-4 text-white">1. Information We Collect</h2>
          <p className="mb-4">
            At GreenVerse, we respect your privacy and are committed to protecting it. As a Web3-integrated platform, our data collection is minimal:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Wallet Addresses:</strong> Collected when you independently connect your MetaMask. This is public blockchain data used solely to map your NFT inventory to your dashboard.</li>
            <li><strong>Account Data:</strong> If you choose to create a traditional account, we securely store your email and a hashed password.</li>
            <li><strong>Transaction Hashes:</strong> Used strictly to verify your on-chain minting purchases.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading mb-4 text-white">2. How We Use Your Data</h2>
          <p>
            Your information is used strictly to provide and improve the GreenVerse platform. We use your wallet address to fetch and display your newly minted Digital Forest. We use your email solely for account recovery and critical platform updates. We <strong>do not</strong> sell, rent, or trade your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading mb-4 text-white">3. Blockchain Transparency</h2>
          <p>
            Please be aware that any transaction conducted on the Ethereum or Polygon networks (such as minting a GreenVerse NFT) is permanently and publicly recorded on the blockchain. We do not control this public ledger and cannot delete or modify your on-chain transaction history.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading mb-4 text-white">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your account data. However, you are solely responsible for the security of your MetaMask wallet and your private keys. GreenVerse will never ask for your seed phrase or private key.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold font-heading mb-4 text-white">5. Contact Us</h2>
          <p>
            If you have any questions or concerns regarding this Privacy Policy, please contact our support team at privacy@greenverse.io.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
