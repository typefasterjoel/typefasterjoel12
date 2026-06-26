import { useEffect, useRef } from "react";
import type { SideRaysConfig } from "#/lib/side-rays-field";
import { prefersReducedMotion } from "#/lib/motion";

type Field = { cleanup: () => void; update: (cfg: SideRaysConfig) => void };

interface SideRaysProps extends SideRaysConfig {}

export function SideRays(props: SideRaysProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<Field | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const container = ref.current;
    if (!container || prefersReducedMotion()) return;

    let disposed = false;

    import("#/lib/side-rays-field")
      .then(({ createSideRaysField }) => {
        if (disposed || !container) return;
        fieldRef.current = createSideRaysField(container, propsRef.current);
      })
      .catch(() => {});

    const onScroll = () => {
      const t = Math.min(1, window.scrollY / window.innerHeight);
      container.style.opacity = String(1 - t);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      fieldRef.current?.cleanup();
      fieldRef.current = null;
    };
  }, []);

  useEffect(() => {
    fieldRef.current?.update(props);
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="side-rays"
    />
  );
}
