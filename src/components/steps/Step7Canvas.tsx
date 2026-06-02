import { useState, useRef, useCallback, useEffect } from 'react';
import { TransformWrapper, TransformComponent, useTransformContext } from 'react-zoom-pan-pinch';
import { WizardState } from '../../types';
import { getPresetById } from '../../data/presets';
import { useProjectApi } from '../../hooks/useProjectApi';
import { downloadZIP, downloadHTML } from '../../utils/exportUtils';

interface Props {
  state: WizardState;
  onUpdate: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  goToStep: (n: number) => void;
}

interface Position { x: number; y: number; }

const IMG_W = 200;
const IMG_H = 150;
const GAP = 20;
const SECTION_LABEL_H = 36;
const SECTION_GAP = 60;
const CANVAS_W = 3200;
const CANVAS_H = 2400;
const INITIAL_MARGIN = 60;

function buildInitialPositions(state: WizardState): Record<string, Position> {
  const positions: Record<string, Position> = {};
  let y = INITIAL_MARGIN;
  state.sections.forEach(section => {
    section.images.forEach((img, i) => {
      positions[img.id] = {
        x: INITIAL_MARGIN + i * (IMG_W + GAP),
        y: y + SECTION_LABEL_H,
      };
    });
    y += SECTION_LABEL_H + IMG_H + SECTION_GAP;
  });
  return positions;
}

function getSectionTopY(sectionIndex: number): number {
  let y = INITIAL_MARGIN;
  for (let i = 0; i < sectionIndex; i++) {
    y += SECTION_LABEL_H + IMG_H + SECTION_GAP;
  }
  return y;
}

