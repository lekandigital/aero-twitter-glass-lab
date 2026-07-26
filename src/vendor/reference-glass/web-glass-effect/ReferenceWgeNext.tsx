import { useId } from 'react';
import { Search, ZoomIn, ZoomOut } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  type MotionValue,
} from 'motion/react';
import { LiquidFilter } from '../../web-glass-effect/motion/liquid/filter';
import { CONVEX } from '../../web-glass-effect/motion/liquid/liquid-lib';

const SPRING_CONFIG = { stiffness: 300, damping: 30 } as const;

function safeId(prefix: string, reactId: string) {
  return `${prefix}-${reactId}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function WgeLiquidSurface({
  instance,
  width,
  height,
  radius,
  glassThickness = 110,
  bezelWidth,
  refractiveIndex,
  blur,
  specularOpacity = 1,
  children,
  className = '',
  onMouseEnter,
  onMouseLeave,
}: {
  instance: string;
  width: number;
  height: number;
  radius: number;
  glassThickness?: number;
  bezelWidth: number;
  refractiveIndex: number | MotionValue<number>;
  blur: number | MotionValue<number>;
  specularOpacity?: number;
  children?: React.ReactNode;
  className?: string;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
}) {
  const reactId = useId();
  const filterId = safeId(`e11-wge-${instance}`, reactId);
  return (
    <div
      className={`e11-wge-liquid-surface ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius: radius,
        backdropFilter: `url(#${filterId})`,
        WebkitBackdropFilter: `url(#${filterId})`,
      }}
      data-glass-thickness={glassThickness}
      data-bezel-width={bezelWidth}
      data-radius={radius}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <LiquidFilter
        id={filterId}
        width={width}
        height={height}
        radius={radius}
        glassThickness={glassThickness}
        bezelWidth={bezelWidth}
        refractiveIndex={refractiveIndex}
        blur={blur}
        specularOpacity={specularOpacity}
        specularSaturation={4}
        bezelHeightFn={CONVEX.fn}
        dpr={typeof window === 'undefined' ? 1 : window.devicePixelRatio}
      />
      {children}
    </div>
  );
}

function FormLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return <label htmlFor={htmlFor}>{children}</label>;
}

function FormFieldGlass({
  instance,
  width,
  height,
  radius,
  bezelWidth,
}: {
  instance: string;
  width: number;
  height: number;
  radius: number;
  bezelWidth: number;
}) {
  return (
    <WgeLiquidSurface
      instance={instance}
      width={width}
      height={height}
      radius={radius}
      glassThickness={110}
      bezelWidth={bezelWidth}
      refractiveIndex={1.8}
      blur={0.4}
      className="e11-wge-form__glass"
    />
  );
}

/** Whole source form, including its animated grid bed. */
export function WgeNextFormReference({ presetId }: { presetId: string }) {
  const reactId = useId();
  const prefix = safeId('e11-wge-form', reactId);
  const firstNameId = `${prefix}-first-name`;
  const lastNameId = `${prefix}-last-name`;
  const messageId = `${prefix}-message`;
  const genderId = `${prefix}-gender`;

  return (
    <div
      className="e11-wge-form"
      data-e11-wge-preset={presetId}
      data-e11-wge-component="complete-form"
      data-source-width={432}
      data-source-height={560}
    >
      <div className="e11-wge-form__animated-grid" aria-hidden="true" />
      <form
        className="e11-wge-form__form"
        onSubmit={(event) => event.preventDefault()}
        aria-label="WGE Next complete form"
      >
        <div className="e11-wge-form__name-grid">
          <div className="e11-wge-form__field">
            <FormLabel htmlFor={firstNameId}>First Name</FormLabel>
            <div className="e11-wge-form__control" style={{ borderRadius: 20 }}>
              <input
                id={firstNameId}
                className="experiment-eleven-reference-interactive"
                type="text"
                placeholder="John"
              />
              <FormFieldGlass
                instance={`${prefix}-first-name`}
                width={184}
                height={40}
                radius={20}
                bezelWidth={20}
              />
            </div>
          </div>
          <div className="e11-wge-form__field">
            <FormLabel htmlFor={lastNameId}>Last Name</FormLabel>
            <div className="e11-wge-form__control" style={{ borderRadius: 20 }}>
              <input
                id={lastNameId}
                className="experiment-eleven-reference-interactive"
                type="text"
                placeholder="Doe"
              />
              <FormFieldGlass
                instance={`${prefix}-last-name`}
                width={184}
                height={40}
                radius={20}
                bezelWidth={10}
              />
            </div>
          </div>
        </div>

        <div className="e11-wge-form__field">
          <FormLabel htmlFor={messageId}>Message</FormLabel>
          <div className="e11-wge-form__control" style={{ borderRadius: 16 }}>
            <textarea
              id={messageId}
              className="experiment-eleven-reference-interactive"
              placeholder="Tell us about yourself..."
              rows={4}
            />
            <FormFieldGlass
              instance={`${prefix}-message`}
              width={384}
              height={98}
              radius={16}
              bezelWidth={20}
            />
          </div>
        </div>

        <div className="e11-wge-form__field">
          <FormLabel htmlFor={genderId}>Gender</FormLabel>
          <div className="e11-wge-form__control" style={{ borderRadius: 12 }}>
            <select
              id={genderId}
              className="experiment-eleven-reference-interactive"
              defaultValue=""
            >
              <option value="" disabled>Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            <FormFieldGlass
              instance={`${prefix}-gender`}
              width={384}
              height={40}
              radius={12}
              bezelWidth={10}
            />
          </div>
        </div>

        <div className="e11-wge-form__submit-wrap">
          <button
            aria-label="Submit"
            type="submit"
            className="experiment-eleven-reference-interactive"
          >
            <span>Submit Form</span>
          </button>
          <FormFieldGlass
            instance={`${prefix}-submit`}
            width={384}
            height={36}
            radius={18}
            bezelWidth={10}
          />
        </div>
      </form>
    </div>
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
    <WgeLiquidSurface
      instance="bottom-bar"
      width={640}
      height={56}
      radius={28}
      glassThickness={110}
      bezelWidth={20}
      refractiveIndex={refractiveIndex}
      blur={blur}
      specularOpacity={0.9}
      className="e11-wge-bottom-bar"
      onMouseEnter={() => handleBottomBarHover(true)}
      onMouseLeave={() => handleBottomBarHover(false)}
    >
      <motion.div
        className="e11-wge-bottom-bar__state"
        data-e11-wge-preset={presetId}
        data-e11-wge-component="complete-bottom-bar"
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
    </WgeLiquidSurface>
  );
}
