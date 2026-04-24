# SRM Full Stack Engineering Challenge — BFHL

A REST API and frontend that processes hierarchical node relationships from edge strings.

## 🔗 Live Links

- **Backend API**: https://bajaj-7g3r.onrender.com
- **Frontend**: https://bajaj-cmmf.vercel.app/

## 📁 Project Structure

```
├── index.js        # Express backend — POST /bfhl
├── index.html      # Frontend single-page app
├── package.json    # Dependencies
└── README.md
```

## 🚀 API

### `POST /bfhl`

**Request**
```json
{
  "data": ["A->B", "A->C", "B->D", "X->Y", "Y->Z", "Z->X", "hello"]
}
```

**Response**
```json
{
  "user_id": "yourname_ddmmyyyy",
  "email_id": "you@srmist.edu.in",
  "college_roll_number": "RA2211003010001",
  "hierarchies": [
    {
      "root": "A",
      "tree": { "A": { "B": {}, "C": {} } },
      "depth": 2
    },
    {
      "root": "X",
      "tree": {},
      "has_cycle": true
    }
  ],
  "invalid_entries": ["hello"],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 1,
    "largest_tree_root": "A"
  }
}
```

## ⚙️ Processing Rules

- **Valid format**: `X->Y` where X and Y are single uppercase letters (A–Z)
- **Invalid entries**: self-loops, wrong separators, non-uppercase, empty strings, etc.
- **Duplicate edges**: only first occurrence is used; rest go to `duplicate_edges`
- **Cycle detection**: if a cycle exists, `tree: {}` and `has_cycle: true` is returned
- **Diamond/multi-parent**: first-encountered parent edge wins
- **Depth**: number of nodes on the longest root-to-leaf path
- **Largest tree**: tiebreaker is lexicographically smaller root

## 🛠 Tech Stack

- **Backend**: Node.js, Express, CORS
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Hosting**: Render (API), Vercel (Frontend)

## 💻 Run Locally

```bash
# Install dependencies
npm install

# Start server
node index.js
# Server runs on http://localhost:3000
```

Then open `index.html` in your browser and set the API URL to `http://localhost:3000`.
