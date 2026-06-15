import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DemoFrame, DemoMetaPanel } from '../reference-lab/components/DemoFrame';
import { DemoNotes } from '../reference-lab/components/DemoNotes';
import {
  DemoToolbar,
  type ViewportPreset,
} from '../reference-lab/components/DemoToolbar';
import { referenceIndex } from '../reference-lab/generated/referenceIndex';
import { getIframeSrc, getReferenceById } from '../reference-lab/referenceUtils';

export function ReferenceDemo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [preset, setPreset] = useState<ViewportPreset>('fluid');

  const item = id ? getReferenceById(referenceIndex, id) : undefined;
  const iframeSrc = item ? getIframeSrc(item) : null;

  if (!item) {
    return (
      <div className="ref-lab ref-lab--demo">
        <div className="ref-empty">
          <h2>Reference not found</h2>
          <p>No reference matches ID: {id}</p>
          <Link to="/reference-lab" className="ref-btn ref-btn--primary">
            Back to Reference Lab
          </Link>
        </div>
      </div>
    );
  }

  function copyToClipboard(text: string) {
    void navigator.clipboard.writeText(text);
  }

  return (
    <div className="ref-lab ref-lab--demo">
      <DemoToolbar
        preset={preset}
        onPresetChange={setPreset}
        iframeSrc={iframeSrc}
        onBack={() => navigate('/reference-lab')}
        onOpenLocal={
          item.localDemoPath
            ? () => window.open(item.localDemoPath, '_blank', 'noopener')
            : undefined
        }
        onOpenExternal={
          item.sourceUrl
            ? () => window.open(item.sourceUrl, '_blank', 'noopener')
            : undefined
        }
        onCopyPath={
          item.localSourcePath
            ? () => copyToClipboard(item.localSourcePath!)
            : undefined
        }
        onCopyId={() => copyToClipboard(item.id)}
        localSourcePath={item.localSourcePath}
        referenceId={item.id}
      />

      <div className="demo-layout">
        <DemoMetaPanel item={item} />
        <div className="demo-layout__preview">
          <DemoFrame item={item} iframeSrc={iframeSrc} preset={preset} />
          <DemoNotes item={item} />
        </div>
      </div>
    </div>
  );
}
