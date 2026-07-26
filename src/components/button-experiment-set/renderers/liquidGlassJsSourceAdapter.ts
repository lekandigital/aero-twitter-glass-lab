type ExactSourcePatch = {
  label: string;
  target: string;
  replacement: string;
};

export const LIQUID_GLASS_JS_SOURCE_ADAPTATIONS = [
  {
    label: 'destroyed state',
    target: '    this.webglInitialized = false\n',
    replacement:
      '    this.webglInitialized = false\n    this.__buttonExperimentDestroyed = false\n',
  },
  {
    label: 'deferred size guard',
    target:
      '    requestAnimationFrame(() => {\n      const rect = this.element.getBoundingClientRect()\n',
    replacement:
      '    requestAnimationFrame(() => {\n      if (this.__buttonExperimentDestroyed) return\n      const rect = this.element.getBoundingClientRect()\n',
  },
  {
    label: 'transform-neutral native size',
    target:
      '      let newWidth = Math.ceil(rect.width)\n      let newHeight = Math.ceil(rect.height)\n',
    replacement:
      '      let newWidth = Math.ceil(this.element.offsetWidth || rect.width)\n      let newHeight = Math.ceil(this.element.offsetHeight || rect.height)\n',
  },
  {
    label: 'orphaned snapshot release',
    target:
      '        Container.pageSnapshot = snapshot\n        Container.isCapturing = false\n\n        // Initialize WebGL for all waiting containers\n        const waitingContainers = Container.waitingForSnapshot.slice()\n',
    replacement:
      '        const liveWaitingContainers = Container.waitingForSnapshot.filter(container => !container.__buttonExperimentDestroyed)\n        if (liveWaitingContainers.length === 0) {\n          snapshot.width = 0\n          snapshot.height = 0\n          Container.pageSnapshot = null\n          Container.isCapturing = false\n          Container.waitingForSnapshot = []\n          return\n        }\n        Container.pageSnapshot = snapshot\n        Container.isCapturing = false\n\n        // Initialize WebGL for all waiting containers\n        const waitingContainers = liveWaitingContainers\n',
  },
  {
    label: 'WebGL initialization guard',
    target:
      '    if (!Container.pageSnapshot || !this.gl) return\n\n    const img = new Image()\n',
    replacement:
      '    if (this.__buttonExperimentDestroyed || !Container.pageSnapshot || !this.gl) return\n\n    const img = new Image()\n',
  },
  {
    label: 'image load guard',
    target: '    img.onload = () => {\n      this.setupShader(img)\n',
    replacement:
      '    img.onload = () => {\n      if (this.__buttonExperimentDestroyed) return\n      this.setupShader(img)\n',
  },
  {
    label: 'scroll listener handle',
    target:
      "    window.addEventListener('scroll', handleScroll, { passive: true })",
    replacement:
      "    this.__buttonExperimentHandleScroll = handleScroll\n    window.addEventListener('scroll', handleScroll, { passive: true })",
  },
] as const satisfies readonly ExactSourcePatch[];

function replaceExactSourceOnce(
  source: string,
  { target, replacement, label }: ExactSourcePatch,
) {
  const firstIndex = source.indexOf(target);
  if (
    firstIndex === -1 ||
    source.indexOf(target, firstIndex + target.length) !== -1
  ) {
    throw new Error(
      `Unable to apply unique liquid-glass-js source adaptation: ${label}`,
    );
  }
  return source.replace(target, replacement);
}

export function adaptLiquidGlassJsContainerSource(source: string) {
  return LIQUID_GLASS_JS_SOURCE_ADAPTATIONS.reduce(
    (adapted, patch) => replaceExactSourceOnce(adapted, patch),
    source,
  );
}
