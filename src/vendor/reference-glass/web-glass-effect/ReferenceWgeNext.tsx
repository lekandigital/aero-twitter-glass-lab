import { Search, ZoomIn, ZoomOut } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from 'motion/react';
import { SourceLiquidGlass } from './SourceLiquidGlass';

const SPRING_CONFIG = { stiffness: 300, damping: 30 } as const;

/** The single source Submit Form button; no form or demo frame is mounted. */
export function WgeNextSubmitButtonReference({ presetId }: { presetId: string }) {
  return (
    <button
      type="submit"
      aria-label="Submit"
      className="e11-wge-submit-button experiment-eleven-reference-interactive"
      data-e11-wge-preset={presetId}
      data-e11-reference-object-root={presetId}
      data-e11-wge-component="submit-form-button"
      data-source-family="wge-next"
      data-source-preset-key="LiquidGlassFormDemo.submitButton"
      data-source-component="LiquidGlassFormDemo.SubmitButton.LiquidGlass"
      data-transparent-render-surface="true"
    >
      <span>Submit Form</span>
      <SourceLiquidGlass
        glassThickness={110}
        bezelWidth={10}
        refractiveIndex={1.8}
        blur={0.4}
        data-e11-wge-instance="submit-form-button"
        data-source-component="LiquidGlass"
        className="e11-wge-submit-button__glass"
      />
    </button>
  );
}

/**
 * The source bottom bar only. A 672px source demo bed gives the exact
 * right-4/left-4 wrapper a 640px natural bar; the rest of the photo grid and
 * both top-right arrow controls are intentionally absent.
 */
export function WgeNextBottomBarReference({
  presetId,
}: {
  presetId: string;
}) {
  const blur = useSpring(0, SPRING_CONFIG);
  const refractiveIndex = useSpring(1.4, SPRING_CONFIG);
  const isSearchFocused = useMotionValue(false);
  const latestBlur = useMotionValue(0);
  const latestRefractiveIndex = useMotionValue(1.4);

  useMotionValueEvent(blur, 'change', (value) => latestBlur.set(value));
  useMotionValueEvent(refractiveIndex, 'change', (value) => latestRefractiveIndex.set(value));

  const handleBottomBarHover = (hovered: boolean) => {
    blur.set(hovered ? 0.8 : isSearchFocused.get() ? 3.5 : 0);
    refractiveIndex.set(hovered ? 2 : isSearchFocused.get() ? 3 : 1.4);
  };

  const handleSearchFocus = (focused: boolean) => {
    isSearchFocused.set(focused);
    blur.set(focused ? 3.5 : 0);
    refractiveIndex.set(focused ? 3 : 1.4);
  };

  return (
    <SourceLiquidGlass
      glassThickness={110}
      bezelWidth={20}
      refractiveIndex={refractiveIndex}
      blur={blur}
      specularOpacity={0.9}
      className="e11-wge-bottom-bar"
      style={{ borderRadius: 28 }}
      data-e11-wge-instance="bottom-bar"
      data-e11-reference-preset={presetId}
      data-e11-reference-object-root={presetId}
      data-source-family="wge-next"
      data-source-preset-key="LiquidGlassDemo.bottomBar"
      data-source-component="LiquidGlassDemo.bottomBar.LiquidGlass"
      data-transparent-render-surface="true"
      onMouseEnter={() => handleBottomBarHover(true)}
      onMouseLeave={() => handleBottomBarHover(false)}
    >
      <motion.div
        className="e11-wge-bottom-bar__state"
        data-e11-wge-preset={presetId}
        data-e11-wge-component="complete-bottom-bar"
        data-source-family="wge-next"
        data-source-preset-key="LiquidGlassDemo.bottomBar"
        data-source-component="LiquidGlassDemo.BottomBar.LiquidGlass"
        data-transparent-render-surface="true"
        data-rest-blur={0}
        data-rest-refractive-index={1.4}
        data-hover-blur={0.8}
        data-hover-refractive-index={2}
        data-focus-blur={3.5}
        data-focus-refractive-index={3}
        data-current-blur={latestBlur}
        data-current-refractive-index={latestRefractiveIndex}
      >
        <div className="e11-wge-bottom-bar__dimensions">
          <div><span>W</span><input type="number" value={400} readOnly /></div>
          <div><span>H</span><input type="number" value={600} readOnly /></div>
        </div>
        <div className="e11-wge-bottom-bar__search">
          <Search aria-hidden="true" />
          <input
            type="text"
            placeholder="Search images..."
            className="experiment-eleven-reference-interactive"
            onFocus={() => handleSearchFocus(true)}
            onBlur={() => handleSearchFocus(false)}
          />
        </div>
        <div className="e11-wge-bottom-bar__zoom">
          <button
            type="button"
            aria-label="Zoom out"
            className="experiment-eleven-reference-interactive"
            disabled
          >
            <ZoomOut aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            className="experiment-eleven-reference-interactive"
            disabled
          >
            <ZoomIn aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </SourceLiquidGlass>
  );
}
