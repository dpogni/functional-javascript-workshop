import { useRef, useState } from 'react';

export default function Tabs({ tabs }) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef([]);

  const select = (index) => {
    setSelected(index);
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      select((index + 1) % tabs.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      select((index - 1 + tabs.length) % tabs.length);
    }
  };

  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            role="tab"
            ref={(el) => (tabRefs.current[i] = el)}
            aria-selected={i === selected ? 'true' : 'false'}
            tabIndex={i === selected ? 0 : -1}
            onClick={() => setSelected(i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{tabs[selected]?.content}</div>
    </div>
  );
}
