const spec={
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "autosize": {
      "type": "none",
      "contains": "padding"
    },
    "padding": {
      "left": 20,
      "top": 20,
      "right": 20,
      "bottom": 20
    },
    "width": 640,
    "height": 400,
    "background": "white",
    "signals": [
      {
        "name": "minSteps",
        "value": 4
      },
      {
        "name": "radius",
        "update": "min(width, height)/2.5"
      },
      {
        "name": "factorCount",
        "update": "data('dataset').length"
      },
      {
        "name": "steps",
        "update": "factorCount*_enrich"
      },
      {
        "name": "minAngularStep",
        "update": "chartStyle == 'radar' ? 2*PI/minSteps : 2*PI/minSteps"
      },
      {
        "name": "angularStep",
        "update": "min(2 * PI / steps, minAngularStep)"
      },
      {
        "name": "startAngle",
        "value": 0
      },
      {
        "name": "endAngle",
        "update": "startAngle + (max(minSteps, steps)-1)*angularStep"
      },
      {
        "name": "selectedColor",
        "update": "data('maxValue')[0].max"
      },
      {
        "name": "mouthValue", 
        "update": "chartStyle == 'lollipop' ? 0 : data('maxValue')[0].min/3"
      },
      {
        "name": "globalColor",
        "value": "#11CEBD"
      },
      {
        "name": "vertexSize",
        "value": 20,
        "bind": {"input":"range", "min": 20, "max": 150, "step": 1}
      },
      {
        "name": "edgeSize",
        "value": 1
      },
      {
        "name": "chartStyle",
        "value": "stellar",
        "bind": {"input": "select","options": ["lollipop", "radar", "stellar"]}
      },
      {
        "name": "_enrich",
        "update": "chartStyle == 'radar' ? 1 : 2"
      }
    ],
    "data": [
      {
        "name": "dataset",
        "values": [
          {"Factor": "Drink Too Much", "Value": 10, "Global": 5, "Selected": 35},
          {"Factor": "Not Enough Sleep", "Value": 20, "Global": 30, "Selected": 20},
          {"Factor": "Eating Junk Food", "Value": 20, "Global": 10, "Selected": 20},
          {"Factor": "Lacking Exercise", "Value": 15, "Global": 40, "Selected": 15},
          {"Factor": "Watch Meme Too Often", "Value": 20, "Global": 25, "Selected": 20}
        ],
        "transform": [
          {
            "type": "collect",
            "sort": {
              "field": "Selected",
              "order": "descending"
            }
          }
        ]
      },
      {
        "name": "sorted_D",
        "source": "dataset",
        "transform": [
          {
            "type": "fold",
            "fields": [
              "Global",
              "Selected"
            ],
            "as": [
              "category",
              "value"
            ]
          },
          {
            "type": "formula",
            "as": "color",
            "expr": "datum['category'] === 'Global' ? globalColor : scale('color', datum['Value'])"
          }
        ]
      },
      {
        "name": "maxValue",
        "source": "sorted_D",
        "transform": [
          {
            "type": "aggregate",
            "fields": [
              "color",
              "value"
            ],
            "ops": [
              "max",
              "min"
            ],
            "as": [
              "max",
              "min"
            ]
          }
        ]
      },
      {
        "name": "dummyData",
        "transform": [
          {
            "type": "sequence",
            "start": 1,
            "stop": {
              "signal": "minSteps - factorCount + 1"
            }
          },
          {
            "type": "formula",
            "as": "Factor",
            "expr": "'_Dummy ' + datum.data"
          },
          {
            "type": "formula",
            "as": "value",
            "expr": "0"
          },
          {
            "type": "formula",
            "as": "category",
            "expr": "[\"Global\", \"Selected\"]"
          },
          {
            "type": "flatten",
            "fields": [
              "category"
            ],
            "as": [
              "category"
            ]
          }
        ]
      },
      {
        "name": "sorted",
        "source": ["sorted_D", "dummyData"],
        "transform": [
          {
            "type": "formula",
            "as": "value",
            "expr": "[datum.value, mouthValue]"
          },
          {
            "type": "formula",
            "as": "position",
            "expr": "[datum['Factor'], datum['Factor'] + \"_s\"]"
          },
          {
            "type": "formula",
            "as": "isMouth",
            "expr": "[false, true]"
          },
          {
            "type": "flatten", 
            "fields": [
              "value",
              "position",
              "isMouth"
            ],
            "as": [
              "value",
              "position",
              "isMouth"
            ]
          }
        ]
      },
      {
        "name": "final",
        "source": "sorted",
        "transform": [
          {
            "type": "filter",
            "expr": "chartStyle == 'radar' ? !datum['isMouth'] : true "
          }
        ]
      },
      {
        "name": "keys",
        "source": ["dataset", "dummyData"],
        "transform": [
          {
            "type": "aggregate",
            "groupby": [
              "Factor"
            ]
          },
          {
            "type": "formula",
            "expr": "indexof(datum.Factor, \"_Dummy\") ==0?0: 1",
            "as":"opacity"
          }
        ]
      },
      {
        "name": "keysForAngular",
        "source": ["final", "dummyData"],
        "transform": [
          {
            "type": "aggregate",
            "groupby": [
              "position"
            ]
          },
          {
            "type": "formula",
            "expr": "indexof(datum.position, \"_Dummy\") ==0?0: 1",
            "as":"opacity"
          }
        ]
      }
    ],
    "scales": [
      {
        "name": "angular",
        "type": "point",
        "range": {
          "signal": "[startAngle, endAngle]"
        },
  
        "domain": {
          "data": "keysForAngular",
          "field": "position"
        }
      },
      {
        "name": "radial",
        "type": "linear",
        "range": {
          "signal": "[0, radius]"
        },
        "zero": true,
        "nice": false,
        "domain": {
          "data": "final",
          "field": "value"
        },
        "domainMin": 0
      },
      {
        "name": "color",
        "type": "linear",
        "domain": [
          0,
          1
        ],
        "range": [
          "#30EA03",
          "#FF29FF"
        ]
      },
      {
        "name": "legendColor",
        "type": "ordinal",
        "domain": [
          "Global",
          "Selected"
        ],
        "range": [
          {
            "signal": "globalColor"
          },
          {
            "signal": "selectedColor"
          }
        ]
      }
    ],
    "legends": [
      {
        "fill": "legendColor",
        "orient": "top-left",
        "direction": "horizontal",
        "offset": -10,
        "encode": {
          "symbols": {
            "update": {
              "shape": {
                "value": "circle"
              },
              "size": {
                "value": 100
              }
            }
          },
          "labels": {
            "update": {
              "fontSize": {
                "value": 10
              }
            }
          }
        }
      }
    ],
    "marks": [
      {
        "type": "group",
        "name": "categories",
        "zindex": 1,
        "from": {
          "facet": {
            "data": "final",
            "name": "facet",
            "groupby": [
              "category"
            ]
          }
        },
        "encode": {
          "enter": {
            "x": {
              "signal": "width/2"
            },
            "y": {
              "signal": "height/2"
            }
          }
        },
        "marks": [
          {
            "type": "line",
            "name": "category-line",
            "from": {
              "data": "facet"
            },
            "encode": {
              "enter": {
                "interpolate": {
                  "value": "linear-closed"
                },
                "stroke": {
                  "field": "color"
                },
                "strokeWidth": {
                  "signal": "edgeSize"
                },
                "fill": {
                  "field": "color"
                },
                "fillOpacity": {
                  "value": 0.2
                }
              },
              "update":{
                "x": {
                  "signal": "scale('radial', datum.value) * cos(PI/2-scale('angular', datum.position))"
                },
                "y": {
                  "signal": "-scale('radial', datum.value) * sin(PI/2 - scale('angular', datum.position))"
                }
              }
            }
          },
          {
            "type": "symbol",
            "name": "vertex-symbol",
            "from": {
              "data": "facet"
            },
            "encode": {
              "enter": {
  
                "fill": {
                  "field": "color"
                },
                "shape": {
                  "value": "circle"
                },
                "tooltip": {
                  "signal": "datum"
                }
              },
            "update": {
                "size": {
                  "signal": "vertexSize"
                },
                "x": {
                  "signal": "scale('radial', datum.value) * cos(PI/2 - scale('angular', datum.position))"
                },
                "y": {
                  "signal": "-scale('radial', datum.value) * sin(PI/2 - scale('angular', datum.position))"
                },            
              "opacity": [
                {
                  "test": "datum.isMouth",
                  "value": 0
                },
                {
                  "value": 1
                }
              ]
            }
            }
          }
        ]
      },
      {
        "type": "rule",
        "name": "radial-grid",
        "from": {
          "data": "keys"
        },
        "zindex": 0,
        "encode": {
          "enter": {
            "x": {
              "signal": "width / 2"
            },
            "y": {
              "signal": "height / 2"
            },
            "x2": {
              "signal": "width / 2 + radius * cos(PI/2 - scale('angular', datum['Factor']))"
            },
            "y2": {
              "signal": "height / 2 - radius * sin(PI/2 - scale('angular', datum['Factor']))"
            },
            "stroke": {
              "value": "lightgray"
            },
            "strokeWidth": {
              "value": 1
            }
          }
        }
      },
      {
        "type": "text",
        "name": "key-label",
        "from": {
          "data": "keys"
        },
        "zindex": 1,
        "encode": {
          "enter": {
            "x": {
              "signal": "(width / 2 + (radius + 5) * cos(PI/2 - scale('angular', datum['Factor'])))"
            },
            "y": {
              "signal": "(height / 2 -(radius + 5) * sin(PI/2 - scale('angular', datum['Factor'])))"
            },
            "text": {
              "field": "Factor"
            },
            "align": [
              {
                "test": "abs(scale('angular', datum['Factor']) - PI / 2) > PI / 2",
                "value": "right"
              },
              {
                "value": "left"
              }
            ],
            "baseline": [
              {
                "test": "scale('angular', datum['Factor']) - PI / 2 > 0",
                "value": "top"
              },
              {
                "test": "scale('angular', datum['Factor']) - PI / 2 == 0",
                "value": "middle"
              },
              {
                "value": "bottom"
              }
            ],
            "fontSize": {
              "value": 10
            },
            "tooltip": {
              "signal": "datum"
            },
            "opacity": {
              "field": "opacity"
            }
          }
        }
      },
      {
        "type": "line",
        "name": "outer-line",
        "from": {
          "data": "radial-grid"
        },
        "encode": {
          "enter": {
            "interpolate": {
              "value": "linear-closed"
            },
            "x": {
              "field": "x2"
            },
            "y": {
              "field": "y2"
            },
            "stroke": {
              "value": "lightgray"
            },
            "strokeWidth": {
              "value": 1
            }
          }
        }
      }
    ]
  }
  vegaEmbed("#vis3", spec, {mode: "vega"}).then(console.log).catch(console.warn);