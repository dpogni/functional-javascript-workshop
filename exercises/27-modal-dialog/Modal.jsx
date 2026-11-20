// TODO: implement the modal described in README.md
// Tip: `import { createPortal } from 'react-dom';`
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
