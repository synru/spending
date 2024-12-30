const spec ={
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "width": 640,
    "height": 400,
    "padding": 10,
    "background": "white",
  
    "signals": [
      { "name": "cx", "update": "width / 2" },
      { "name": "cy", "update": "height / 2" },
      { "name": "nodeRadius", "value": 18},
      { "name": "nodeCharge", "value": -30},
      { "name": "linkDistance", "value": 60},
      { "name": "static", "value": true},
      {
        "description": "State variable for active node fix status.",
        "name": "fix", "value": false,
        "on": [
          {
            "events": "symbol:pointerout[!event.buttons], window:pointerup",
            "update": "false"
          },
          {
            "events": "symbol:pointerover",
            "update": "fix || true"
          },
          {
            "events": "[symbol:pointerdown, window:pointerup] > window:pointermove!",
            "update": "xy()",
            "force": true
          }
        ]
      },
      {
        "description": "Graph node most recently interacted with.",
        "name": "node", "value": null,
        "on": [
          {
            "events": "symbol:pointerover",
            "update": "fix === true ? item() : node"
          }
        ]
      },
      {
        "description": "Flag to restart Force simulation upon data changes.",
        "name": "restart", "value": false,
        "on": [
          {"events": {"signal": "fix"}, "update": "fix && fix.length"}
        ]
      }
    ],
    "data": [
      {
        "name": "node-data",
        "values": [
          {"name": "A", "group": 1, "index":0},
          {"name": "B", "group": 2, "index":1},
          {"name": "C", "group": 2, "index":2},
          {"name": "D", "group": 3, "index":3},
          {"name": "E", "group": 3, "index":4},
          {"name": "F", "group": 2, "index":5}
        ]
      },
      {
        "name": "link-data",
        "values": [
          {"source": 1, "target": 0, "value": 1},
          {"source": 2, "target": 0, "value": 1},
          {"source": 3, "target": 1, "value": 1},
          {"source": 5, "target": 0, "value": 1},
          {"source": 4, "target": 2, "value": 1}
        ]
      }
    ],
  
    "scales": [
      {
        "name": "color",
        "type": "ordinal",
        "domain": {"data": "node-data", "field": "group"},
        "range": {"scheme": "category20c"}
      }
    ],
  
    "marks": [
      {
        "name": "nodes",
        "type": "symbol",
        "zindex": 1,
  
        "from": {"data": "node-data"},
        "on": [
          {
            "trigger": "fix",
            "modify": "node",
            "values": "fix === true ? {fx: node.x, fy: node.y} : {fx: fix[0], fy: fix[1]}"
          },
          {
            "trigger": "!fix",
            "modify": "node", "values": "{fx: null, fy: null}"
          }
        ],
  
        "encode": {
          "enter": {
            "fill": {"scale": "color", "field": "group"},
            "stroke": {"value": "white"}
          },
          "update": {
            "size": {"signal": "2 * nodeRadius * nodeRadius"},
            "cursor": {"value": "pointer"}
          }
        },
  
        "transform": [
          {
            "type": "force",
            "iterations": 300,
            "restart": {"signal": "restart"},
            "static": {"signal": "static"},
            "signal": "force",
            "forces": [
              {"force": "center", "x": {"signal": "cx"}, "y": {"signal": "cy"}},
              {"force": "collide", "radius": {"signal": "nodeRadius"}},
              {"force": "nbody", "strength": {"signal": "nodeCharge"}},
              {"force": "link", "links": "link-data", "distance": {"signal": "linkDistance"}}
            ]
          }
        ]
      },
      {
        "type": "path",
        "from": {"data": "link-data"},
        "name": "test",
        "interactive": false,
        "encode": {
          "update": {
            "stroke": {"value": "#ccc"},
            "strokeWidth": {"value": 0.5}
          }
        },
        "transform": [
          {
            "type": "linkpath",
            "require": {"signal": "force"},
            "shape": "line",
            "sourceX": "datum.source.x", "sourceY": "datum.source.y",
            "targetX": "datum.target.x", "targetY": "datum.target.y"
          }
        ]
      },
      {
        "type": "symbol",
        "from": { "data": "link-data" },
        "encode": {
          "enter": {
            "shape": { "value": "triangle" },
            "size": { "value": 50 }
          },
          "update": {
            "x": {
              "signal": "force && isNumber(datum.target.x) && isNumber(datum.source.x)\n  ? datum.target.x - (datum.target.x - datum.source.x)\n      / hypot(datum.target.x - datum.source.x, datum.target.y - datum.source.y)\n      * (nodeRadius + 4)\n  : 0"
            },
            "y": {
              "signal": "force && isNumber(datum.target.y) && isNumber(datum.source.y)  ? datum.target.y - (datum.target.y - datum.source.y)\n      / hypot(datum.target.x - datum.source.x, datum.target.y - datum.source.y)\n      * (nodeRadius + 4)\n  : 0"
            },
            "angle": {
              "signal": "force && isNumber(datum.target.x) && isNumber(datum.source.x)\n  && isNumber(datum.target.y) && isNumber(datum.source.y)\n  ? (atan2(datum.target.y - datum.source.y, datum.target.x - datum.source.x)\n     * 180 / PI) + 90\n  : 0"
            }
          }
        }
      }
  
    ]
  }
  vegaEmbed("#vis2", spec, {mode: "vega"}).then(console.log).catch(console.warn);