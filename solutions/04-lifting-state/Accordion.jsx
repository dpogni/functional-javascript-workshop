import { useState } from 'react';

export function AccordionItem({ title, content, isOpen, onToggle }) {
  return (
    <div>
      <button aria-expanded={isOpen ? 'true' : 'false'} onClick={() => onToggle()}>
        {title}
      </button>
      {isOpen && <div>{content}</div>}
    </div>
  );
}

export default function Accordion({ items }) {
  // One piece of state, owned by the parent, shared by all children.
  const [openId, setOpenId] = useState(null);

  return (
    <div>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          title={item.title}
          content={item.content}
          isOpen={item.id === openId}
          onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
        />
      ))}
    </div>
  );
}
