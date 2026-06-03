import React, { useState, useEffect, useRef } from 'react';
import { WizardState } from '../../types';
import { presets, getPresetById } from '../../data/presets';
import StepNav from '../StepNav';
import TeachingTooltip from '../TeachingTooltip';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface PresetRanking {
  presetId: string;
  score: number;
  description: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

function getCtaText(industry: string): string {
  const lower = industry.toLowerCase();
  if (lower.includes('health') || lower.includes('wellness') || lower.includes('fitness')) return 'Book a Session';
  if (lower.includes('tech') || lower.includes('saas') || lower.includes('software')) return 'Start Free Trial';
  if (lower.includes('ecommerce') || lower.includes('retail') || lower.includes('shop')) return 'Shop Now';
  if (lower.includes('creative') || lower.includes('design') || lower.includes('agency')) return 'View Portfolio';
  if (lower.includes('consult') || lower.includes('finance') || lower.includes('legal')) return 'Book a Consultation';
  if (lower.includes('education') || lower.includes('learning')) return 'Enrol Now';
  return 'Get Started';
}

function LayoutPreview({ primary, secondary, accent, industry }: {
  primary: string; secondary: string; accent: string; industry: string;
}) {
  const cta = getCtaText(industry);
  const isLightPrimary = parseInt(primary.replace('#', ''), 16) > 0x888888;

  return (
    <div className="preset-layout-preview">
      {/* Header bar */}
      <div className="preset-layout-preview__header" style={{ background: primary }}>
        <span className="preset-layout-preview__brand" style={{ color: secondary }}>Brand</span>
        <div className="preset-layout-preview__nav">
          {['About', 'Services', 'Contact'].map(l => (
            <span key={l} style={{ color: secondary, opacity: 0.7, fontSize: '7px' }}>{l}</span>
          ))}
        </div>
      </div>
      {/* Hero */}
      <div className="preset-layout-preview__hero" style={{ background: secondary }}>
        <div className="preset-layout-preview__headline" style={{ color: isLightPrimary ? primary : '#FFFFFF' }}>
          Your Brand
        </div>
        <div className="preset-layout-preview__subline" style={{ color: isLightPrimary ? primary : '#FFFFFF', opacity: 0.7 }}>
          Expert guidance, real results
        </div>
        <div className="preset-layout-preview__cta" style={{ background: accent, color: '#fff' }}>
          {cta}
        </div>
      </div>
      {/* Content row */}
      <div className="preset-layout-preview__content">
        {[0, 1, 2].map(i => (
          <div key={i} className="preset-layout-preview__feature">
            <div className="preset-layout-preview__feature-icon" style={{ background: accent + '33' }} />
            <div className="preset-layout-preview__feature-line" style={{ background: secondary + '22' }} />
            <div className="preset-layout-preview__feature-line" style={{ background: secondary + '14', width: '70%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Step2DesignDirection({ state, onUpdate, onNext, onBack }: Props) {
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);
  const [popupFlipLeft, setPopupFlipLeft] = useState(false);
  const [rankings, setRankings] = useState<Record<string, PresetRanking>>({});
  const [rankingLoading, setRankingLoading] = useState(false);
  const sortedPresets = useRef(presets);

  useEffect(() => {
    if (state.keywords.length === 0) return;
    setRankingLoading(true);
    fetch(`${API_BASE}/api/rank-presets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords: state.keywords,
        industry: state.industry,
        presets: presets.map(p => ({ id: p.id, name: p.name, description: p.description, audience: p.audience })),
      }),
    })
      .then(r => r.json())
      .then((data: PresetRanking[]) => {
        const map: Record<string, PresetRanking> = {};
        data.forEach(r => { map[r.presetId] = r; });
        setRankings(map);
        // Sort presets by score descending
        sortedPresets.current = [...presets].sort((a, b) => {
          const scoreA = map[a.id]?.score ?? 0;
          const scoreB = map[b.id]?.score ?? 0;
          return scoreB - scoreA;
        });
        setRankingLoading(false);
      })
      .catch(() => {
        setRankingLoading(false);
      });
  }, []);

  function selectPreset(id: string) {
    const preset = getPresetById(id);
    onUpdate({
      presetId: id,
      accentColor: preset ? preset.colors.accent : state.accentColor,
      primaryColor: preset ? preset.colors.primary : state.primaryColor,
      secondaryColor: preset ? preset.colors.secondary : state.secondaryColor,
    });
  }

  function handleMouseEnter(e: React.MouseEvent, id: string) {
    setHoveredPreset(id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopupFlipLeft(rect.right + 300 > window.innerWidth);
  }

  const topPresetIds = new Set(
    Object.values(rankings)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(r => r.presetId)
  );

  const displayPresets = sortedPresets.current;
  const canContinue = state.presetId.length > 0;

  return (
    <div className="step">
      <div className="step-header">
        <span className="step-number">Step 3 of 9</span>
        <h1 className="step-title">Choose your design direction</h1>
        <p className="step-subtitle">
          {state.keywords.length > 0
            ? `Presets are ranked by how well they match your keywords: ${state.keywords.slice(0, 4).join(', ')}${state.keywords.length > 4 ? '…' : ''}. Hover any card to preview the layout.`
            : 'Each preset defines a visual world — choose the one that resonates. Hover any card to preview the layout.'}
        </p>
      </div>

      <div className="step-body">
        {rankingLoading && (
          <div className="ranking-loading-bar">
            <div className="analysis-spinner" />
            <span>Matching presets to your keywords…</span>
          </div>
        )}

        <div className="preset-grid">
          {displayPresets.map((preset) => {
            const selected = state.presetId === preset.id;
            const ranking = rankings[preset.id];
            const isBestMatch = topPresetIds.has(preset.id) && Object.keys(rankings).length > 0;
            const description = ranking?.description || preset.description;
            const gradientStyle = {
              background: `linear-gradient(135deg, ${preset.colors.primary} 0%, ${preset.colors.secondary} 50%, ${preset.colors.accent} 100%)`,
            };

            return (
              <div
                key={preset.id}
                style={{ position: 'relative' }}
                onMouseEnter={(e) => handleMouseEnter(e, preset.id)}
                onMouseLeave={() => setHoveredPreset(null)}
              >
                <button
                  type="button"
                  className={`preset-card${selected ? ' selected' : ''}`}
                  onClick={() => selectPreset(preset.id)}
                  aria-pressed={selected}
                >
                  {selected && <div className="preset-checkmark">✓</div>}
                  {isBestMatch && !selected && (
                    <div className="preset-best-match">Best match</div>
                  )}

                  {/* Gradient strip replacing colour circles */}
                  <div className="preset-gradient-strip" style={gradientStyle} />

                  <div className="preset-name">{preset.name}</div>
                  <div className="preset-desc">{description}</div>
                  <div className="preset-audience">{preset.audience}</div>
                </button>

                {/* Hover popup — layout preview */}
                {hoveredPreset === preset.id && (
                  <div
                    className={`preset-hover-popup${popupFlipLeft ? ' preset-hover-popup--left' : ''}`}
                    style={{ pointerEvents: 'none' }}
                  >
                    <LayoutPreview
                      primary={preset.colors.primary}
                      secondary={preset.colors.secondary}
                      accent={preset.colors.accent}
                      industry={state.industry}
                    />
                    <div className="preset-hover-popup__label">
                      Colour preview — {preset.name}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <TeachingTooltip
          variant="warm"
          title="Design Principle: Coherence"
          body="Your chosen preset defines the visual direction — every colour, type choice, and spacing decision flows from this foundation. A coherent palette builds trust before a visitor reads a single word."
        />
      </div>

      <StepNav
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!canContinue}
      />
    </div>
  );
}
