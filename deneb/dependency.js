const spec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "width": 640,
    "height": 400,
    "padding": 10,
    "signals": [
      {"name": "upRootX", "update": "data('up-root-node')[0].x"},
      {"name": "upRootY", "update": "data('up-root-node')[0].y"},
      {"name": "upRoot", "update": "data('up-root-node')[0]"},
      {"name": "downOffsetX", "update": "upRootX - data('down-root-node')[0].x"},
      {"name": "downOffsetY", "update": "upRootY - data('down-root-node')[0].y"}
    ],
    "data": [
      {"name": "dataset"},
      {
        "name": "upstream-data",
        "values": [
          {
            "id": 0,
            "name": "Engine",
            " parent": null,
            "group": 1,
            "y": 200,
            "x": 320,
            "depth": 0,
            "children": 2,
            "type": "up"
          },
          {
            "id": 1,
            "name": "Piston",
            "parent": 0,
            "group": 2,
            "y": 100,
            "x": 160,
            "depth": 1,
            "children": 1,
            "type": "up"
          },
          {
            "id": 2,
            "name": "Cylinder Block",
            "parent": 0,
            "group": 2,
            "y": 300,
            "x": 160,
            "depth": 1,
            "children": 1,
            "type": "up"
          },
          {
            "id": 3,
            "name": "Steel Rod",
            "parent": 1,
            "group": 3,
            "y": 100,
            "x": 0,
            "depth": 2,
            "children": 0,
            "type": "up"
          },
          {
            "id": 4,
            "name": "Aluminium Alloy",
            "parent": 2,
            "group": 3,
            "y": 300,
            "x": 0,
            "depth": 2,
            "children": 0,
            "type": "up"
          }
        ],
        "transform": [
          {"type": "stratify", "key": "id", "parentKey": "parent"},
          {
            "type": "tree",
            "method": "tidy",
            "size": [{"signal": "height"}, {"signal": "width/2"}],
            "separation": {"signal": "false"},
            "as": ["y", "x", "depth", "children"]
          },
          {"type": "formula", "as": "x", "expr": "width/2 - datum.x"},
          {"type": "formula", "as": "type", "expr": "\"up\""}
        ]
      },
      {
        "name": "up-root-node",
        "source": "upstream-data",
        "transform": [{"type": "filter", "expr": "datum.id==0"}]
      },
      {
        "name": "downstream-data",
        "values": [
          {
            "id": 0,
            "name": "Engine",
            " parent": null,
            "group": 1,
            "y": 200,
            "x": 320,
            "depth": 0,
            "children": 2,
            "type": "down"
          },
          {
            "id": 6,
            "name": "Car",
            "parent": 0,
            "group": 4,
            "y": 100,
            "x": 640,
            "depth": 1,
            "children": 0,
            "type": "down"
          },
          {
            "id": 7,
            "name": "Truck",
            "parent": 0,
            "group": 4,
            "y": 300,
            "x": 640,
            "depth": 1,
            "children": 0,
            "type": "down"
          }
        ],
        "transform": [
          {"type": "stratify", "key": "id", "parentKey": "parent"},
          {
            "type": "tree",
            "method": "tidy",
            "size": [{"signal": "height"}, {"signal": "width/2"}],
            "separation": {"signal": "false"},
            "as": ["y", "x", "depth", "children"]
          },
          {"type": "formula", "as": "x", "expr": "datum.x+width/2"},
          {"type": "formula", "as": "type", "expr": "\"down\""}
        ]
      },
      {
        "name": "down-root-node",
        "source": "downstream-data",
        "transform": [{"type": "filter", "expr": "datum.id==0"}]
      },
      {
        "name": "downstream-offseted",
        "source": "downstream-data",
        "transform": [
          {"type": "formula", "as": "y", "expr": "datum.y"},
          {"type": "formula", "as": "x", "expr": "datum.x"}
        ]
      },
      {
        "name": "upstream-links",
        "source": "upstream-data",
        "transform": [
          {"type": "treelinks"},
          {"type": "linkpath", "orient": "horizontal", "shape": "diagonal"}
        ]
      },
      {
        "name": "downstream-links",
        "source": "downstream-data",
        "transform": [
          {"type": "treelinks"},
          {"type": "linkpath", "orient": "horizontal", "shape": "diagonal"},
          {
            "type": "formula",
            "as": "source",
            "expr": "datum.source.id == 0 ? upRoot : datum.source"
          }
        ]
      },
      {
        "name": "downstream-remove-root",
        "transform": [{"type": "filter", "expr": "datum.id==0"}]
      },
      {
        "name": "overall-nodes",
        "source": ["downstream-data", "upstream-data"],
        "transform": [{"type": "collect"}]
      },
      {
        "name": "overall-links",
        "source": ["downstream-links", "upstream-links"],
        "transform": [{"type": "collect"}]
      }
    ],
    "scales": [
      {
        "name": "color",
        "type": "linear",
        "domain": {"data": "overall-nodes", "field": "depth"},
        "range": {"scheme": "magma"},
        "zero": true
      }
    ],
    "marks": [
      {
        "type": "path",
        "from": {"data": "overall-links"},
        "encode": {
          "update": {"path": {"field": "path"}, "stroke": {"value": "#ccc"}}
        }
      },
      {
        "type": "symbol",
        "from": {"data": "overall-nodes"},
        "encode": {
          "enter": {
            "size": {"value": 200},
            "stroke": {"value": "#fff"},
            "opacity": {"signal": "datum.type == 'down' && datum.id == 0 ? 0 : 1"}
          },
          "update": {
            "x": {"field": "x"},
            "y": {"field": "y"},
            "fill": {"scale": "color", "field": "depth"}
          }
        }
      },
      {
        "type": "text",
        "from": {"data": "overall-nodes"},
        "encode": {
          "enter": {
            "text": {"field": "name"},
            "fontSize": {"value": 9},
            "baseline": {"value": "middle"},
            "opacity": {"signal": "datum.type == 'down' && datum.id == 0 ? 0 : 1"}
          },
          "update": {
            "x": {"field": "x"},
            "y": {"field": "y"},
            "dx": {"signal": "datum.children ? -7 : 7"},
            "align": {"signal": "datum.children ? 'right' : 'left'"}
          }
        }
      }
    ],
    "config": {}
  };
      vegaEmbed("#vis", spec, {mode: "vega"}).then(console.log).catch(console.warn);