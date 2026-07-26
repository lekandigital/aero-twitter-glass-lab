export type ReferenceObjectGeometry = Readonly<{
  width: number;
  height: number;
  radius: number | null;
  boxModel: 'border-box' | 'content-box' | 'viewport-coupled';
}>;

export type ReferenceSourceFile = Readonly<{
  path: string;
  sha256: string;
  role: string;
}>;

export type ReferenceObjectProvenance = Readonly<{
  sourceRepository: string;
  sourceCommit: string;
  sourceFamily: string;
  sourceComponent: string;
  sourceSelector: string;
  localAdaptedPath: string;
  renderer: string;
  sourceFiles: readonly ReferenceSourceFile[];
  omittedVisibleContent: readonly string[];
  intentionalAdaptations: readonly string[];
}>;

export type ReferenceObjectContract<Config> = Readonly<{
  key: string;
  nativeGeometry: ReferenceObjectGeometry;
  defaultConfig: Readonly<Config>;
  provenance: ReferenceObjectProvenance;
}>;

export const STANDARD_REFERENCE_OBJECT_GEOMETRY = {
  width: 358,
  height: 140,
  radius: 54,
  boxModel: 'border-box',
} as const satisfies ReferenceObjectGeometry;
