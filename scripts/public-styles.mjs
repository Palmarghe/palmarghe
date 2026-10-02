import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

// These namespaces belong to Studio. Unknown or mixed rules remain untouched.
const studioClass = /^(admin-|studio-|editor-|content-editor-|classic-|ribbon-|media-cleanup-)/;

export function publicStyles(source) {
  const tree = postcss.parse(source);
  tree.walkRules(rule => {
    // Keep keyframes and nested CSS: selectors there have different semantics.
    let parent = rule.parent;
    while (parent) {
      if (parent.type === 'rule' || (parent.type === 'atrule' && /keyframes$/i.test(parent.name))) return;
      parent = parent.parent;
    }
    const selectors = selectorParser().astSync(rule.selector);
    const studioOnly = selectors.nodes.every(selector => selector.nodes.some(node =>
      (node.type === 'class' && studioClass.test(node.value)) ||
      (node.type === 'id' && node.value === 'block-editor')));
    if (studioOnly) rule.remove();
  });
  tree.walkAtRules(rule => {
    if (['media', 'supports'].includes(rule.name) && rule.nodes?.length === 0) rule.remove();
  });
  return tree.toString();
}

export default function publicStylesPlugin() {
  return {
    name: 'palmarghe-public-styles',
    enforce: 'pre',
    transform(source, id) {
      const normalized = id.replaceAll('\\', '/');
      if (!normalized.endsWith('/src/styles/global.css?public')) return;
      return { code: publicStyles(source), map: null };
    },
  };
}
