// Keep Mermaid source out of syntax highlighting and preserve a no-JS fallback.
export default function remarkMermaid() {
  return tree => {
    function visit(node) {
      if (node.type === "code" && node.lang === "mermaid") {
        const source = node.value
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;");
        node.type = "html";
        node.value = `<div class="mermaid-diagram"><pre>${source}</pre></div>`;
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
