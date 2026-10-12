import { useEffect, useRef, useState } from 'react';
import { Network, PenLine } from 'lucide-react';

export default function NewMenu({ onNewMeshFlow }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function onPointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="settings-menu-wrap" ref={menuRef}>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        + New
      </button>
      {open && (
        <div className="settings-menu" role="menu">
          <button
            type="button"
            className="settings-item"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onNewMeshFlow();
            }}
          >
            <Network aria-hidden="true" />
            New MeshFlow
          </button>
          <a className="settings-item" role="menuitem" href="/meshwrite/new">
            <PenLine aria-hidden="true" />
            New MeshWrite
          </a>
        </div>
      )}
    </div>
  );
}
