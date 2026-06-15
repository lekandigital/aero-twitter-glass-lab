import type { ReferenceItem } from './types';

/** Known high-value references for native React porting priority. */
export const NATIVE_PORT_PRIORITY: Array<{
  pattern: RegExp;
  label: string;
  score: number;
}> = [
  { pattern: /glass-button-css-only/i, label: 'glass-button-css-only', score: 95 },
  { pattern: /liquid-glass-switcher-css/i, label: 'liquid-glass-switcher-css', score: 94 },
  { pattern: /liquidGL|liquidgl/i, label: 'naughtyduk/liquidGL', score: 92 },
  { pattern: /liquid-glass-react|rdev/i, label: 'rdev/liquid-glass-react', score: 90 },
  { pattern: /7\.css/i, label: '7.css', score: 88 },
  { pattern: /7-Aero-Stylesheet/i, label: '7-Aero-Stylesheet', score: 86 },
  { pattern: /glass-refraction/i, label: 'glass-refraction', score: 84 },
  { pattern: /liquid-glass-js|dashersw/i, label: 'liquid-glass-js', score: 82 },
  { pattern: /archisvaze/i, label: 'archisvaze/liquid-glass', score: 80 },
  { pattern: /kube\.io|kube-liquid/i, label: 'kube.io liquid glass', score: 80 },
];

export function scoreLabel(score: number): string {
  if (score >= 85) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  if (score >= 30) return 'Low';
  return 'Discovery';
}

export function scoreColor(score: number): string {
  if (score >= 85) return '#5effa8';
  if (score >= 70) return '#5eb8ff';
  if (score >= 50) return '#c4a8ff';
  return 'rgba(244, 248, 255, 0.55)';
}

export function getTopPortCandidates(
  items: ReferenceItem[],
  limit = 8,
): ReferenceItem[] {
  return [...items]
    .filter(
      (item) =>
        item.hasLocalDemo ||
        item.usefulnessScore >= 80 ||
        item.candidateFor.includes('final-hybrid-ui'),
    )
    .sort((a, b) => b.usefulnessScore - a.usefulnessScore)
    .slice(0, limit);
}
