import { importChange, importedNames, exportedNames } from './autoImport.js';

const applyChange = (doc, change) =>
  change ? doc.slice(0, change.from) + change.insert + doc.slice(change.to) : doc;
const add = (doc, name, source = 'react') => applyChange(doc, importChange(doc, name, source));

describe('auto-import edits', () => {
  test('adds a new import at the top of a file with no imports', () => {
    expect(add('export default function A() {}\n', 'useState')).toBe(
      "import { useState } from 'react';\n\nexport default function A() {}\n"
    );
  });

  test('puts the import above a leading comment, with a blank line', () => {
    expect(add('// TODO\nexport default 1;\n', 'useRef')).toBe(
      "import { useRef } from 'react';\n\n// TODO\nexport default 1;\n"
    );
  });

  test('works on an empty file', () => {
    expect(add('', 'useState')).toBe("import { useState } from 'react';\n");
  });

  test('merges into an existing import from the same module, keeping it sorted', () => {
    expect(add("import { useEffect, useState } from 'react';\n", 'useRef')).toBe(
      "import { useEffect, useRef, useState } from 'react';\n"
    );
  });

  test('appends when the existing names are not sorted', () => {
    expect(add("import { useState, useEffect } from 'react';\n", 'memo')).toBe(
      "import { useState, useEffect, memo } from 'react';\n"
    );
  });

  test('does nothing when the name is already imported', () => {
    const doc = "import { useState as useS, memo } from 'react';\n";
    expect(importChange(doc, 'memo', 'react')).toBeNull();
    expect(importChange(doc, 'useS', 'react')).toBeNull();
    expect(add(doc, 'useState')).toBe("import { useState as useS, memo, useState } from 'react';\n");
  });

  test('extends a default-only import', () => {
    expect(add("import React from 'react';\n", 'useState')).toBe("import React, { useState } from 'react';\n");
    expect(add("import React, { memo } from 'react';\n", 'useState')).toBe(
      "import React, { memo, useState } from 'react';\n"
    );
  });

  test('adds a separate line next to a namespace import', () => {
    expect(add("import * as React from 'react';\nconst a = 1;\n", 'useState')).toBe(
      "import * as React from 'react';\nimport { useState } from 'react';\nconst a = 1;\n"
    );
  });

  test('keeps a multi-line import multi-line', () => {
    expect(add("import {\n  useEffect,\n  useState\n} from 'react';\n", 'useRef')).toBe(
      "import {\n  useEffect,\n  useState,\n  useRef,\n} from 'react';\n"
    );
  });

  test('adds a different module after the last import, matching quote and semicolon style', () => {
    expect(add('import { useState } from "react"\n\nfunction Row() {}\n', 'trackRender', './renderTracker.js')).toBe(
      'import { useState } from "react"\nimport { trackRender } from "./renderTracker.js"\n\nfunction Row() {}\n'
    );
  });

  test('handles a last import with no trailing newline', () => {
    expect(add("import { memo } from 'react';", 'slowFilter', './slowFilter.js')).toBe(
      "import { memo } from 'react';\nimport { slowFilter } from './slowFilter.js';"
    );
  });

  test('importedNames sees default, namespace, named and aliased imports', () => {
    const doc = "import React, { useState, memo as m } from 'react';\nimport * as T from './t.js';\n";
    expect([...importedNames(doc)].sort()).toEqual(['React', 'T', 'm', 'useState']);
  });

  test('exportedNames lists a helper file\'s named exports', () => {
    expect(exportedNames('export function a() {}\nexport const b = 1;\nfunction c() {}')).toEqual(['a', 'b']);
  });
});
