import { ReportHighlight } from "@/integrations/supabase/reportService";
import { toast } from "sonner";

/**
 * Creates a XPath for a node to store the exact location
 */
export const getXPathForElement = (element: Node): string => {
  if (!element || !element.nodeType) {
    return '';
  }
  
  // Special case for document
  if (element.nodeType === 9) {
    return '/';
  }
  
  // Use the element's ID if it has one
  if (element.nodeType === 1 && (element as Element).id) {
    return `//*[@id="${(element as Element).id}"]`;
  }
  
  // Initialize variables
  let path = '';
  let current: Node | null = element;
  let parent: Node | null = current.parentNode;
  
  // Build the XPath
  while (parent && parent.nodeType !== 9) {
    let index = 1;
    let sibling: Node | null = current.previousSibling;
    
    // Count siblings of the same type
    while (sibling) {
      if (sibling.nodeType === current.nodeType && 
          sibling.nodeName === current.nodeName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    
    // Build path component
    const nodeName = current.nodeName.toLowerCase();
    const pathComponent = `${nodeName}[${index}]`;
    path = path === '' ? pathComponent : `${pathComponent}/${path}`;
    
    // Move up to parent
    current = parent;
    parent = current.parentNode;
  }
  
  return `/${path}`;
};

/**
 * Gets an element from its XPath
 */
export const getElementFromXPath = (xpath: string): Node | null => {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue;
  } catch (e) {
    console.error('Error resolving XPath:', e);
    return null;
  }
};

/**
 * Function to apply a highlight from saved range information
 */
export const applyHighlightFromRange = (highlightData: ReportHighlight): boolean => {
  if (!highlightData.range) {
    console.warn("No range information available for highlight:", highlightData);
    return false;
  }
  
  try {
    const { startContainer, startOffset, endContainer, endOffset } = highlightData.range;
    const startNode = getElementFromXPath(startContainer);
    const endNode = getElementFromXPath(endContainer);
    
    if (!startNode || !endNode) {
      console.warn("Could not find nodes from XPath for highlight:", highlightData);
      return false;
    }
    
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    
    // Create and apply the highlight
    const span = document.createElement('span');
    span.id = highlightData.id;
    span.className = 'highlighted-text';
    span.style.backgroundColor = highlightData.color;
    
    try {
      range.surroundContents(span);
      console.log(`Applied highlight from range: ${highlightData.id}`);
      return true;
    } catch (e) {
      console.error("Failed to apply highlight from range:", e);
      return false;
    }
  } catch (error) {
    console.error("Error applying highlight from range:", error);
    return false;
  }
};

/**
 * Function to create and store a range information from selection
 */
export const saveRangeInfo = (range: Range): {
  startContainer: string;
  startOffset: number;
  endContainer: string;
  endOffset: number;
} | undefined => {
  try {
    const startXPath = getXPathForElement(range.startContainer);
    const endXPath = getXPathForElement(range.endContainer);
    
    if (!startXPath || !endXPath) {
      console.error("Failed to create XPath for selection");
      return undefined;
    }
    
    return {
      startContainer: startXPath,
      startOffset: range.startOffset,
      endContainer: endXPath,
      endOffset: range.endOffset
    };
  } catch (error) {
    console.error("Failed to save range information:", error);
    return undefined;
  }
};

/**
 * Function to restore highlights by text content (fallback method)
 */
export const restoreHighlightByText = (
  container: Node, 
  highlight: ReportHighlight
): boolean => {
  if (!highlight.text) {
    console.warn(`Missing text content for highlight ${highlight.id}`);
    return false;
  }
  
  if (container.nodeType === Node.TEXT_NODE && container.textContent) {
    const text = container.textContent;
    const index = text.indexOf(highlight.text);
    
    if (index !== -1) {
      try {
        const range = document.createRange();
        range.setStart(container, index);
        range.setEnd(container, index + highlight.text.length);
        
        const span = document.createElement('span');
        span.id = highlight.id;
        span.className = 'highlighted-text';
        span.style.backgroundColor = highlight.color || '#ffff00';
        
        range.surroundContents(span);
        console.log(`Restored highlight by text: ${highlight.id}`);
        return true;
      } catch (e) {
        console.warn(`Failed to restore highlight ${highlight.id} by text:`, e);
        return false;
      }
    }
  } else if (container.nodeType === Node.ELEMENT_NODE) {
    // Skip any existing highlight spans to avoid nesting issues
    if ((container as Element).classList?.contains('highlighted-text')) {
      return false;
    }
    
    for (let i = 0; i < container.childNodes.length; i++) {
      const success = restoreHighlightByText(container.childNodes[i], highlight);
      if (success) return true;
    }
  }
  return false;
};

/**
 * Function to add highlight styles to the document
 */
export const addHighlightStyles = () => {
  if (!document.getElementById('highlight-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'highlight-styles';
    styleEl.innerHTML = `
      .highlighted-text {
        background-color: #ffff00;
        color: #000000 !important;
        border-radius: 2px;
        padding: 0 1px;
        margin: 0 1px;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
      }
      .highlighted-text * {
        color: #000000 !important;
      }
      .highlight-yellow { background-color: #ffff00; }
      .highlight-green { background-color: #a7f3d0; }
      .highlight-blue { background-color: #93c5fd; }
      .highlight-pink { background-color: #f9a8d4; }
    `;
    document.head.appendChild(styleEl);
  }
};

/**
 * Function to remove highlight styles from the document
 */
export const removeHighlightStyles = () => {
  const styleEl = document.getElementById('highlight-styles');
  if (styleEl) styleEl.remove();
};
