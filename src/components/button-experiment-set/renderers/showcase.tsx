import {
  Frame,
  Glass,
  GlassContainer,
  Html,
  LiquidCanvas,
  spring,
  Transform,
  ZStack,
} from '@liquid-dom/react';
import {
  Album,
  Bluetooth,
  Camera,
  Clock3,
  Flashlight,
  Grid2X2,
  Grid3X3,
  House,
  MicVocal,
  Music,
  Plane,
  Play,
  Podcast,
  Radio,
  RotateCcw,
  RotateCw,
  Search,
  SquareUserRound,
  Star,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { ButtonRendererProps } from './sourceCss.tsx';
import styles from './showcase.module.css';
import {
  LIQUID_DOM_SHOWCASE_BUTTON_CONFIG_BY_ID,
  SHOWCASE_LIQUID_GLASS_FAMILIES,
  VIDEO_SKIP_PATHS,
  getShowcaseTechnicalInset,
  type ShowcaseControlConfig,
  type ShowcaseGlassConfig,
  type ShowcaseLiquidGlassFamily,
  type ShowcaseSidebarConfig,
  type ShowcaseTabConfig,
  type ShowcaseToggleConfig,
} from './showcaseConfig.ts';
import { useButtonStageCapture } from './useButtonStageCapture.ts';

const SIDEBAR_ICONS: Record<
  ShowcaseSidebarConfig['icon'],
  LucideIcon
> = {
  Search,
  House,
  Grid2X2,
  Radio,
  Clock3,
  MicVocal,
  Album,
  Music,
  SquareUserRound,
  Grid3X3,
  Star,
};

const GLASS_SPRINGS = {
  'ios-action': spring({
    ...SHOWCASE_LIQUID_GLASS_FAMILIES['ios-action'].scaleSpring,
  }),
  'menu-dots': spring({
    ...SHOWCASE_LIQUID_GLASS_FAMILIES['menu-dots'].scaleSpring,
  }),
  'notification-center': spring({
    ...SHOWCASE_LIQUID_GLASS_FAMILIES['notification-center']
      .scaleSpring,
  }),
  'video-control': spring({
    ...SHOWCASE_LIQUID_GLASS_FAMILIES['video-control'].scaleSpring,
  }),
} as const;

function ShowcaseTab({
  config,
}: {
  config: ShowcaseTabConfig;
}) {
  const [selected, setSelected] = useState(config.initiallySelected);
  return (
    <button
      aria-pressed={selected}
      className={[
        styles.tab,
        selected ? styles.tabSelected : '',
      ].join(' ')}
      data-source-component="App.tabButton"
      type="button"
      onClick={() => setSelected(true)}
    >
      {config.text}
    </button>
  );
}

function ShowcaseToggle({
  config,
}: {
  config: ShowcaseToggleConfig;
}) {
  const [checked, setChecked] = useState(false);
  const iosTheme = config.theme === 'ios-night-mode';
  return (
    <button
      aria-pressed={checked}
      className={[
        styles.toggle,
        iosTheme ? styles.iosToggle : styles.menuToggle,
        checked
          ? iosTheme
            ? styles.iosToggleActive
            : styles.menuToggleActive
          : '',
      ].join(' ')}
      data-source-component={
        iosTheme
          ? 'IosNotificationDemo.nightModeToggle'
          : 'MenuDemo.slowMoToggle'
      }
      type="button"
      onClick={() => setChecked((value) => !value)}
    >
      <span className={styles.toggleCheckbox} aria-hidden="true" />
      {config.text}
    </button>
  );
}

function CellularBars() {
  return (
    <span className={styles.cellBars} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function ControlCenterButton({
  config,
  label,
}: {
  config: ShowcaseControlConfig;
  label: string;
}) {
  switch (config.control) {
    case 'airplane':
      return (
        <button
          aria-label={label}
          className={`${styles.controlButton} ${styles.airplane}`}
          type="button"
        >
          <Plane className={styles.largeIcon} />
        </button>
      );
    case 'airdrop':
      return (
        <button
          aria-label={label}
          className={`${styles.controlButton} ${styles.airdrop}`}
          type="button"
        >
          <Podcast className={styles.largeIcon} />
        </button>
      );
    case 'wifi':
      return (
        <button
          aria-label={label}
          className={`${styles.controlButton} ${styles.wifi}`}
          type="button"
        >
          <Wifi className={styles.largeIcon} />
        </button>
      );
    case 'small-grid':
      return (
        <button
          aria-label={label}
          className={styles.smallButtonGroup}
          type="button"
        >
          <span
            className={`${styles.groupButton} ${styles.cellularButton}`}
          >
            <CellularBars />
          </span>
          <span
            className={`${styles.groupButton} ${styles.bluetoothButton}`}
          >
            <Bluetooth className={styles.smallIcon} />
          </span>
          <span
            className={`${styles.groupButton} ${styles.satelliteButton}`}
          >
            <Radio className={styles.smallIcon} />
          </span>
          <span
            className={`${styles.groupButton} ${styles.smallAntennaButton}`}
          >
            <Podcast className={styles.smallIcon} />
          </span>
        </button>
      );
    case 'airplay':
      return (
        <button
          aria-label={label}
          className={`${styles.controlButton} ${styles.airplay}`}
          type="button"
        >
          <Podcast className={styles.antennaIcon} />
        </button>
      );
    case 'skip-back':
    case 'skip-forward': {
      const BackOrForward =
        config.control === 'skip-back' ? RotateCcw : RotateCw;
      return (
        <button
          aria-label={label}
          className={`${styles.mediaButton} ${styles.skipButton}`}
          type="button"
        >
          <BackOrForward className={styles.controlSkipIcon} />
          <span>15</span>
        </button>
      );
    }
    case 'play':
      return (
        <button
          aria-label={label}
          className={`${styles.mediaButton} ${styles.playButton}`}
          type="button"
        >
          <Play
            className={styles.controlPlayIcon}
            fill="currentColor"
          />
        </button>
      );
  }
}

function MusicSidebarButton({
  config,
}: {
  config: ShowcaseSidebarConfig;
}) {
  const [selected, setSelected] = useState(config.initiallySelected);
  const Icon = SIDEBAR_ICONS[config.icon];
  return (
    <button
      aria-current={selected ? 'page' : undefined}
      className={[
        styles.sidebarItem,
        selected ? styles.sidebarItemActive : '',
      ].join(' ')}
      data-source-item={config.item}
      type="button"
      onClick={() => setSelected(true)}
    >
      <Icon className={styles.sidebarIcon} aria-hidden="true" />
      <span>{config.text}</span>
    </button>
  );
}

function SkipIcon({
  direction,
}: {
  direction: 'back' | 'forward';
}) {
  return (
    <svg
      aria-hidden="true"
      className={styles.videoSkipIcon}
      viewBox="0 0 56 56"
    >
      <path fill="currentColor" d={VIDEO_SKIP_PATHS[direction]} />
    </svg>
  );
}

function PlayPauseIcon({ paused }: { paused: boolean }) {
  if (!paused) {
    return (
      <svg
        aria-hidden="true"
        className={styles.videoPlayIcon}
        viewBox="0 0 32 32"
      >
        <rect
          x="9"
          y="7"
          width="5"
          height="18"
          rx="1.5"
          fill="currentColor"
        />
        <rect
          x="18"
          y="7"
          width="5"
          height="18"
          rx="1.5"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={styles.videoPlayIcon}
      viewBox="0 0 32 32"
    >
      <path
        d="M11 7.8v16.4c0 1.1 1.2 1.8 2.2 1.2l12.4-8.2c0.9-0.6 0.9-1.9 0-2.5L13.2 6.5C12.2 5.9 11 6.6 11 7.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GlassContent({
  config,
  paused,
}: {
  config: ShowcaseGlassConfig;
  paused: boolean;
}) {
  switch (config.content) {
    case 'ios-options':
    case 'ios-clear':
      return (
        <div
          className={styles.actionLabel}
          data-source-label-opacity-adaptation="isolated-visible"
        >
          {config.content === 'ios-options' ? 'Options' : 'Clear'}
        </div>
      );
    case 'menu-dots':
      return (
        <div className={styles.menuDots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      );
    case 'notification-flashlight':
      return (
        <div
          aria-label="Flashlight"
          className={styles.notificationContent}
        >
          <Flashlight
            aria-hidden="true"
            className={styles.notificationIcon}
          />
        </div>
      );
    case 'notification-camera':
      return (
        <div
          aria-label="Camera"
          className={styles.notificationContent}
        >
          <Camera
            aria-hidden="true"
            className={styles.notificationIcon}
          />
        </div>
      );
    case 'video-rewind-10':
      return (
        <div
          aria-label="Rewind 10 seconds"
          className={styles.videoIconContent}
        >
          <SkipIcon direction="back" />
        </div>
      );
    case 'video-forward-10':
      return (
        <div
          aria-label="Forward 10 seconds"
          className={styles.videoIconContent}
        >
          <SkipIcon direction="forward" />
        </div>
      );
    case 'video-play':
      return (
        <div
          aria-label={paused ? 'Play' : 'Pause'}
          className={styles.videoIconContent}
        >
          <PlayPauseIcon paused={paused} />
        </div>
      );
  }
}

function LiquidDomGlassButton({
  config,
}: {
  config: ShowcaseGlassConfig;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const family: ShowcaseLiquidGlassFamily =
    SHOWCASE_LIQUID_GLASS_FAMILIES[config.family];
  const technicalInset = getShowcaseTechnicalInset(family);
  const technicalWidth =
    config.geometry.width + technicalInset * 2;
  const technicalHeight =
    config.geometry.height + technicalInset * 2;
  const capture = useButtonStageCapture(
    rootRef,
    config.geometry,
    technicalInset,
  );
  const [rendererError, setRendererError] = useState<string | null>(
    null,
  );
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [paused, setPaused] = useState(true);
  const scale = pressed
    ? family.pressScale
    : hovered
      ? family.hoverScale
      : 1;
  const opticalInputStyle = useMemo<CSSProperties | undefined>(
    () =>
      capture.dataUrl
        ? { backgroundImage: `url("${capture.dataUrl}")` }
        : undefined,
    [capture.dataUrl],
  );
  const renderState = rendererError
    ? 'renderer-error'
    : capture.error
      ? 'capture-error'
      : capture.dataUrl
        ? 'ready'
        : 'capturing-stage';
  const content = (
    <Html sizing="fill">
      <GlassContent config={config} paused={paused} />
    </Html>
  );
  const glass = (
    <Glass
      cornerRadius={config.geometry.radius}
      pointerEvents
      onClick={
        config.content === 'video-play'
          ? () => setPaused((value) => !value)
          : undefined
      }
      onHover={setHovered}
      onPress={setPressed}
    >
      {family.key === 'ios-action' ? (
        <Frame
          width={config.geometry.width}
          height={config.geometry.height}
        >
          {content}
        </Frame>
      ) : (
        content
      )}
    </Glass>
  );

  return (
    <div
      ref={rootRef}
      className={styles.liquidRoot}
      data-showcase-glass-family={family.key}
      data-showcase-render-state={renderState}
      data-stage-capture-revision={capture.revision}
      data-stage-capture-error={capture.error ?? undefined}
      data-webgpu-renderer-error={rendererError ?? undefined}
      data-source-renderer="@liquid-dom/react"
    >
      <div className={styles.liquidClip}>
        {capture.dataUrl ? (
          <LiquidCanvas
            canvasClassName={styles.liquidCanvas}
            className={styles.liquidCanvasHost}
            frameloop="always"
            maxDpr={2}
            proposal={{
              width: technicalWidth,
              height: technicalHeight,
            }}
            style={{
              left: -technicalInset,
              top: -technicalInset,
              width: technicalWidth,
              height: technicalHeight,
            }}
            onError={(error: unknown) => {
              setRendererError(
                error instanceof Error ? error.message : String(error),
              );
            }}
          >
            <ZStack alignment="center">
              <Html zIndex={-2} sizing="fill">
                <div
                  className={styles.opticalInput}
                  data-button-showcase-optical-input="placement-stage"
                  style={opticalInputStyle}
                />
              </Html>

              <GlassContainer
                blendSupportGating={
                  family.optics.blendSupportGating
                }
                bezelWidth={family.optics.bezelWidth}
                blur={family.optics.blur}
                contentDepth={family.optics.contentDepth}
                contentIor={family.optics.contentIor}
                displacementBlur={
                  family.optics.displacementBlur
                }
                ior={family.optics.ior}
                shadowBlur={family.optics.shadowBlur}
                shadowColor={family.optics.shadowColor}
                shadowOffsetY={family.optics.shadowOffsetY}
                spacing={family.optics.spacing}
                specularOpacity={
                  family.optics.specularOpacity
                }
                thickness={family.optics.thickness}
                tint={family.optics.tint}
              >
                <Transform
                  origin={{ x: 0.5, y: 0.5 }}
                  scaleX={scale}
                  scaleY={scale}
                  transition={{
                    scaleX: GLASS_SPRINGS[family.key],
                    scaleY: GLASS_SPRINGS[family.key],
                  }}
                >
                  {family.key === 'ios-action' ? (
                    glass
                  ) : (
                    <Frame
                      width={config.geometry.width}
                      height={config.geometry.height}
                    >
                      {glass}
                    </Frame>
                  )}
                </Transform>
              </GlassContainer>
            </ZStack>
          </LiquidCanvas>
        ) : null}
      </div>
    </div>
  );
}

export function LiquidDomShowcaseButton({
  preset,
}: ButtonRendererProps) {
  const config =
    LIQUID_DOM_SHOWCASE_BUTTON_CONFIG_BY_ID[preset.id];
  if (!config) {
    throw new Error(
      `Missing exact Liquid DOM showcase config for ${preset.id}`,
    );
  }

  if (config.kind === 'tab') {
    return <ShowcaseTab config={config} />;
  }
  if (config.kind === 'toggle') {
    return <ShowcaseToggle config={config} />;
  }
  if (config.kind === 'control-center') {
    return (
      <ControlCenterButton
        config={config}
        label={preset.label}
      />
    );
  }
  if (config.kind === 'music-sidebar') {
    return <MusicSidebarButton config={config} />;
  }
  return <LiquidDomGlassButton config={config} />;
}
