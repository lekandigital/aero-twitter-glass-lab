import {
  createApp,
  defineComponent,
  h,
  type PropType,
  type StyleValue,
} from 'vue';
import { useEffect, useId, useRef } from 'react';
import { getGlassProjectDataAttributes } from '../objectIdentity.ts';
import { FRONTEND_VUE_APP_CARD_PRESET } from '../presets.ts';
import {
  resolveGlassGeometry,
  type GlassProjectRendererProps,
} from '../types.ts';
import styles from './FrontendVueAppCardGlass.module.css';

type VueAppCardGeometry = Readonly<{
  width: number;
  height: number;
  cornerRadius: number;
}>;

const VueAppCardObject = defineComponent({
  name: 'AppCard',
  props: {
    filterId: {
      type: String,
      required: true,
    },
    geometry: {
      type: Object as PropType<VueAppCardGeometry>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const cardStyle = {
        width: `${props.geometry.width}px`,
        height: `${props.geometry.height}px`,
        borderRadius: `${props.geometry.cornerRadius}px`,
        backdropFilter: `brightness(1.1) blur(2px) url("#${props.filterId}")`,
        WebkitBackdropFilter: `brightness(1.1) blur(2px) url("#${props.filterId}")`,
      } satisfies StyleValue;

      return h(
        'div',
        {
          class: styles.vueObjectRoot,
          'data-vue-source-component': 'AppCard',
        },
        [
          h('div', {
            class: styles.card,
            style: cardStyle,
          }),
          h(
            'svg',
            {
              'aria-hidden': 'true',
              class: styles.definitions,
              focusable: 'false',
            },
            [
              h(
                'filter',
                {
                  id: props.filterId,
                },
                [
                  h('feTurbulence', {
                    type: 'turbulence',
                    baseFrequency: '0.01',
                    numOctaves: '2',
                    result: 'turbulence',
                  }),
                  h('feDisplacementMap', {
                    in: 'SourceGraphic',
                    in2: 'turbulence',
                    scale: '200',
                    xChannelSelector: 'R',
                    yChannelSelector: 'G',
                  }),
                ],
              ),
            ],
          ),
        ],
      );
    };
  },
});

export function FrontendVueAppCardGlass({
  referencePresetId,
  geometry: geometryOverride,
  className,
  style,
}: GlassProjectRendererProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const filterId = `frontend-vue-displacement-${useId().replaceAll(':', '')}`;
  const geometry = resolveGlassGeometry(
    FRONTEND_VUE_APP_CARD_PRESET.geometry,
    geometryOverride,
  );
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const app = createApp(VueAppCardObject, {
      filterId,
      geometry: {
        width: geometry.width,
        height: geometry.height,
        cornerRadius: geometry.cornerRadius,
      },
    });
    app.mount(mount);

    return () => {
      app.unmount();
    };
  }, [filterId, geometry.cornerRadius, geometry.height, geometry.width]);

  return (
    <div
      {...getGlassProjectDataAttributes(
        FRONTEND_VUE_APP_CARD_PRESET,
        geometry,
        referencePresetId,
      )}
      aria-hidden="true"
      className={rootClassName}
      data-interactjs-drag="disabled"
      data-native-runtime="vue@3.5.17"
      data-render-state="ready"
      style={{
        width: geometry.width,
        height: geometry.height,
        ...style,
      }}
    >
      <div ref={mountRef} className={styles.vueMount} />
    </div>
  );
}
