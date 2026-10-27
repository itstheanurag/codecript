import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, placeholder } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { PostgreSQL, sql } from "@codemirror/lang-sql";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  minHeight?: string;
  height?: string;
  ariaLabel?: string;
  placeholder?: string;
}

const playgroundTheme = EditorView.theme({
  "&": {
    fontSize: "13px",
    backgroundColor: "transparent",
    height: "100%",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily:
      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
    lineHeight: "1.6",
    overflow: "auto",
  },
  ".cm-content": { padding: "10px 0", caretColor: "#2f3e46" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
    color: "rgba(90, 90, 82, 0.55)",
    paddingRight: "6px",
  },
  ".cm-activeLine": { backgroundColor: "rgba(0, 0, 0, 0.03)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(64, 121, 109, 0.18) !important",
  },
  ".cm-tooltip": {
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: "6px",
    backgroundColor: "#fdfcf8",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
  },
});

const schema = {
  users: ["id", "email", "full_name", "country", "created_at"],
  products: ["id", "name", "category", "price_cents", "in_stock"],
  orders: ["id", "user_id", "status", "placed_at", "total_cents"],
  order_items: [
    "id",
    "order_id",
    "product_id",
    "quantity",
    "unit_price_cents",
  ],
  employees: [
    "id",
    "full_name",
    "department",
    "manager_id",
    "salary_cents",
    "hired_at",
  ],
};

const SqlEditor = ({
  value,
  onChange,
  onRun,
  minHeight = "220px",
  height,
  ariaLabel = "SQL editor",
  placeholder: placeholderText,
}: SqlEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);

  onChangeRef.current = onChange;
  onRunRef.current = onRun;

  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          keymap.of([
            {
              key: "Mod-Enter",
              preventDefault: true,
              run: () => {
                onRunRef.current();
                return true;
              },
            },
          ]),
          basicSetup,
          sql({ dialect: PostgreSQL, schema, upperCaseKeywords: true }),
          playgroundTheme,
          ...(placeholderText ? [placeholder(placeholderText)] : []),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // The editor is created once; external updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={height ? { height } : { minHeight }}
      className="overflow-hidden bg-paper-50/60"
    />
  );
};

export default SqlEditor;
