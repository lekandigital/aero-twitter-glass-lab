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
  LIQUID_GLASS_SHADER_DEFAULT_CONFIG,
  type LiquidGlassShaderConfig,
} from './config';
import {
  LIQUID_GLASS_SHADER_COMPOSITE_FRAGMENT,
  LIQUID_GLASS_SHADER_COMPOSITE_VERTEX,
  LIQUID_GLASS_SHADER_FRAGMENT,
  LIQUID_GLASS_SHADER_VERTEX,
} from './shaders';
import './liquid-glass-shader.css';

const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

type SurfaceStyle = CSSProperties & {
  '--e11-shader-width': string;
  '--e11-shader-height': string;
};

export function LiquidGlassShaderSurface({
  presetId,
  config = LIQUID_GLASS_SHADER_DEFAULT_CONFIG,
}: {
  presetId: string;
  config?: LiquidGlassShaderConfig;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const releaseCapture = retainReferenceOpticalInputCapture();
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      canvas.dataset.webglState = 'unsupported';
      releaseCapture();
      return;
    }

    let disposed = false;
    let trackingFrame = 0;
    let resizeTimer = 0;
    let captureInFlight = false;
    let captureQueued = false;
    let opticalInput: ReferenceOpticalInput | null = null;
    const startedAt = performance.now();
    const exactProgram = createWebGlProgram(
      gl,
      LIQUID_GLASS_SHADER_VERTEX,
      LIQUID_GLASS_SHADER_FRAGMENT,
    );
    const compositeProgram = createWebGlProgram(
      gl,
      LIQUID_GLASS_SHADER_COMPOSITE_VERTEX,
      LIQUID_GLASS_SHADER_COMPOSITE_FRAGMENT,
    );
    const quadBuffer = gl.createBuffer();
    const sourceTexture = gl.createTexture();
    const exactTexture = gl.createTexture();
    const framebuffer = gl.createFramebuffer();
    if (!quadBuffer || !sourceTexture || !exactTexture || !framebuffer) {
      deleteWebGlProgram(gl, exactProgram);
      deleteWebGlProgram(gl, compositeProgram);
      releaseCapture();
      throw new Error('Unable to allocate liquid-glass-shader resources');
    }

    const outputWidth = Math.max(1, Math.round(config.width));
    const outputHeight = Math.max(1, Math.round(config.height));
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    gl.clearColor(0, 0, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);

    gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, exactTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const exactPosition = gl.getAttribLocation(exactProgram.program, 'position');
    const exactUniforms = {
      resolution: requiredUniform(gl, exactProgram.program, 'iResolution'),
      time: optionalUniform(gl, exactProgram.program, 'iTime'),
      mouse: requiredUniform(gl, exactProgram.program, 'iMouse'),
      texture: requiredUniform(gl, exactProgram.program, 'iChannel0'),
    };
    const compositePosition = gl.getAttribLocation(
      compositeProgram.program,
      'position',
    );
    const compositeUniforms = {
      exactPass: requiredUniform(
        gl,
        compositeProgram.program,
        'u_exactPass',
      ),
      sourceResolution: requiredUniform(
        gl,
        compositeProgram.program,
        'u_sourceResolution',
      ),
      sourceMouse: requiredUniform(
        gl,
        compositeProgram.program,
        'u_sourceMouse',
      ),
      outputResolution: requiredUniform(
        gl,
        compositeProgram.program,
        'u_outputResolution',
      ),
      outputRadius: requiredUniform(
        gl,
        compositeProgram.program,
        'u_outputRadius',
      ),
      geometryMode: requiredUniform(
        gl,
        compositeProgram.program,
        'u_geometryMode',
      ),
    };

    const configureAttribute = (location: number) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    };

    const allocateExactTarget = (width: number, height: number) => {
      gl.bindTexture(gl.TEXTURE_2D, exactTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        exactTexture,
        0,
      );
      if (
        gl.checkFramebufferStatus(gl.FRAMEBUFFER) !==
        gl.FRAMEBUFFER_COMPLETE
      ) {
        throw new Error('liquid-glass-shader framebuffer is incomplete');
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const uploadCapture = (nextInput: ReferenceOpticalInput) => {
      opticalInput = nextInput;
      gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        nextInput.canvas,
      );
      allocateExactTarget(nextInput.canvas.width, nextInput.canvas.height);
      canvas.dataset.opticalWidth = String(nextInput.canvas.width);
      canvas.dataset.opticalHeight = String(nextInput.canvas.height);
    };

    const render = (time: number) => {
      if (!opticalInput) return;
      const sourceWidth = opticalInput.canvas.width;
      const sourceHeight = opticalInput.canvas.height;
      const rect = root.getBoundingClientRect();
      const sourceMouseX =
        ((rect.left + rect.width * 0.5 - opticalInput.bounds.left) /
          opticalInput.bounds.width) *
        sourceWidth;
      const sourceMouseY =
        sourceHeight -
        ((rect.top + rect.height * 0.5 - opticalInput.bounds.top) /
          opticalInput.bounds.height) *
          sourceHeight;

      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.viewport(0, 0, sourceWidth, sourceHeight);
      gl.useProgram(exactProgram.program);
      configureAttribute(exactPosition);
      gl.uniform3f(
        exactUniforms.resolution,
        sourceWidth,
        sourceHeight,
        1,
      );
      gl.uniform1f(exactUniforms.time, (time - startedAt) / 1000);
      gl.uniform4f(
        exactUniforms.mouse,
        sourceMouseX,
        sourceMouseY,
        0,
        0,
      );
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sourceTexture);
      gl.uniform1i(exactUniforms.texture, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, outputWidth, outputHeight);
      gl.useProgram(compositeProgram.program);
      configureAttribute(compositePosition);
      gl.uniform2f(
        compositeUniforms.sourceResolution,
        sourceWidth,
        sourceHeight,
      );
      gl.uniform2f(
        compositeUniforms.sourceMouse,
        sourceMouseX,
        sourceMouseY,
      );
      gl.uniform2f(
        compositeUniforms.outputResolution,
        outputWidth,
        outputHeight,
      );
      gl.uniform1f(compositeUniforms.outputRadius, config.radius ?? 0);
      gl.uniform1f(
        compositeUniforms.geometryMode,
        config.outputMask === 'source-superellipse' ? 0 : 1,
      );
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, exactTexture);
      gl.uniform1i(compositeUniforms.exactPass, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      canvas.dataset.webglState = 'rendering';
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

    const track = (time: number) => {
      if (disposed) return;
      render(time);
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
      gl.deleteBuffer(quadBuffer);
      gl.deleteTexture(sourceTexture);
      gl.deleteTexture(exactTexture);
      gl.deleteFramebuffer(framebuffer);
      deleteWebGlProgram(gl, exactProgram);
      deleteWebGlProgram(gl, compositeProgram);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.dataset.webglState = 'destroyed';
      releaseCapture();
    };
  }, [config]);

  const style: SurfaceStyle = {
    '--e11-shader-width': `${config.width}px`,
    '--e11-shader-height': `${config.height}px`,
  };

  return (
    <div
      ref={rootRef}
      className="e11-liquid-glass-shader-surface"
      data-e11-reference-preset={presetId}
      data-e11-reference-object-root={presetId}
      data-source-family="liquid-glass-shader"
      data-source-preset-key="dist:#fragShader"
      data-source-component="canvas#canvas + #fragShader"
      data-source-selector="#canvas"
      data-renderer-family="webgl1-exact-fragment-transparent-composite"
      data-content-policy="object-only-empty"
      data-visible-child-count="0"
      data-transparent-render-surface="true"
      data-native-width={config.width}
      data-native-height={config.height}
      data-native-radius={config.radius ?? 'source-superellipse'}
      data-source-geometry="viewport-coupled-p6-superellipse"
      data-source-fragment-pass="exact-unchanged"
      data-output-mask={config.outputMask}
      data-canvas-dpr={config.sourceCanvasDpr}
      data-webgl-context="webgl"
      data-optical-input="live-experiment-eleven-layer-b"
      style={style}
      role="img"
      aria-label="Empty liquid glass shader WebGL object"
    >
      <canvas
        ref={canvasRef}
        className="e11-liquid-glass-shader-surface__canvas"
        width={Math.max(1, Math.round(config.width))}
        height={Math.max(1, Math.round(config.height))}
        aria-hidden="true"
      />
    </div>
  );
}