// Inner component — must be inside TransformWrapper to access useTransformContext
function CanvasContent({
  state,
  positions,
  setPositions,
  draggingId,
  setDraggingId,
  tintEnabled,
  accentColor,
}: {
  state: WizardState;
  positions: Record<string, Position>;
  setPositions: React.Dispatch<React.SetStateAction<Record<string, Position>>>;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
  tintEnabled: boolean;
  accentColor: string;
}) {
  const ctx = useTransformContext(); // ZoomPanPinch instance
  const dragOffset = useRef<{ ox: number; oy: number }>({ ox: 0, oy: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent, imgId: string) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = ctx.state.scale;
    const canvasX = (e.clientX - rect.left) / scale;
    const canvasY = (e.clientY - rect.top) / scale;
    const pos = positions[imgId] ?? { x: 0, y: 0 };
    dragOffset.current = { ox: canvasX - pos.x, oy: canvasY - pos.y };
    setDraggingId(imgId);
  }, [positions, ctx, setDraggingId]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = ctx.state.scale;
    const canvasX = (e.clientX - rect.left) / scale;
    const canvasY = (e.clientY - rect.top) / scale;
    const newX = Math.max(0, Math.min(CANVAS_W - IMG_W, canvasX - dragOffset.current.ox));
    const newY = Math.max(0, Math.min(CANVAS_H - IMG_H - 28, canvasY - dragOffset.current.oy));
    setPositions(prev => ({ ...prev, [draggingId]: { x: newX, y: newY } }));
  }, [draggingId, ctx, setPositions]);

  const onPointerUp = useCallback(() => {
    setDraggingId(null);
  }, [setDraggingId]);

  return (
    <div
      ref={canvasRef}
      className="canvas-infinite"
      style={{ width: CANVAS_W, height: CANVAS_H, position: 'relative' }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Section labels */}
      {state.sections.map((section, sIdx) => (
        <div
          key={`label-${section.id}`}
          className="canvas-section-label"
          style={{
            position: 'absolute',
            left: INITIAL_MARGIN,
            top: getSectionTopY(sIdx),
          }}
        >
          {section.name}
        </div>
      ))}

      {/* Image cards */}
      {state.sections.flatMap(section =>
        section.images.map(img => {
          const pos = positions[img.id] ?? { x: 0, y: 0 };
          const isDragging = draggingId === img.id;
          return (
            <div
              key={img.id}
              className={`canvas-image-card ${isDragging ? 'canvas-image-card--dragging' : ''}`}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: IMG_W,
                height: IMG_H + 28,
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              onPointerDown={e => onPointerDown(e, img.id)}
            >
              <div className="canvas-image-card__photo-wrap">
                {img.url ? (
                  <>
                    <img
                      src={img.thumb || img.url}
                      alt={img.alt}
                      className="canvas-image-card__photo"
                      draggable={false}
                    />
                    {tintEnabled && (
                      <div
                        className="image-card__tint"
                        style={{ background: accentColor }}
                      />
                    )}
                  </>
                ) : (
                  <div
                    className="image-card__placeholder"
                    style={{ background: 'linear-gradient(135deg, #eee, #ccc)' }}
                  />
                )}
              </div>
              <div className="canvas-image-card__caption">
                {section.name}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function Step7Canvas({ state, onNext, goToStep }: Props) {
  const preset = getPresetById(state.presetId);
  const accentColor = state.accentColor;

  const [positions, setPositions] = useState<Record<string, Position>>(() =>
    buildInitialPositions(state)
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [tintEnabled, setTintEnabled] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const { saveProject } = useProjectApi();

  // Re-layout if sections change after returning from image review
  useEffect(() => {
    setPositions(buildInitialPositions(state));
  }, [state.sections]);

  function handleResetLayout() {
    setPositions(buildInitialPositions(state));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveProject({
        name: state.projectName || 'Untitled',
        category: state.businessTypes.join(', '),
        presetName: state.presetId,
        projectData: {
          paletteColors: {
            primary: state.primaryColor,
            secondary: state.secondaryColor,
            accent: state.accentColor,
          },
          sections: state.sections,
          metadata: { keywords: state.keywords, presetId: state.presetId },
        },
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const totalImages = state.sections.reduce((n, s) => n + s.images.length, 0);

  return (
    <div className="canvas-stage">
      {/* Toolbar */}
      <div className="canvas-toolbar">
        <div className="canvas-toolbar__left">
          <button type="button" className="btn btn-secondary canvas-toolbar__btn" onClick={() => goToStep(7)}>
            ← Back to Images
          </button>
          <button type="button" className="btn btn-secondary canvas-toolbar__btn" onClick={() => goToStep(3)}>
            + Add Inspiration
          </button>
        </div>

        <div className="canvas-toolbar__title">
          <span className="canvas-toolbar__project">{state.projectName || 'Mood Board'}</span>
          {preset && <span className="canvas-toolbar__preset">{preset.name}</span>}
          <span className="canvas-toolbar__count">{totalImages} images</span>
        </div>

        <div className="canvas-toolbar__right">
          <button
            type="button"
            className={`tint-toggle tint-toggle--sm ${tintEnabled ? 'tint-toggle--on' : ''}`}
            onClick={() => setTintEnabled(t => !t)}
            title={`Apply ${accentColor} tint over images`}
          >
            <span className="tint-toggle__dot" style={tintEnabled ? { background: accentColor } : {}} />
            <span>Tint {tintEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button type="button" className="btn btn-secondary canvas-toolbar__btn" onClick={handleResetLayout}>
            Reset Layout
          </button>
          <button type="button" className="btn btn-secondary canvas-toolbar__btn" onClick={() => downloadHTML(state, tintEnabled)}>
            ↓ HTML
          </button>
          <button type="button" className="btn btn-secondary canvas-toolbar__btn" onClick={() => downloadZIP(state, tintEnabled)}>
            ⎁ ZIP
          </button>
          <button
            type="button"
            className={`btn canvas-toolbar__btn ${saved ? 'btn-secondary' : 'btn-accent'}`}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saving ? 'Saving…' : saved ? 'Saved ✓' : '💾 Save'}
          </button>
          <button type="button" className="btn btn-primary canvas-toolbar__btn" onClick={onNext}>
            Finish →
          </button>
        </div>
      </div>

      {/* Hint bar */}
      <div className="canvas-hint">
        Pan to explore · Scroll to zoom · Drag images to rearrange
      </div>

      {/* Palette + keywords strip */}
      <div className="canvas-palette-strip">
        {[state.primaryColor, state.secondaryColor, accentColor].map((c, i) => (
          <div key={i} className="canvas-palette-swatch" style={{ background: c }} title={c} />
        ))}
        <span className="canvas-palette-label">{preset?.name}</span>
        {state.keywords.map(k => (
          <span key={k} className="canvas-keyword-chip" style={{ borderColor: accentColor, color: accentColor }}>
            {k}
          </span>
        ))}
      </div>

      {/* Infinite canvas */}
      <div className="canvas-viewport">
        <TransformWrapper
          initialScale={0.75}
          minScale={0.2}
          maxScale={4}
          panning={{ disabled: draggingId !== null }}
          wheel={{ step: 0.08 }}
          centerOnInit
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: CANVAS_W, height: CANVAS_H }}
          >
            <CanvasContent
              state={state}
              positions={positions}
              setPositions={setPositions}
              draggingId={draggingId}
              setDraggingId={setDraggingId}
              tintEnabled={tintEnabled}
              accentColor={accentColor}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}
