import { useState } from 'react';

const isFolder = (node) => Array.isArray(node.children);

// Folders first, then files; alphabetical, ignoring case. Sorts a copy.
function sortNodes(nodes) {
  return [...nodes].sort(
    (a, b) =>
      Number(isFolder(b)) - Number(isFolder(a)) ||
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}

function Node({ node, path, expanded, toggle }) {
  if (!isFolder(node)) {
    return (
      <li>
        <span aria-hidden="true">📄 </span>
        {node.name}
      </li>
    );
  }

  const open = expanded.has(path);
  return (
    <li>
      <button aria-expanded={open ? 'true' : 'false'} onClick={() => toggle(path)}>
        <span aria-hidden="true">{open ? '📂 ' : '📁 '}</span>
        {node.name}
      </button>
      {open && (
        <ul>
          {node.children.length === 0 ? (
            <li>(empty)</li>
          ) : (
            sortNodes(node.children).map((child) => (
              <Node
                key={child.name}
                node={child}
                path={`${path}/${child.name}`}
                expanded={expanded}
                toggle={toggle}
              />
            ))
          )}
        </ul>
      )}
    </li>
  );
}

export default function FileExplorer({ tree }) {
  // Lives at the top, so folders that unmount (because a parent collapsed)
  // don't lose whether they were open.
  const [expanded, setExpanded] = useState(() => new Set());

  const toggle = (path) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  return (
    <section>
      <ul aria-label="Files" style={{ listStyle: 'none', paddingLeft: 0 }}>
        {sortNodes(tree).map((node) => (
          <Node key={node.name} node={node} path={node.name} expanded={expanded} toggle={toggle} />
        ))}
      </ul>
    </section>
  );
}
