// Copyright 2014 The Cayley Authors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

$(function () {
    $("#sbVisualize").addClass("active");
// make sure the user sees javascript errors
    window.onerror = function (msg) {
        alert(msg);
    };

    var createGraphVisualization = function (results) {
        if (window.sigmaGraph !== undefined) {
            sigmaGraph.stopForceAtlas2();
            sigma.plugins.killDragNodes(sigmaGraph.renderers[0]);
            sigmaGraph.kill();
            $("#visualize").text("")
        }
        var nodeMap = {}
        var g = {nodes: [], edges: []}
        for (var i = 0; i < results.length; i++) {
            result = results[i];
            source = result["source"];
            target = result["target"];
            edge = result["edge"];
            var source_color
            var target_color
            if (result["source_color"] != undefined) {
                source_color = result["source_color"]
            } else {
                //source_color = "#2c3e50"
                source_color = "#001B8A"
            }
            if (result["target_color"] != undefined) {
                target_color = result["target_color"]
            } else {
                target_color = "#F09300"
            }
            if (nodeMap[source] !== true) {
                var data = {
                    id: source,
                    x: Math.random(),
                    y: Math.random(),
                    size: 10,
                    color: source_color

                }
                if (result["source_label"] != undefined) {
                    data.label = result["source_label"]
                } else {
                    data.label = source
                }
                g.nodes.push(data)
                nodeMap[source] = true
            }
            if (nodeMap[target] !== true) {
                var data = {
                    id: target,
                    x: Math.random(),
                    y: Math.random(),
                    size: 10,
                    color: target_color
                }
                if (result["target_label"] != undefined) {
                    data.label = result["target_label"]
                } else {
                    data.label = target
                }
                g.nodes.push(data)
                nodeMap[target] = true
            }
            g.edges.push({
                id: "e" + i,
                source: source,
                target: target,
                label: edge,
                size: 5,
                color: '#ccc',
                // type: ['line', 'curve', 'arrow', 'curvedArrow'][Math.random() * 4 | 0]
            })

        }
        sigmaGraph = new sigma({
            graph: g,
            renderer: {
                container: document.getElementById('visualize'),
                type: 'canvas'
            },
            settings: {
                defaultNodeColor: '#ec5148',
                edgeLabelSize: 'proportional',
            }

        });
        sigma.plugins.dragNodes(sigmaGraph, sigmaGraph.renderers[0]);

        // Configure the algorithm
        sigmaGraph.configNoverlap({
            nodeMargin: 1.0,
            scaleNodes: 5,
            maxIterations: 1000,
        });

        sigmaGraph.startNoverlap();
        // sigmaGraph.startForceAtlas2({
        //     linLogMode: true,
        // });

    }

    $("#run_button").click(function () {
        var data = editor.getValue()
        if (data.indexOf("target") == -1 || data.indexOf("source") == -1) {
            alert('Query should have Tag("source") and Tag("target") to be able to visualize')
            return;
        }
        animate();
        $.post("/api/v1/query/" + selectedQueryLanguage, data)
            .done(function (return_data) {
                stopAndReset();
                if (typeof (Storage) !== "undefined") {
                    localStorage.setItem("cayleySavedQueries" + selectedQueryLanguage, data)
                }
                links = $.parseJSON(return_data)
                createGraphVisualization(links.result)
            })
            .fail(function () {
                stopAndReset();
            });
    });
})
