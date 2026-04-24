const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const USER_ID = "AahaanSethi_28042005";        
const EMAIL_ID = "as9977@srmist.edu.in";       
const ROLL_NUMBER = "RA2311003010200";     



function isValid(entry) {
  return /^[A-Z]->[A-Z]$/.test(entry);
}


function buildHierarchies(edges) {

  const children = {};  
  const parentOf = {};
  const allNodes = new Set();

  for (const edge of edges) {
    const [parent, child] = edge.split('->');
    allNodes.add(parent);
    allNodes.add(child);

    if (!children[parent]) children[parent] = [];
    if (parentOf[child] === undefined) {
      parentOf[child] = parent;
      children[parent].push(child);
    }
  }

 
  const roots = [...allNodes].filter(n => parentOf[n] === undefined);

  const adj = {};
  for (const n of allNodes) adj[n] = new Set();
  for (const edge of edges) {
    const [p, c] = edge.split('->');
    adj[p].add(c);
    adj[c].add(p);
  }

  const visited = new Set();
  const groups = [];

  function bfsGroup(start) {
    const group = new Set();
    const queue = [start];
    while (queue.length) {
      const node = queue.shift();
      if (group.has(node)) continue;
      group.add(node);
      for (const nb of (adj[node] || [])) {
        if (!group.has(nb)) queue.push(nb);
      }
    }
    return group;
  }

  for (const node of allNodes) {
    if (!visited.has(node)) {
      const group = bfsGroup(node);
      for (const n of group) visited.add(n);
      groups.push(group);
    }
  }

  const hierarchies = [];

  for (const group of groups) {
 
    const groupRoots = [...group].filter(n => parentOf[n] === undefined);
    let root;

    if (groupRoots.length > 0) {
    
      root = groupRoots.sort()[0];
    } else {

      root = [...group].sort()[0];
    }

  
    function hasCycle(node, path = new Set()) {
      if (path.has(node)) return true;
      path.add(node);
      for (const child of (children[node] || [])) {
        if (group.has(child) && hasCycle(child, new Set(path))) return true;
      }
      return false;
    }


    let cycleFound = false;
    for (const node of group) {
      if (hasCycle(node)) { cycleFound = true; break; }
    }

    if (cycleFound) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {

      function buildTree(node) {
        const obj = {};
        for (const child of (children[node] || [])) {
          if (group.has(child)) obj[child] = buildTree(child);
        }
        return obj;
      }

     
      function calcDepth(node) {
        const kids = (children[node] || []).filter(c => group.has(c));
        if (kids.length === 0) return 1;
        return 1 + Math.max(...kids.map(calcDepth));
      }

      const tree = { [root]: buildTree(root) };
      const depth = calcDepth(root);
      hierarchies.push({ root, tree, depth });
    }
  }

 
  hierarchies.sort((a, b) => {
    if (a.has_cycle && !b.has_cycle) return 1;
    if (!a.has_cycle && b.has_cycle) return -1;
    return a.root.localeCompare(b.root);
  });

  return hierarchies;
}

app.post('/bfhl', (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'data must be an array' });
  }

  const invalid_entries = [];
  const duplicate_edges = [];
  const seenEdges = new Set();
  const validEdges = [];

  for (let raw of data) {
    const entry = String(raw).trim();

    if (!isValid(entry)) {
      invalid_entries.push(raw);
      continue;
    }

   
    const [p, c] = entry.split('->');
    if (p === c) { invalid_entries.push(raw); continue; }

    if (seenEdges.has(entry)) {
     
      if (!duplicate_edges.includes(entry)) duplicate_edges.push(entry);
    } else {
      seenEdges.add(entry);
      validEdges.push(entry);
    }
  }

  const hierarchies = buildHierarchies(validEdges);


  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclic = hierarchies.filter(h => h.has_cycle);
  const total_trees = nonCyclic.length;
  const total_cycles = cyclic.length;

  let largest_tree_root = '';
  if (nonCyclic.length > 0) {
    const best = nonCyclic.reduce((acc, cur) => {
      if (cur.depth > acc.depth) return cur;
      if (cur.depth === acc.depth && cur.root < acc.root) return cur;
      return acc;
    });
    largest_tree_root = best.root;
  }

  res.json({
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: ROLL_NUMBER,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: { total_trees, total_cycles, largest_tree_root }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
