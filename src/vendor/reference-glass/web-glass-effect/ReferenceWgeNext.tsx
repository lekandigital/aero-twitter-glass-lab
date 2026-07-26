import {
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
      data-reference-preset={presetId}
      data-source-family="wge-next"
      data-source-preset-key="LiquidGlassFormDemo.submitButton"
      data-source-key="LiquidGlassFormDemo.submitButton"
      data-source-component="LiquidGlassFormDemo.SubmitButton.LiquidGlass"
      data-renderer-family="wge-next-submit-button"
      data-content-policy="object-only-empty"
      data-visible-child-count="0"
      data-transparent-render-surface="true"
    >
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

  const handleBottomBarHover = (hovered: boolean) => {
    blur.set(hovered ? 0.8 : 0);
    refractiveIndex.set(hovered ? 2 : 1.4);
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
      data-e11-wge-component="empty-bottom-bar"
      data-e11-reference-preset={presetId}
      data-e11-reference-object-root={presetId}
      data-reference-preset={presetId}
      data-source-family="wge-next"
      data-source-preset-key="LiquidGlassDemo.bottomBar"
      data-source-key="LiquidGlassDemo.bottomBar"
      data-source-component="LiquidGlassDemo.bottomBar.LiquidGlass"
      data-renderer-family="wge-next-bottom-bar"
      data-content-policy="object-only-empty"
      data-transparent-render-surface="true"
      data-visible-child-count="0"
      data-rest-blur="0"
      data-rest-refractive-index="1.4"
      data-hover-blur="0.8"
      data-hover-refractive-index="2"
      onMouseEnter={() => handleBottomBarHover(true)}
      onMouseLeave={() => handleBottomBarHover(false)}
    />
  );
}
