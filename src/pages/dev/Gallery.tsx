import { Scene } from '@/components/domain';
import { HUE_ORDER } from '@/components/ui';
import { CATEGORY_SCENE, type SceneKey } from '@/constants/visuals';

/** Dev-only visual gallery of every illustrated scene (not routed in production builds). */
export default function Gallery() {
  const keys = [...new Set(Object.values(CATEGORY_SCENE)), 'pro'] as SceneKey[];
  return (
    <div className="container-page grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
      <h1 className="sr-only">Scenes</h1>
      {keys.map((k, i) => (
        <figure key={k} className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="aspect-[4/3]">
            <Scene scene={k} hue={HUE_ORDER[i % 6]} />
          </div>
          <figcaption className="p-2 text-caption">{k}</figcaption>
        </figure>
      ))}
    </div>
  );
}
