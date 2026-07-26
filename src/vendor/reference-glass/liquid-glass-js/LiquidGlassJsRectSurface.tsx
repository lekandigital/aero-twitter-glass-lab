import { useEffect, useRef, type CSSProperties } from 'react';
import {
  captureReferenceOpticalInput,
  retainReferenceOpticalInputCapture,
  type ReferenceOpticalInput,
} from '../shared/referenceOpticalInput';
import {
  createWebGlProgram,
  deleteWebGlProgram,
  optionalUniform,
  requiredUniform,
} from '../shared/webgl';
import {
  LIQUID_GLASS_JS_RECT_DEFAULT_CONFIG,
  type LiquidGlassJsRectConfig,
} from './config';
import {
  LIQUID_GLASS_JS_FRAGMENT_SHADER,
  LIQUID_GLASS_JS_VERTEX_SHADER,
} from './shaders';
import './liquid-glass-js.css';

const POSITION_DATA = new Float32Array([
  -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
]);
const TEXCOORD_DATA = new Float32Array([
  0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0,
]);

type SurfaceStyle = CSSProperties & {
  '--e11-liquid-js-width': string;
  '--e11-liquid-js-height': string;
  '--e11-liquid-js-radius': string;
};

export function LiquidGlassJsRectSurface({
  presetId,
  config = LIQUID_GLASS_JS_RECT_DEFAULT_CONFIG,
}: {
  presetId: string;
  config?: LiquidGlassJsRectConfig;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const releaseCapture = retainReferenceOpticalInputCapture();
    const gl = canvas.getContext('webgl', {
      preserveDrawingBuffer: true,
      alpha: true,
      premultipliedAlpha: true,
    });
    if (!gl) {
      canvas.dataset.webglState = 'unsupported';
      releaseCapture();
      return;
    }

    let disposed = false;
    let trackingFrame = 0;
    let resizeTimer = 0;
    let opticalInput: ReferenceOpticalInput | null = null;
    let captureInFlight = false;
    let captureQueued = false;
    const resources = createWebGlProgram(
      gl,
      LIQUID_GLASS_JS_VERTEX_SHADER,
      LIQUID_GLASS_JS_FRAGMENT_SHADER,
    );
    const positionBuffer = gl.createBuffer();
    const texcoordBuffer = gl.createBuffer();
    const texture = gl.createTexture();
    if (!positionBuffer || !texcoordBuffer || !texture) {
      deleteWebGlProgram(gl, resources);
      releaseCapture();
      throw new Error('Unable to allocate liquid-glass-js WebGL resources');
    }

    gl.useProgram(resources.program);
    const positionLoc = gl.getAttribLocation(resources.program, 'a_position');
    const texcoordLoc = gl.getAttribLocation(resources.program, 'a_texcoord');
    const uniforms = {
      image: requiredUniform(gl, resources.program, 'u_image'),
      resolution: requiredUniform(gl, resources.program, 'u_resolution'),
      textureSize: requiredUniform(gl, resources.program, 'u_textureSize'),
      scrollY: requiredUniform(gl, resources.program, 'u_scrollY'),
      pageHeight: optionalUniform(gl, resources.program, 'u_pageHeight'),
      viewportHeight: optionalUniform(gl, resources.program, 'u_viewportHeight'),
      blurRadius: requiredUniform(gl, resources.program, 'u_blurRadius'),
      borderRadius: requiredUniform(gl, resources.program, 'u_borderRadius'),
      containerPosition: requiredUniform(
        gl,
        resources.program,
        'u_containerPosition',
      ),
      warp: requiredUniform(gl, resources.program, 'u_warp'),
      edgeIntensity: requiredUniform(
        gl,
        resources.program,
        'u_edgeIntensity',
      ),
      rimIntensity: requiredUniform(
        gl,
        resources.program,
        'u_rimIntensity',
      ),
      baseIntensity: requiredUniform(
        gl,
        resources.program,
        'u_baseIntensity',
      ),
      edgeDistance: requiredUniform(
        gl,
        resources.program,
        'u_edgeDistance',
      ),
      rimDistance: requiredUniform(
        gl,
        resources.program,
        'u_rimDistance',
      ),
      baseDistance: requiredUniform(
        gl,
        resources.program,
        'u_baseDistance',
      ),
      cornerBoost: requiredUniform(gl, resources.program, 'u_cornerBoost'),
      rippleEffect: requiredUniform(gl, resources.program, 'u_rippleEffect'),
      tintOpacity: requiredUniform(gl, resources.program, 'u_tintOpacity'),
    };

    canvas.width = config.width;
    canvas.height = config.height;
    gl.viewport(0, 0, config.width, config.height);
    gl.clearColor(0, 0, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, POSITION_DATA, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, TEXCOORD_DATA, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texcoordLoc);
    gl.vertexAttribPointer(texcoordLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.uniform2f(uniforms.resolution, config.width, config.height);
    gl.uniform2f(uniforms.textureSize, 1, 1);
    gl.uniform1f(uniforms.scrollY, 0);
    gl.uniform1f(uniforms.pageHeight, 1);
    gl.uniform1f(uniforms.viewportHeight, 1);
    gl.uniform1f(uniforms.blurRadius, config.blurRadius);
    gl.uniform1f(uniforms.borderRadius, config.radius);
    gl.uniform1f(uniforms.warp, config.warp ? 1 : 0);
    gl.uniform1f(uniforms.edgeIntensity, config.edgeIntensity);
    gl.uniform1f(uniforms.rimIntensity, config.rimIntensity);
    gl.uniform1f(uniforms.baseIntensity, config.baseIntensity);
    gl.uniform1f(uniforms.edgeDistance, config.edgeDistance);
    gl.uniform1f(uniforms.rimDistance, config.rimDistance);
    gl.uniform1f(uniforms.baseDistance, config.baseDistance);
    gl.uniform1f(uniforms.cornerBoost, config.cornerBoost);
    gl.uniform1f(uniforms.rippleEffect, config.rippleEffect);
    gl.uniform1f(uniforms.tintOpacity, config.tintOpacity);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uniforms.image, 0);

    const render = () => {
      if (disposed || !opticalInput) return;
      const rect = root.getBoundingClientRect();
      const centerX =
        rect.left + rect.width * 0.5 - opticalInput.bounds.left;
      const centerY =
        rect.top + rect.height * 0.5 - opticalInput.bounds.top;
      gl.uniform2f(uniforms.containerPosition, centerX, centerY);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.dataset.webglState = 'rendering';
    };

    const uploadCapture = (nextInput: ReferenceOpticalInput) => {
      opticalInput = nextInput;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        nextInput.canvas,
      );
      gl.uniform2f(
        uniforms.textureSize,
        nextInput.canvas.width,
        nextInput.canvas.height,
      );
      gl.uniform1f(uniforms.pageHeight, nextInput.canvas.height);
      gl.uniform1f(uniforms.viewportHeight, nextInput.canvas.height);
      canvas.dataset.opticalWidth = String(nextInput.canvas.width);
      canvas.dataset.opticalHeight = String(nextInput.canvas.height);
      render();
    };

    const recapture = async () => {
      if (captureInFlight) {
        captureQueued = true;
        return;
      }
      captureInFlight = true;
      try {
        const nextInput = await captureReferenceOpticalInput();
        if (!disposed) uploadCapture(nextInput);
      } catch {
        if (!disposed) canvas.dataset.webglState = 'capture-error';
      } finally {
        captureInFlight = false;
        if (captureQueued && !disposed) {
          captureQueued = false;
          void recapture();
        }
      }
    };

    const track = () => {
      render();
      trackingFrame = requestAnimationFrame(track);
    };
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => void recapture(), 300);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(root);
    window.addEventListener('resize', handleResize);
    void recapture();
    trackingFrame = requestAnimationFrame(track);

    return () => {
      disposed = true;
      cancelAnimationFrame(trackingFrame);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texcoordBuffer);
      gl.deleteTexture(texture);
      deleteWebGlProgram(gl, resources);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.dataset.webglState = 'destroyed';
      releaseCapture();
    };
  }, [config]);

  const style: SurfaceStyle = {
    '--e11-liquid-js-width': `${config.width}px`,
    '--e11-liquid-js-height': `${config.height}px`,
    '--e11-liquid-js-radius': `${config.radius}px`,
  };

  return (
    <div
      ref={rootRef}
      className="e11-liquid-glass-js-rect glass-container glass-button"
      data-e11-reference-preset={presetId}
      data-e11-reference-object-root={presetId}
      data-source-family="liquid-glass-js"
      data-source-preset-key="demo.js:helloButton"
      data-source-component="Button extends Container"
      data-source-selector=".glass-container.glass-button"
      data-renderer-family="webgl1-liquid-glass-js"
      data-content-policy="object-only-empty"
      data-visible-child-count="0"
      data-transparent-render-surface="true"
      data-native-width={config.width}
      data-native-height={config.height}
      data-native-radius={config.radius}
      data-canvas-dpr="1"
      data-webgl-context="webgl"
      data-preserve-drawing-buffer="true"
      data-warp={String(config.warp)}
      data-tint-opacity={config.tintOpacity}
      data-blur-radius={config.blurRadius}
      data-edge-intensity={config.edgeIntensity}
      data-rim-intensity={config.rimIntensity}
      data-base-intensity={config.baseIntensity}
      data-edge-distance={config.edgeDistance}
      data-rim-distance={config.rimDistance}
      data-base-distance={config.baseDistance}
      data-corner-boost={config.cornerBoost}
      data-ripple-effect={config.rippleEffect}
      style={style}
      role="img"
      aria-label="Empty liquid-glass-js rectangular WebGL glass"
    >
      <canvas
        ref={canvasRef}
        className="e11-liquid-glass-js-rect__canvas"
        width={config.width}
        height={config.height}
        aria-hidden="true"
      />
    </div>
  );
}
