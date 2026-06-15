export type ReferenceRuntime =
  | 'css-only'
  | 'vanilla-js'
  | 'react'
  | 'vue'
  | 'svelte'
  | 'webgl'
  | 'three'
  | 'svg-filter'
  | 'shader'
  | 'library'
  | 'article'
  | 'video'
  | 'paper'
  | 'external'
  | 'unknown';

export type ReferencePreviewMode =
  | 'iframe-local'
  | 'iframe-external'
  | 'link-only'
  | 'source-only'
  | 'native-react-later';

export type ReferenceCategory =
  | 'CodePen pages'
  | 'JSFiddle pages'
  | 'GitHub pages'
  | 'Live demos'
  | 'Reference/tutorial/package pages'
  | 'Reddit discussions'
  | 'YouTube references'
  | 'Wikipedia/design history'
  | 'Papers'
  | 'Articles/news/design reactions'
  | 'Google searches'
  | 'Local CodePen exports'
  | 'Local GitHub static demos'
  | 'Web archives'
  | 'Final UI candidates';

export interface ReferenceItem {
  id: string;
  title: string;
  category: ReferenceCategory;
  runtime: ReferenceRuntime;
  previewMode: ReferencePreviewMode;
  sourceUrl?: string;
  localSourcePath?: string;
  localDemoPath?: string;
  notes?: string;
  usefulnessScore: number;
  tags: string[];
  candidateFor: string[];
  hasLocalDemo: boolean;
  hasExternalUrl: boolean;
}

export type ReferenceSortKey =
  | 'usefulness'
  | 'category'
  | 'title'
  | 'runtime';

export type ReferenceFilterKey =
  | 'all'
  | 'local-demos'
  | 'codepen'
  | 'github'
  | 'webgl'
  | 'css-svg'
  | 'react'
  | 'vue'
  | 'articles'
  | 'final-candidates';
