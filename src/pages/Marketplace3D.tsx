import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MARKETPLACE_NFTS } from './Marketplace';
import { API_BASE_URL } from '@/config';
import { useWallet } from '@/context/WalletContext';

// Rarity tiers based on price
function getRarity(price: string): { label: string; color: string; glow: string } {
  const p = parseFloat(price);
  if (p >= 0.07) return { label: 'LEGENDARY', color: '#fbbf24', glow: 'rgba(251,191,36,0.5)' };
  if (p >= 0.04) return { label: 'EPIC', color: '#a78bfa', glow: 'rgba(167,139,250,0.5)' };
  if (p >= 0.02) return { label: 'RARE', color: '#60a5fa', glow: 'rgba(96,165,250,0.4)' };
  return { label: 'COMMON', color: '#4ade80', glow: 'rgba(74,222,128,0.35)' };
}

const CATEGORY_COLORS: Record<string, string> = {
  plantation: '#22c55e',
  recycling: '#60a5fa',
  energy_saving: '#fbbf24',
  cleanup: '#38bdf8',
  wildlife: '#f97316',
  renewable: '#facc15',
  marine: '#06b6d4',
};

// ── Immersive 3D Flip Card ─────────────────────────────────────
function NFT3DCard({ nft, onBuy }: { nft: typeof MARKETPLACE_NFTS[0]; onBuy: (n: typeof MARKETPLACE_NFTS[0]) => void }) {
  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const rarity = getRarity(nft.price);
  const catColor = CATEGORY_COLORS[nft.category] || '#22c55e';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || flipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    const y = -(e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    setTilt({ x: x * 12, y: y * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={() => setFlipped(!flipped)}
      style={{
        perspective: '1000px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '140%',
        transformStyle: 'preserve-3d',
        transform: flipped
          ? 'rotateY(180deg)'
          : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${hovered ? 'translateY(-10px)' : ''}`,
        transition: flipped ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)' : 'transform 0.15s ease',
        filter: hovered && !flipped ? `drop-shadow(0 24px 60px ${rarity.glow})` : 'none',
      }}>

        {/* ── FRONT ─────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: 20, overflow: 'hidden',
          background: 'linear-gradient(145deg, #0c1a10 0%, #0a1628 100%)',
          border: `1px solid ${hovered ? rarity.color : rarity.color + '44'}`,
          boxShadow: hovered ? `0 0 0 1px ${rarity.color}66, inset 0 0 40px ${rarity.glow}` : 'none',
        }}>
          {/* Shimmer overlay on hover */}
          {hovered && !flipped && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
              background: `linear-gradient(115deg, transparent 30%, ${rarity.color}18 50%, transparent 70%)`,
              backgroundSize: '200% 200%',
              animation: 'shimmer 1.5s infinite',
            }} />
          )}

          {/* NFT Image */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '65%', overflow: 'hidden' }}>
            <img
              src={nft.img}
              alt={nft.name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                filter: `hue-rotate(${nft.hue}deg) ${hovered ? 'brightness(1.15) saturate(1.3)' : 'brightness(1)'}`,
                transform: hovered ? 'scale(1.07)' : 'scale(1)',
                transition: 'all 0.5s ease',
              }}
            />
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 40%, #0a1628 100%)',
            }} />
            {/* Glow from image bottom */}
            <div style={{
              position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
              width: '80%', height: 40, borderRadius: '50%',
              background: rarity.glow, filter: 'blur(20px)', opacity: hovered ? 1 : 0.4,
              transition: 'opacity 0.3s',
            }} />

            {/* Badges */}
            <div style={{ position: 'absolute', top: 10, left: 10 }}>
              <div style={{
                background: `${catColor}22`, border: `1px solid ${catColor}`,
                borderRadius: 20, padding: '3px 10px',
                color: catColor, fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
              }}>{nft.category.replace('_', ' ')}</div>
            </div>
            <div style={{ position: 'absolute', top: 10, right: 10 }}>
              <div style={{
                background: 'rgba(0,0,0,0.7)', border: `1px solid ${rarity.color}`,
                borderRadius: 20, padding: '3px 10px',
                color: rarity.color, fontSize: 9, fontWeight: 800, letterSpacing: 1.5,
              }}>★ {rarity.label}</div>
            </div>
          </div>

          {/* Card info */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px',
            background: 'linear-gradient(to top, #060d1a 80%, transparent)',
          }}>
            <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 3 }}>
              {nft.region.toUpperCase()}
            </div>
            <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 15, marginBottom: 10, lineHeight: 1.2 }}>
              {nft.name}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#475569', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>PRICE</div>
                <div style={{ color: rarity.color, fontWeight: 900, fontSize: 18 }}>{nft.price} MATIC</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onBuy(nft); }}
                style={{
                  background: `linear-gradient(135deg, ${catColor}cc, ${catColor})`,
                  border: 'none', borderRadius: 12, padding: '9px 16px',
                  color: '#000', fontWeight: 800, fontSize: 12, cursor: 'pointer',
                  transform: hovered ? 'scale(1.05)' : 'scale(1)',
                  transition: 'transform 0.2s',
                  boxShadow: `0 0 20px ${catColor}66`,
                }}
              >🌿 Mint</button>
            </div>

            <div style={{ marginTop: 10, color: '#334155', fontSize: 10, textAlign: 'center' }}>
              Click card to see details ↺
            </div>
          </div>
        </div>

        {/* ── BACK ──────────────────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 20, overflow: 'hidden',
          background: `linear-gradient(145deg, #060d1a 0%, #0d1f0d 100%)`,
          border: `1px solid ${catColor}66`,
          padding: 20,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          {/* Back header */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ color: rarity.color, fontWeight: 900, fontSize: 11, letterSpacing: 2 }}>★ {rarity.label}</div>
              <div style={{ color: '#475569', fontSize: 11 }}>#{String(nft.id).padStart(3, '0')}</div>
            </div>
            <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{nft.name}</div>
            <div style={{ color: catColor, fontSize: 11, fontWeight: 600, marginBottom: 16 }}>
              📍 {nft.region}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[
              { label: 'CO₂ Offset', value: `${(parseFloat(nft.price) * 120).toFixed(0)}kg`, icon: '💨' },
              { label: 'Impact Score', value: `${Math.round(parseFloat(nft.price) * 1200)}pts`, icon: '⚡' },
              { label: 'Tree Age', value: `${Math.round(parseFloat(nft.price) * 50)}yr`, icon: '🌱' },
              { label: 'Biome', value: nft.category.replace('_', ' '), icon: '🗺️' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{
                background: 'rgba(15,23,42,0.8)', borderRadius: 10, padding: '8px 10px',
                border: `1px solid ${catColor}22`,
              }}>
                <div style={{ fontSize: 14, marginBottom: 1 }}>{icon}</div>
                <div style={{ color: '#cbd5e1', fontWeight: 700, fontSize: 12 }}>{value}</div>
                <div style={{ color: '#475569', fontSize: 9, letterSpacing: 1 }}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Eco certification */}
          <div style={{
            background: `${catColor}11`, border: `1px solid ${catColor}33`,
            borderRadius: 10, padding: '8px 12px', marginBottom: 12,
            color: catColor, fontSize: 10, fontWeight: 600, lineHeight: 1.5,
          }}>
            🏅 Verified by GreenVerse Guardian Council<br />
            On-chain proof · Polygon Mainnet
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onBuy(nft); }}
            style={{
              width: '100%', padding: '12px', borderRadius: 12,
              background: `linear-gradient(135deg, ${catColor}cc, ${catColor})`,
              border: 'none', color: '#000', fontWeight: 900, fontSize: 14,
              cursor: 'pointer', boxShadow: `0 8px 30px ${catColor}55`,
            }}
          >🦊 Pay & Mint — {nft.price} MATIC</button>
        </div>
      </div>
    </div>
  );
}

// ── Buy/Mint Modal ─────────────────────────────────────────────
function MintModal({ nft, onClose, onMinted }: {
  nft: typeof MARKETPLACE_NFTS[0];
  onClose: () => void;
  onMinted: () => void;
}) {
  const rarity = getRarity(nft.price);
  const catColor = CATEGORY_COLORS[nft.category] || '#22c55e';
  const [step, setStep] = useState<'connect' | 'confirm' | 'signing' | 'recording' | 'done' | 'error'>('confirm');
  const [errorMsg, setErrorMsg] = useState('');
  const [txHash, setTxHash] = useState('');
  const wallet = useWallet();

  // If wallet not connected, show connect step first
  const effectiveStep = !wallet.isConnected ? 'connect' : step;

  const handleConnect = async () => {
    await wallet.connect();
  };

  const handleMint = async () => {
    if (!wallet.isCorrectNetwork) {
      try { await wallet.switchNetwork(); } catch {}
      return;
    }

    setStep('signing');
    const token = localStorage.getItem('token');

    try {
      // Step 1: Real MetaMask transaction
      const hash = await wallet.mintNFTOnChain({
        nftName: nft.name,
        region: nft.region,
        category: nft.category,
        priceInMatic: nft.price,
      });
      setTxHash(hash);

      // Step 2: Record in backend DB
      setStep('recording');
      const res = await fetch(`${API_BASE_URL}/api/nfts/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          treeType: nft.name,
          region: nft.region,
          txHash: hash,
          category: nft.category,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Backend record failed');
      }

      setStep('done');
    } catch (err: any) {
      if (err.code === 4001) {
        setErrorMsg('Transaction rejected in MetaMask.');
      } else {
        setErrorMsg(err.message || 'Mint failed. Please try again.');
      }
      setStep('error');
    }
  };

  const isBlocking = effectiveStep === 'signing' || effectiveStep === 'recording';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
    }} onClick={isBlocking ? undefined : onClose}>
      <div style={{
        background: 'linear-gradient(145deg, #0c1a10, #090d1a)',
        border: `1px solid ${rarity.color}55`,
        borderRadius: 28, padding: 36, maxWidth: 440, width: '90%',
        boxShadow: `0 0 100px ${rarity.glow}`,
      }} onClick={(e) => e.stopPropagation()}>

        {/* ── STEP: CONNECT WALLET ── */}
        {effectiveStep === 'connect' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🦊</div>
            <div style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 22, marginBottom: 8 }}>Connect Your Wallet</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              You need MetaMask to mint NFTs on Polygon.<br />
              Connect your wallet to continue.
            </div>
            <button onClick={handleConnect} disabled={wallet.isConnecting} style={{
              width: '100%', padding: '15px', borderRadius: 16,
              background: wallet.isConnecting ? '#1e293b' : 'linear-gradient(135deg, #f97316, #fbbf24)',
              border: 'none', color: '#000', fontWeight: 900, fontSize: 16, cursor: 'pointer',
              marginBottom: 10,
            }}>
              {wallet.isConnecting ? '⟳ Connecting…' : '🦊 Connect MetaMask'}
            </button>
            {wallet.error && (
              <div style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>{wallet.error}</div>
            )}
            <button onClick={onClose} style={{
              width: '100%', padding: '12px', borderRadius: 16,
              background: 'transparent', border: '1px solid #1e293b', color: '#475569',
              fontWeight: 700, cursor: 'pointer',
            }}>Cancel</button>
          </div>
        )}

        {/* ── STEP: CONFIRM ── */}
        {effectiveStep === 'confirm' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' }}>
              <div style={{ color: rarity.color, fontWeight: 800, fontSize: 11, letterSpacing: 2 }}>★ {rarity.label} NFT</div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <img src={nft.img} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 16, marginBottom: 16, filter: `hue-rotate(${nft.hue}deg) brightness(1.1)` }} alt={nft.name} />
            <h3 style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 22, margin: '0 0 4px' }}>{nft.name}</h3>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 18 }}>📍 {nft.region} · {nft.category.replace('_', ' ')}</div>

            {/* Wallet info bar */}
            <div style={{
              background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: 12, padding: '10px 14px', marginBottom: 16,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ color: '#64748b', fontSize: 11 }}>Connected Wallet</div>
              <div style={{ color: '#00ff88', fontWeight: 700, fontSize: 12 }}>{wallet.shortAddress}</div>
            </div>

            {/* Wrong network warning */}
            {!wallet.isCorrectNetwork && (
              <div style={{
                background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.4)',
                borderRadius: 12, padding: '10px 14px', marginBottom: 14,
                color: '#fb923c', fontSize: 12, fontWeight: 600,
              }}>
                ⚠️ Wrong network detected.{' '}
                <button onClick={wallet.switchNetwork} style={{ background: 'none', border: 'none', color: '#fbbf24', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>
                  Switch to Polygon
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div style={{ background: '#0f172a', borderRadius: 12, padding: 14 }}>
                <div style={{ color: '#475569', fontSize: 10, marginBottom: 4 }}>MINT PRICE</div>
                <div style={{ color: rarity.color, fontWeight: 900, fontSize: 22 }}>{nft.price} MATIC</div>
              </div>
              <div style={{ background: '#0f172a', borderRadius: 12, padding: 14 }}>
                <div style={{ color: '#475569', fontSize: 10, marginBottom: 4 }}>CO₂ OFFSET</div>
                <div style={{ color: '#4ade80', fontWeight: 900, fontSize: 22 }}>{(parseFloat(nft.price) * 120).toFixed(0)}kg</div>
              </div>
            </div>

            <button onClick={handleMint} style={{
              width: '100%', padding: '15px', borderRadius: 16,
              background: wallet.isCorrectNetwork
                ? 'linear-gradient(135deg, #059669, #00ff88)'
                : 'linear-gradient(135deg, #f97316, #fbbf24)',
              border: 'none', color: '#000', fontWeight: 900, fontSize: 16, cursor: 'pointer',
              boxShadow: '0 0 40px rgba(0,255,136,0.3)', marginBottom: 10,
            }}>
              {wallet.isCorrectNetwork ? '🦊 Sign & Mint on Polygon' : '🔄 Switch Network & Mint'}
            </button>
            <button onClick={onClose} style={{
              width: '100%', padding: '12px', borderRadius: 16,
              background: 'transparent', border: '1px solid #1e293b', color: '#475569',
              fontWeight: 700, cursor: 'pointer',
            }}>Cancel</button>
          </>
        )}

        {/* ── STEP: SIGNING (Waiting for MetaMask) ── */}
        {effectiveStep === 'signing' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🦊</div>
            <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Waiting for MetaMask…</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              A MetaMask popup should appear.<br />
              Review the transaction and click <b style={{ color: '#f1f5f9' }}>Confirm</b>.
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#fbbf24',
                  animation: `bounce 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: RECORDING (Saving to DB) ── */}
        {effectiveStep === 'recording' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 16, animation: 'spin 1.5s linear infinite' }}>⟳</div>
            <div style={{ color: '#00ff88', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Transaction Confirmed!</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>Saving your NFT to the GreenVerse ledger…</div>
            {txHash && (
              <a href={`https://mumbai.polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer"
                style={{ color: '#60a5fa', fontSize: 11, wordBreak: 'break-all', textDecoration: 'underline' }}>
                {txHash.slice(0, 20)}…{txHash.slice(-8)}
              </a>
            )}
          </div>
        )}

        {/* ── STEP: DONE ── */}
        {effectiveStep === 'done' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <div style={{ color: '#00ff88', fontWeight: 900, fontSize: 24, marginBottom: 8 }}>NFT Minted!</div>
            <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16, lineHeight: 1.7 }}>
              <b style={{ color: '#f1f5f9' }}>{nft.name}</b> is now in your wallet.<br />
              Real tree planting initiated in <b style={{ color: '#4ade80' }}>{nft.region}</b>.
            </div>
            {txHash && (
              <a href={`https://mumbai.polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer"
                style={{ display: 'block', color: '#60a5fa', fontSize: 11, marginBottom: 20, wordBreak: 'break-all' }}>
                🔗 View on PolygonScan: {txHash.slice(0, 18)}…
              </a>
            )}
            <button onClick={onMinted} style={{
              width: '100%', padding: '14px', borderRadius: 16,
              background: 'linear-gradient(135deg, #059669, #00ff88)',
              border: 'none', color: '#000', fontWeight: 900, fontSize: 16, cursor: 'pointer',
            }}>View in Digital Forest 🌳</button>
          </div>
        )}

        {/* ── STEP: ERROR ── */}
        {effectiveStep === 'error' && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>⚠️</div>
            <div style={{ color: '#f87171', fontWeight: 900, fontSize: 20, marginBottom: 8 }}>Mint Failed</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 22, lineHeight: 1.6 }}>{errorMsg}</div>
            <button onClick={() => setStep('confirm')} style={{
              width: '100%', padding: '13px', borderRadius: 14,
              background: 'rgba(30,41,59,0.9)', border: '1px solid #334155',
              color: '#94a3b8', fontWeight: 700, cursor: 'pointer', marginBottom: 8,
            }}>Try Again</button>
            <button onClick={onClose} style={{
              width: '100%', padding: '12px', borderRadius: 14,
              background: 'transparent', border: '1px solid #1e293b',
              color: '#475569', fontWeight: 600, cursor: 'pointer',
            }}>Cancel</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer { 0%,100%{background-position:200% 0} 50%{background-position:-200% 0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.5} 40%{transform:scale(1.2);opacity:1} }
      `}</style>
    </div>
  );
}
// ── Custom styled sort dropdown ─────────────────────────────
function SortDropdown({ value, onChange }: { value: string; onChange: (v: 'price-asc' | 'price-desc' | 'rarity') => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const options = [
    { value: 'rarity' as const, label: '★ Sort: Rarity', icon: '⭐' },
    { value: 'price-desc' as const, label: 'Price: High → Low', icon: '↓' },
    { value: 'price-asc' as const, label: 'Price: Low → High', icon: '↑' },
  ];

  const current = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', marginLeft: 8 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: open ? 'rgba(0,255,136,0.08)' : 'rgba(15,23,42,0.8)',
          border: `1px solid ${open ? '#00ff8866' : '#334155'}`,
          borderRadius: 12, padding: '8px 14px', cursor: 'pointer',
          color: open ? '#00ff88' : '#94a3b8', fontSize: 12, fontWeight: 700,
          transition: 'all 0.2s', whiteSpace: 'nowrap',
        }}
      >
        <span>{current.icon}</span>
        <span>{current.label}</span>
        <span style={{ fontSize: 9, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: 'rgba(10,16,30,0.98)', border: '1px solid #1e293b',
          borderRadius: 14, padding: 6, minWidth: 200, zIndex: 200,
          boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,136,0.05)',
          backdropFilter: 'blur(20px)',
        }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 12px', borderRadius: 10,
                background: value === opt.value ? 'rgba(0,255,136,0.08)' : 'transparent',
                border: 'none',
                color: value === opt.value ? '#00ff88' : '#94a3b8',
                fontSize: 13, fontWeight: value === opt.value ? 800 : 500,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { if (value !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { if (value !== opt.value) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ width: 20, textAlign: 'center' }}>{opt.icon}</span>
              <span>{opt.label}</span>
              {value === opt.value && <span style={{ marginLeft: 'auto', fontSize: 10 }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Marketplace 3D Page ──────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: '✦ All NFTs', color: '#00ff88' },
  { id: 'plantation', label: '🌳 Plantation', color: '#22c55e' },
  { id: 'recycling', label: '♻️ Recycling', color: '#60a5fa' },
  { id: 'energy_saving', label: '⚡ Energy', color: '#fbbf24' },
  { id: 'cleanup', label: '💧 Cleanup', color: '#38bdf8' },
  { id: 'wildlife', label: '🦅 Wildlife', color: '#f97316' },
  { id: 'renewable', label: '☀️ Renewables', color: '#facc15' },
  { id: 'marine', label: '🌊 Marine', color: '#06b6d4' },
];

export default function Marketplace3D() {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'price-asc' | 'price-desc' | 'rarity'>('rarity');
  const [buying, setBuying] = useState<typeof MARKETPLACE_NFTS[0] | null>(null);
  const navigate = useNavigate();

  const handleMinted = () => {
    setBuying(null);
    navigate('/digital-forest');
  };

  const filtered = MARKETPLACE_NFTS
    .filter((n) => category === 'all' || n.category === category)
    .sort((a, b) => {
      if (sort === 'price-asc') return parseFloat(a.price) - parseFloat(b.price);
      if (sort === 'price-desc') return parseFloat(b.price) - parseFloat(a.price);
      return parseFloat(b.price) - parseFloat(a.price); // rarity by price
    });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #060d1a 0%, #03100a 50%, #060d1a 100%)' }}>

      {/* Animated background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '40%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1300, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── Hero header ── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', gap: 8, alignItems: 'center',
            background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: 50, padding: '6px 18px', marginBottom: 18,
            color: '#00ff88', fontSize: 11, fontWeight: 800, letterSpacing: 3,
          }}>🔴 LIVE · Polygon Mainnet</div>

          <h1 style={{
            fontSize: 52, fontWeight: 900, margin: '0 0 14px', lineHeight: 1.05,
            background: 'linear-gradient(135deg, #00ff88 0%, #4ade80 40%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>The 3D NFT Meta-Market</h1>
          <p style={{ color: '#64748b', fontSize: 17, maxWidth: 540, margin: '0 auto 12px', lineHeight: 1.7 }}>
            Own bioluminescent eco-assets. Each NFT funds a real-world plantation.<br />
            Click any card to flip and see full details.
          </p>
          <div style={{ color: '#334155', fontSize: 12 }}>🖱️ Hover to tilt · Click to flip · Mint to own</div>
        </div>

        {/* ── Stats bar ── */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
          {[
            { label: 'Total NFTs', value: `${MARKETPLACE_NFTS.length}`, color: '#00ff88' },
            { label: 'Floor Price', value: '0.01 MATIC', color: '#4ade80' },
            { label: 'Total Minted', value: '1,248', color: '#a78bfa' },
            { label: 'Trees Planted', value: '892', color: '#fbbf24' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: 'rgba(15,23,42,0.85)', border: '1px solid #1e293b',
              borderRadius: 14, padding: '12px 24px', backdropFilter: 'blur(12px)', textAlign: 'center',
            }}>
              <div style={{ color, fontSize: 22, fontWeight: 900 }}>{value}</div>
              <div style={{ color: '#475569', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>{label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* ── Category tabs ── */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: 20, background: 'rgba(10,16,30,0.8)',
          border: '1px solid #1e293b', borderRadius: 20, padding: '10px 14px',
          backdropFilter: 'blur(16px)',
        }}>
          {CATEGORIES.map(({ id, label, color }) => (
            <button key={id} onClick={() => setCategory(id)} style={{
              padding: '8px 18px', borderRadius: 14, fontSize: 12, fontWeight: 800,
              border: `1px solid ${category === id ? color : 'transparent'}`,
              background: category === id ? `${color}18` : 'transparent',
              color: category === id ? color : '#475569',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: category === id ? `0 0 20px ${color}33` : 'none',
            }}>{label}</button>
          ))}
          <SortDropdown value={sort} onChange={setSort} />
        </div>

        <div style={{ color: '#334155', fontSize: 12, textAlign: 'center', marginBottom: 28 }}>
          Showing {filtered.length} NFTs
        </div>

        {/* ── NFT Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 24,
        }}>
          {filtered.map((nft) => (
            <NFT3DCard key={nft.id} nft={nft} onBuy={setBuying} />
          ))}
        </div>

        {/* ── Bottom CTA ── */}
        <div style={{
          marginTop: 60, textAlign: 'center', padding: 40,
          background: 'rgba(0,255,136,0.03)', border: '1px solid rgba(0,255,136,0.1)',
          borderRadius: 24,
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🌍</div>
          <div style={{ color: '#e2e8f0', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
            Own Land in the Metaverse
          </div>
          <div style={{ color: '#64748b', fontSize: 14, marginBottom: 22 }}>
            Each NFT tree can be placed on your LAND parcel in the 3D GreenVerse world
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/land')} style={{
              padding: '12px 28px', borderRadius: 14,
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              border: 'none', color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer',
            }}>🗺️ View Land Map</button>
            <button onClick={() => navigate('/metaverse')} style={{
              padding: '12px 28px', borderRadius: 14,
              background: 'transparent', border: '1px solid #00ff8844',
              color: '#00ff88', fontWeight: 800, fontSize: 14, cursor: 'pointer',
            }}>🌿 Enter Metaverse</button>
          </div>
        </div>
      </div>

      {buying && <MintModal nft={buying} onClose={() => setBuying(null)} onMinted={handleMinted} />}
    </div>
  );
}
